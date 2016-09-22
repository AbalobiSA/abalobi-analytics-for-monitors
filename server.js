var dbSecrets = require('./server-secrets')
var express = require('express'),
cors = require('cors'),
extend = require("extend")
app = express();
app.use(express.static('www'));
app.set('port', process.env.PORT || 5001);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
})

var jwt = require('express-jwt');

var authenticate = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});

app.use(cors());

//secure GET API
//app.use('/api/get', authenticate)

var pg = require('pg')
var DATABASE_URL=dbSecrets.DB_URL;

var merge = require('merge')

app.get('/api/get', function(req, res){
    pg.defaults.ssl = dbSecrets.useSSL;
    pg.connect(DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting schemas...');

        var rows = [];
        // rows.subrow = {}
        var row_count = 0;
        var query = null;// =  client.query('SELECT * FROM salesforce.ablb_monitor_log__c')

        //Global query limt
        queryLimit = 150;

        console.log(req.query);

        // ========  QUERY DEFINITIONS ==========

        //TODO: Adjust all LIMIT clauses, but don't remove completely.

        //NB: 3 hours are added to the date because when results are sent back
        // the time is pulled back by 2 due to timezone changes

        /*  OLD, unused - by Eduardo before DB tables changed
        if (req.query.id == "query_boat_list"){
            console.log("query boat");
            query =  client.query('SELECT DISTINCT boat_name__c, skipper__c, ' +
            'boat_reg__c, abalobi_boat_id__c, num_crew__c, boat_role__c ' +
            'FROM salesforce.monitor_boat__c WHERE boat_name__c IS NOT NULL LIMIT 50;');
        }
        */

        //TODO: NOte that either main_fisher_id__c (abalobi-registered fisher) OR main_fisher_other__c (non-registered) will be populated, not both)
        //TODO: Change INNER JOIN to link on odk_uuid__c instead of sfid (sfids are just linked using odk_uuid in salesforce)
        if (req.query.id == "total_species_weight_by_month"){
            if(req.query.param == "weight_total"){
                columnName = "weight_kg__c";
            }else if (req.query.param == "numbers_total") {
                columnName = "num_items__c";
            }
            query =  client.query(
                "SELECT date_trunc('month', odk_date__c)+ interval '3 hours' AS year_month, "+
                "species__c, landing_site__c, SUM("+columnName+") as "+req.query.param+" "+
                "FROM salesforce.ablb_monitor_catch__c "+
                "INNER JOIN salesforce.ablb_monitor_trip__c "+
                "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c "+
                "INNER JOIN salesforce.ablb_monitor_day__c "+
                "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c "+
                "WHERE "+columnName+" IS NOT NULL "+
                "GROUP BY year_month, landing_site__c, species__c "+
                "ORDER BY year_month, landing_site__c, species__c DESC LIMIT "+queryLimit+";"
            );
        }

        else if (req.query.id == "total_species_weight_by_month_by_boat_type"){
            if(req.query.param == "weight_total"){
                columnName = "weight_kg__c";
            }else if (req.query.param == "numbers_total") {
                columnName = "num_items__c";
            }
            query =  client.query(
                "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, landing_site__c, "+
                "species__c, coalesce(boat_type__c, 'unknown') as boat_type,  "+
                "SUM("+columnName+") as "+req.query.param+" FROM salesforce.ablb_monitor_catch__c "+
                "INNER JOIN salesforce.ablb_monitor_trip__c "+
                "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c "+
                "INNER JOIN salesforce.ablb_monitor_day__c "+
                "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c "+
                "WHERE "+columnName+" IS NOT NULL "+
                "GROUP BY landing_site__c, year_month, species__c, boat_type__c "+
                "ORDER BY landing_site__c, year_month, species__c, boat_type__c LIMIT "+queryLimit+";"
            );
        }


        else if (req.query.id == "total_boat_types_by_month"){
            //TODO: NOte that either main_fisher_id__c (abalobi-registered fisher) OR main_fisher_other__c (non-registered) will be populated, not both)
            query =  client.query(
                "SELECT date_trunc('month', odk_date__c)+interval '3 hour' AS year_month, "+
                "landing_site__c, coalesce(boat_type__c, 'unknown') as boat_type, COUNT(*) "+
                "FROM salesforce.ablb_monitor_trip__c "+
                "INNER JOIN salesforce.ablb_monitor_day__c ON "+
                "salesforce.ablb_monitor_trip__c.parent_day__c = salesforce.ablb_monitor_day__c.sfid "+
                "GROUP BY year_month, landing_site__c, boat_type__c "+
                "ORDER BY year_month, landing_site__c LIMIT "+queryLimit+";"
            );
        }

        else if(req.query.id == "submissions_by_month_by_location"){
            query = client.query(
                "SELECT date_trunc('month', odk_date__c)+interval '3 hour' AS year_month, landing_site__c, COUNT(*) "+
                "FROM salesforce.ablb_monitor_day__c "+
                "GROUP BY year_month, landing_site__c "+
                "ORDER BY year_month, landing_site__c LIMIT "+queryLimit+";"
            );
        }

        /* TODO: This query returns too many rows (6000+)
                 Modify to only return what is needed immediately (e.g. use sum/count SQL functions ) */
        else if(req.query.id == "samples_query"){
            if(req.query.param == "weight_avg"){
                columnName = "salesforce.ablb_monitor_sample__c.weight_kg__c";
            }else if (req.query.param == "length_avg") {
                columnName = "salesforce.ablb_monitor_sample__c.length_cm__c";
            }
            query = client.query(
                "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, "+
                "landing_site__c, salesforce.ablb_monitor_sample__c.species__c, "+
                "AVG("+columnName+") as "+req.query.param+" "+
                "FROM salesforce.ablb_monitor_sample__c "+
                "INNER JOIN salesforce.ablb_monitor_catch__c "+
                "ON salesforce.ablb_monitor_catch__c.odk_uuid__c = salesforce.ablb_monitor_sample__c.odk_parent_uuid__c "+
                "INNER JOIN salesforce.ablb_monitor_trip__c "+
                "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c "+
                "INNER JOIN salesforce.ablb_monitor_day__c "+
                "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c "+
                "WHERE "+columnName+" > 0 "+
                "GROUP BY landing_site__c, year_month, salesforce.ablb_monitor_sample__c.species__c "+
                "ORDER BY landing_site__c, year_month, salesforce.ablb_monitor_sample__c.species__c DESC "+
                "LIMIT "+queryLimit+";"
            );
        }

        // ========  END OF QUERY DEFINITIONS ==========
        var DEBUG_LOG_SQL = process.env.DEBUG_LOG_SQL;

        query.on('row', function(row) {
            if (DEBUG_LOG_SQL==true) {
                console.log("start" +JSON.stringify(rows, null ,2))
            }
            rows[row_count] = row
            row_count = row_count + 1;
            if (DEBUG_LOG_SQL==true) {
                console.log("end" +JSON.stringify(rows, null, 2))
            }
        })
        query.on('end', function(result) {

            if (DEBUG_LOG_SQL==true) {
                console.log(rows);
            }
            console.log("######################## returning "+rows.length+" rows");
            res.json(rows)
        })

    })
})
