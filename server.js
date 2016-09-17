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

        console.log("##query");
        console.log(req.query);

        if (req.query.id == "query_boat_list"){
            console.log("query boat");
            query =  client.query('SELECT DISTINCT boat_name__c, skipper__c, ' +
            'boat_reg__c, abalobi_boat_id__c, num_crew__c, boat_role__c ' +
            'FROM salesforce.ablb_monitor_trip__c WHERE boat_name__c IS NOT NULL;');
        }

        if (req.query.id == "total_species_weight_by_month"){
            console.log("##catch data");
            query =  client.query('SELECT odk_date__c, species__c, weight_kg__c, '+
            'num_items__c, bait__c, odk_catch_instance__c, main_fisher_name__c, ' +
            'landing_site__c, geo_lat__c, geo_lon__c ' +
            'FROM salesforce.ablb_monitor_catch__c '+
            'INNER JOIN salesforce.ablb_monitor_trip__c ' +
            'ON salesforce.ablb_monitor_catch__c.parent_trip__c = salesforce.ablb_monitor_trip__c.sfid ' +
            'INNER JOIN salesforce.ablb_monitor_day__c ON salesforce.ablb_monitor_trip__c.parent_day__c = salesforce.ablb_monitor_day__c.sfid;');
        }

        if (req.query.id == "total_species_weight_by_month_by_boat_type"){
            query =  client.query('SELECT odk_date__c, species__c, weight_kg__c, '+
            'num_items__c, bait__c, odk_catch_instance__c, main_fisher_name__c, '+
            'landing_site__c, geo_lat__c, geo_lon__c, boat_role__c ' +
            'FROM salesforce.ablb_monitor_catch__c '+
            'INNER JOIN salesforce.ablb_monitor_trip__c '+
            'ON salesforce.ablb_monitor_catch__c.parent_trip__c = salesforce.ablb_monitor_trip__c.sfid '+
            'INNER JOIN salesforce.ablb_monitor_day__c '+
            'ON salesforce.ablb_monitor_trip__c.parent_day__c = salesforce.ablb_monitor_day__c.sfid '+
            'INNER JOIN salesforce.ablb_monitor_trip__c '+
            'ON salesforce.ablb_monitor_trip__c.parent_trip__c = salesforce.ablb_monitor_trip__c.sfid;');
        }

        if (req.query.id == "total-boat-types-by-month"){
            query =  client.query('SELECT odk_date__c, main_fisher_name__c, '+
            'boat_name__c, boat_role__c, landing_site__c, geo_lat__c, '+
            'geo_lon__c, num_boats_local__c, num_boats_ski__c, '+
            'num_boats_sport__c FROM salesforce.ablb_monitor_trip__c '+
            'INNER JOIN salesforce.ablb_monitor_trip__c ON '+
            'salesforce.ablb_monitor_trip__c.parent_trip__c = salesforce.ablb_monitor_trip__c.sfid '+
            'INNER JOIN salesforce.ablb_monitor_day__c ON '+
            'salesforce.ablb_monitor_trip__c.parent_day__c = salesforce.ablb_monitor_day__c.sfid;');
        }

        if(req.query.id == "submissions_by_month_by_location"){
            query = client.query('SELECT odk_date__c, landing_site__c '+
            'FROM salesforce.ablb_monitor_trip__c '+
            'INNER JOIN salesforce.ablb_monitor_day__c '+
            'ON salesforce.ablb_monitor_trip__c.parent_day__c = salesforce.ablb_monitor_day__c.sfid;');
        }

        if(req.query.id == "samples_query"){
            query = client.query('SELECT odk_date__c, landing_site__c, salesforce.ablb_monitor_sample__c.species__c, salesforce.ablb_monitor_sample__c.length_cm__c, salesforce.ablb_monitor_sample__c.weight_kg__c FROM salesforce.ablb_monitor_sample__c INNER JOIN salesforce.ablb_monitor_catch__c ON salesforce.ablb_monitor_sample__c.parent_catch__c = salesforce.ablb_monitor_catch__c.sfid INNER JOIN salesforce.ablb_monitor_trip__c ON salesforce.ablb_monitor_catch__c.parent_trip__c = salesforce.ablb_monitor_trip__c.sfid INNER JOIN salesforce.ablb_monitor_day__c ON salesforce.ablb_monitor_trip__c.parent_day__c = salesforce.ablb_monitor_day__c.sfid;');
        }

        else if (req.query.id == "query_landing_site_list"){
            query =  client.query('SELECT DISTINCT landing_site__c FROM salesforce.ablb_monitor_Log__c')
        }

        else if (req.query.id == "query_samples"){
            query =  client.query('SELECT weight_kg__c, length_cm__c FROM salesforce.ablb_monitor_Sample__c')
        }


        query.on('row', function(row) {
            console.log("start" +JSON.stringify(rows, null ,2))
            rows[row_count] = row
            row_count = row_count + 1;
            console.log("end" +JSON.stringify(rows, null, 2))
        })
        query.on('end', function(result) {


            console.log(rows);
            console.log("######################## returning rows");
            res.json(rows)
        })

    })
})
