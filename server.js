const dbSecrets = require('./server-secrets');
const express = require('express');
const cors = require('cors');
const extend = require("extend");
const app = express();
app.use(express.static('www'));
app.set('port', process.env.PORT || 5001);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
})

const jwt = require('express-jwt');

// const authenticate = jwt({
//   secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
//   audience: process.env.AUTH0_CLIENT_ID
// });

const authenticate = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});

app.use(cors());

//secure GET API
// app.use('/api/get', authenticate)

app.use('/', authenticate)


const pg = require('pg');
const Pool = pg.Pool;
const url = require('url');
const DATABASE_URL=dbSecrets.DB_URL;

const params = url.parse(DATABASE_URL);
const auth = params.auth.split(':');

// pg pool connection config
const config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: dbSecrets.useSSL
};

const pool = new Pool(config);

var DEBUG_LOG_SQL = process.env.DEBUG_LOG_SQL;

var merge = require('merge')

function debugLog(str) {
    if (DEBUG_LOG_SQL==true) {
        console.log(str);
    }
}

app.get('/api/get', function(req, res){
    var query = null;// =  client.query('SELECT * FROM salesforce.ablb_monitor_log__c')

    //Global query limt
    queryLimit = 150;

    debugLog(req.query);

    // ========  QUERY DEFINITIONS ==========

    //TODO: Adjust all LIMIT clauses, but don't remove completely.

    //NB: 3 hours are added to the date because when results are sent back
    // the time is pulled back by 2 due to timezone changes

    //TODO: NOte that either main_fisher_id__c (abalobi-registered fisher) OR main_fisher_other__c (non-registered) will be populated, not both)
    //TODO: Change INNER JOIN to link on odk_uuid__c instead of sfid (sfids are just linked using odk_uuid in salesforce)
    if (req.query.id == "total_species_weight_by_location"){
        if(req.query.param == "weight_total"){
            columnName = "weight_kg__c";
        }else if (req.query.param == "numbers_total") {
            columnName = "num_items__c";
        }
        query = "SELECT date_trunc('month', odk_date__c)+ interval '3 hours' AS year_month, "+
            "species__c, landing_site__c, SUM("+columnName+") as "+req.query.param+" "+
            "FROM salesforce.ablb_monitor_catch__c "+
            "INNER JOIN salesforce.ablb_monitor_trip__c "+
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c "+
            "INNER JOIN salesforce.ablb_monitor_day__c "+
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c "+
            "WHERE "+columnName+" IS NOT NULL "+
            "GROUP BY year_month, landing_site__c, species__c "+
            "ORDER BY year_month, landing_site__c, species__c DESC LIMIT "+queryLimit+";"
    }
    else if (req.query.id == "total_species_weight_by_month"){
        if(req.query.param == "weight_total"){
            columnName = "weight_kg__c";
        }else if (req.query.param == "numbers_total") {
            columnName = "num_items__c";
        }
        query = "SELECT date_trunc('month', odk_date__c)+ interval '3 hours' AS year_month, "+
            "species__c, SUM("+columnName+") as "+req.query.param+" "+
            "FROM salesforce.ablb_monitor_catch__c "+
            "INNER JOIN salesforce.ablb_monitor_trip__c "+
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c "+
            "INNER JOIN salesforce.ablb_monitor_day__c "+
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c "+
            "WHERE "+columnName+" IS NOT NULL "+
            "GROUP BY year_month, species__c "+
            "ORDER BY year_month, species__c DESC LIMIT "+queryLimit+";"
    }

    else if (req.query.id == "total_species_weight_by_month_by_boat_type"){
        if(req.query.param == "weight_total"){
            columnName = "weight_kg__c";
        }else if (req.query.param == "numbers_total") {
            columnName = "num_items__c";
        }
        query =  "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, landing_site__c, "+
            "species__c, coalesce(boat_type__c, 'unknown') as boat_type,  "+
            "SUM("+columnName+") as "+req.query.param+" FROM salesforce.ablb_monitor_catch__c "+
            "INNER JOIN salesforce.ablb_monitor_trip__c "+
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c "+
            "INNER JOIN salesforce.ablb_monitor_day__c "+
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c "+
            "WHERE "+columnName+" IS NOT NULL "+
            "GROUP BY landing_site__c, year_month, species__c, boat_type__c "+
            "ORDER BY landing_site__c, year_month, species__c, boat_type__c LIMIT "+queryLimit+";"
    }

    else if (req.query.id == "total_species_weight_by_month_by_permit_type"){
        if(req.query.param == "weight_total"){
            columnName = "weight_kg__c";
        }else if (req.query.param == "numbers_total") {
            columnName = "num_items__c";
        }
        query = "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, landing_site__c, "+
            "species__c, coalesce(main_fisher_other_permit_type__c, 'no_permit') as permit_type, "+
            "SUM("+columnName+") as "+req.query.param+" FROM salesforce.ablb_monitor_catch__c "+
            "INNER JOIN salesforce.ablb_monitor_trip__c "+
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c "+
            "INNER JOIN salesforce.ablb_monitor_day__c "+
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c "+
            "WHERE "+columnName+" IS NOT NULL "+
            "GROUP BY landing_site__c, year_month, species__c, permit_type "+
            "ORDER BY landing_site__c, year_month, species__c, permit_type;"
    }


    else if (req.query.id == "total_boat_types_by_month"){
        //TODO: NOte that either main_fisher_id__c (abalobi-registered fisher) OR main_fisher_other__c (non-registered) will be populated, not both)
        query = "SELECT date_trunc('month', odk_date__c)+interval '3 hour' AS year_month, "+
            "landing_site__c, coalesce(boat_type__c, 'unknown') as boat_type, COUNT(*) "+
            "FROM salesforce.ablb_monitor_trip__c "+
            "INNER JOIN salesforce.ablb_monitor_day__c ON "+
            "salesforce.ablb_monitor_trip__c.parent_day__c = salesforce.ablb_monitor_day__c.sfid "+
            "GROUP BY year_month, landing_site__c, boat_type__c "+
            "ORDER BY year_month, landing_site__c LIMIT "+queryLimit+";"
    }

    else if(req.query.id == "submissions_by_month_by_location"){
        query = "SELECT date_trunc('month', odk_date__c)+interval '3 hour' AS year_month, landing_site__c, COUNT(*) "+
            "FROM salesforce.ablb_monitor_day__c "+
            "GROUP BY year_month, landing_site__c "+
            "ORDER BY year_month, landing_site__c LIMIT "+queryLimit+";"
    }


    else if(req.query.id == "samples_query"){
        if(req.query.param == "weight_avg"){
            columnName = "salesforce.ablb_monitor_sample__c.weight_kg__c";
        }else if (req.query.param == "length_avg") {
            columnName = "salesforce.ablb_monitor_sample__c.length_cm__c";
        }
        query = "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, "+
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
    }

    // ========  END OF QUERY DEFINITIONS ==========

    pool.query(query)
    .then(result => {
        debugLog("start" +JSON.stringify(result, null ,3));
        return result.rows;
    })
    .then(rows => {
        debugLog("rows.head" +JSON.stringify(rows, null ,3));
        res.json(rows);
    })
    .catch(e => {
        console.error("query error", e.message, e.stack);
    })
})
