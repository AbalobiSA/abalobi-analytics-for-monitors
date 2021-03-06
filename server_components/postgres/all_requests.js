/*==================================================================
 Imports
 ==================================================================*/

var pg = require('pg');
var Pool = pg.Pool;
var url = require('url');

var dbSecrets = require('../../server-secrets');
var GLOBAL_SETTINGS = require("../../server_settings.json");
var localSecrets;

if (GLOBAL_SETTINGS.USE_LOCAL_SECRETS){
    localSecrets = require("../../secrets_local.json");
}

var DATABASE_URL, DEBUG_LOG_SQL;

if (!GLOBAL_SETTINGS.USE_LOCAL_SECRETS) {
    DATABASE_URL = dbSecrets.DB_URL;
    // DEBUG_LOG_SQL = process.env.DEBUG_LOG_SQL;
    DEBUG_LOG_SQL = true;
} else {
    DATABASE_URL = localSecrets.DB_URL;
    DEBUG_LOG_SQL = localSecrets.DEBUG_LOG_SQL;
}


var params = url.parse(DATABASE_URL);
var auth = params.auth.split(':');

/*==================================================================
 Configuration
 ==================================================================*/

// pg pool connection config
var config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: getSSLSetting()
};

function getSSLSetting(){
    if (GLOBAL_SETTINGS.USE_LOCAL_SECRETS){
        return localSecrets.useSSL;
    } else{
        return dbSecrets.useSSL;
    }
}

var app;

function init(express) {
    app = express;
    createRequests();
    console.log("MODULE LOADED: PG Requests");
}

/*==================================================================
 Functions
 ==================================================================*/
function createRequests() {
    const pool = new Pool(config);



    var merge = require('merge');

    function debugLog(str) {
        if (DEBUG_LOG_SQL === true) {
            console.log(str);
        }
    }

    app.get('/api/get', function(req, res) {
        var query = null; // =  client.query('SELECT * FROM salesforce.'ablb_monitor_log__c'')

        //Global query limt
        queryLimit = GLOBAL_SETTINGS.DATABASE_QUERY_LIMIT;

        debugLog(req.query);

        // ========  QUERY DEFINITIONS ==========

        //TODO: Adjust all LIMIT clauses, but don't remove completely.

        //NB: 3 hours are added to the date because when results are sent back
        // the time is pulled back by 2 due to timezone changes

        //TODO: NOte that either main_fisher_id__c (abalobi-registered fisher) OR main_fisher_other__c (non-registered) will be populated, not both)
        //TODO: Change INNER JOIN to link on odk_uuid__c instead of sfid (sfids are just linked using odk_uuid in salesforce)
        if (req.query.id === "total_species_weight_by_location") {
            if (req.query.param === "weight_total") {
                columnName = "weight_kg__c";
            } else if (req.query.param === "numbers_total") {
                columnName = "num_items__c";
            }
            query = "SELECT date_trunc('month', odk_date__c)+ interval '3 hours' AS year_month, " +
                "species__c, landing_site__c, SUM(" + columnName + ") as " + req.query.param + " " +
                "FROM public.\"Ablb_Monitor_Catch__c\" " +
                "INNER JOIN public.\"Ablb_Monitor_Trip__c\" " +
                "ON public.\"Ablb_Monitor_Trip__c\".odk_uuid__c = public.\"Ablb_Monitor_Catch__c\".odk_parent_uuid__c " +
                "INNER JOIN public.\"Ablb_Monitor_Day__c\" " +
                "ON public.\"Ablb_Monitor_Day__c\".odk_uuid__c = public.\"Ablb_Monitor_Trip__c\".odk_parent_uuid__c " +
                "WHERE " + columnName + " IS NOT NULL " +
                "GROUP BY year_month, landing_site__c, species__c " +
                "ORDER BY year_month, landing_site__c, species__c DESC LIMIT " + queryLimit + ";"
        } else if (req.query.id === "total_species_weight_by_month") {
            if (req.query.param === "weight_total") {
                columnName = "weight_kg__c";
            } else if (req.query.param === "numbers_total") {
                columnName = "num_items__c";
            }
            query = "SELECT date_trunc('month', odk_date__c)+ interval '3 hours' AS year_month, " +
                "species__c, SUM(" + columnName + ") as " + req.query.param + " " +
                "FROM public.\"Ablb_Monitor_Catch__c\" " +
                "INNER JOIN public.\"Ablb_Monitor_Trip__c\" " +
                "ON public.\"Ablb_Monitor_Trip__c\".odk_uuid__c = public.\"Ablb_Monitor_Catch__c\".odk_parent_uuid__c " +
                "INNER JOIN public.\"Ablb_Monitor_Day__c\" " +
                "ON public.\"Ablb_Monitor_Day__c\".odk_uuid__c = public.\"Ablb_Monitor_Trip__c\".odk_parent_uuid__c " +
                "WHERE " + columnName + " IS NOT NULL " +
                "GROUP BY year_month, species__c " +
                "ORDER BY year_month, species__c DESC LIMIT " + queryLimit + ";"
        } else if (req.query.id === "total_species_weight_by_month_by_boat_type") {
            if (req.query.param === "weight_total") {
                columnName = "weight_kg__c";
            } else if (req.query.param === "numbers_total") {
                columnName = "num_items__c";
            }
            query = "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, landing_site__c, " +
                "species__c, coalesce(boat_type__c, 'unknown') as boat_type,  " +
                "SUM(" + columnName + ") as " + req.query.param + " FROM public.\"Ablb_Monitor_Catch__c\" " +
                "INNER JOIN public.\"Ablb_Monitor_Trip__c\" " +
                "ON public.\"Ablb_Monitor_Trip__c\".odk_uuid__c = public.\"Ablb_Monitor_Catch__c\".odk_parent_uuid__c " +
                "INNER JOIN public.\"Ablb_Monitor_Day__c\" " +
                "ON public.\"Ablb_Monitor_Day__c\".odk_uuid__c = public.\"Ablb_Monitor_Trip__c\".odk_parent_uuid__c " +
                "WHERE " + columnName + " IS NOT NULL " +
                "GROUP BY landing_site__c, year_month, species__c, boat_type__c " +
                "ORDER BY landing_site__c, year_month, species__c, boat_type__c LIMIT " + queryLimit + ";"
        } else if (req.query.id === "total_species_weight_by_month_by_permit_type") {
            if (req.query.param === "weight_total") {
                columnName = "weight_kg__c";
            } else if (req.query.param === "numbers_total") {
                columnName = "num_items__c";
            }
            query = "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, landing_site__c, " +
                "species__c, coalesce(main_fisher_other_permit_type__c, 'no_permit') as permit_type, " +
                "SUM(" + columnName + ") as " + req.query.param + " FROM public.\"Ablb_Monitor_Catch__c\" " +
                "INNER JOIN public.\"Ablb_Monitor_Trip__c\" " +
                "ON public.\"Ablb_Monitor_Trip__c\".odk_uuid__c = public.\"Ablb_Monitor_Catch__c\".odk_parent_uuid__c " +
                "INNER JOIN public.\"Ablb_Monitor_Day__c\" " +
                "ON public.\"Ablb_Monitor_Day__c\".odk_uuid__c = public.\"Ablb_Monitor_Trip__c\".odk_parent_uuid__c " +
                "WHERE " + columnName + " IS NOT NULL " +
                "GROUP BY landing_site__c, year_month, species__c, permit_type " +
                "ORDER BY landing_site__c, year_month, species__c, permit_type;"
        } else if (req.query.id === "total_boat_types_by_month") {
            //TODO: NOte that either main_fisher_id__c (abalobi-registered fisher) OR main_fisher_other__c (non-registered) will be populated, not both)
            query = "SELECT date_trunc('month', odk_date__c)+interval '3 hour' AS year_month, " +
                "landing_site__c, coalesce(boat_type__c, 'unknown') as boat_type, COUNT(*) " +
                "FROM public.\"Ablb_Monitor_Trip__c\" " +
                "INNER JOIN public.\"Ablb_Monitor_Day__c\" ON " +
                "public.\"Ablb_Monitor_Trip__c\".parent_day__c = public.\"Ablb_Monitor_Day__c\".sfid " +
                "GROUP BY year_month, landing_site__c, boat_type__c " +
                "ORDER BY year_month, landing_site__c LIMIT " + queryLimit + ";"
        } else if (req.query.id === "submissions_by_month_by_location") {
            query = "SELECT date_trunc('month', odk_date__c)+interval '3 hour' AS year_month, landing_site__c, COUNT(*) " +
                "FROM public.\"Ablb_Monitor_Day__c\" " +
                "GROUP BY year_month, landing_site__c " +
                "ORDER BY year_month, landing_site__c LIMIT " + queryLimit + ";"
        } else if (req.query.id === "samples_query") {
            if (req.query.param === "weight_avg") {
                columnName = "public.\"Ablb_Monitor_Sample__c\".weight_kg__c";
            } else if (req.query.param === "length_avg") {
                columnName = "public.\"Ablb_Monitor_Sample__c\".length_cm__c";
            }
            query = "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, " +
                "landing_site__c, public.\"Ablb_Monitor_Sample__c\".species__c, " +
                "AVG(" + columnName + ") as " + req.query.param + " " +
                "FROM public.\"Ablb_Monitor_Sample__c\" " +
                "INNER JOIN public.\"Ablb_Monitor_Catch__c\" " +
                "ON public.\"Ablb_Monitor_Catch__c\".odk_uuid__c = public.\"Ablb_Monitor_Sample__c\".odk_parent_uuid__c " +
                "INNER JOIN public.\"Ablb_Monitor_Trip__c\" " +
                "ON public.\"Ablb_Monitor_Trip__c\".odk_uuid__c = public.\"Ablb_Monitor_Catch__c\".odk_parent_uuid__c " +
                "INNER JOIN public.\"Ablb_Monitor_Day__c\" " +
                "ON public.\"Ablb_Monitor_Day__c\".odk_uuid__c = public.\"Ablb_Monitor_Trip__c\".odk_parent_uuid__c " +
                "WHERE " + columnName + " > 0 " +
                "GROUP BY landing_site__c, year_month, public.\"Ablb_Monitor_Sample__c\".species__c " +
                "ORDER BY landing_site__c, year_month, public.\"Ablb_Monitor_Sample__c\".species__c DESC " +
                "LIMIT " + queryLimit + ";"
        }

        // ========  END OF QUERY DEFINITIONS ==========

        String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };

        // query = query.replaceAll("salesforce.", "public.");
        query = query.replaceAll(".sfid", ".\"Id\"");
        query = query.replaceAll("odk_date__c", "day_date__c");



        pool.query(query)
            .then(result => {
            var logMe = "TECHAIROS DEBUGGING HERE: \n";
        debugLog(logMe + "start" + JSON.stringify(result, null, 3));
        return result.rows;
    })
        .then(rows => {
            debugLog("rows.head" + JSON.stringify(rows, null, 3));
        res.json(rows);
    })
        .catch(e => {
            console.error("query error", e.message, e.stack);
    })
    });

}

module.exports = {
    init: init
};
