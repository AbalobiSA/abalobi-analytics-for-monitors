/**
 * Created by Carl on 2017-03-22.
 */
// var app;
var jsforce = require('jsforce');
var SERVER_SETTINGS = require("../../server_settings.json");
var GLOBAL_QUERY_LIMIT = 150;

var secrets;

if (SERVER_SETTINGS.USE_LOCAL_SALESFORCE_CREDENTIALS === true){
    secrets = require("../../secrets_local.json");
} else{
    secrets = {
        "SF_USER" : process.env.SF_USER,
        "SF_PASSWORD" : process.env.SF_PASSWORD
    }
}

function init(pass_express) {

    allObject(pass_express);
    // singleObject(app);
}

function allObject(app){
    app.get('/api/get', function(req, resMain) {

        console.log("Received GET for YOUR QUERY HERE - Multiple");
        console.log("PROTOCOL: " + req.protocol + '://' + req.get('host') + req.originalUrl + "\n");

        var query = determineQuery(req.query.id, req.query.param, GLOBAL_QUERY_LIMIT);

        createQuery(query, function(res) {
            var sendMeBack = {};

            //Structure the query here
            sendMeBack['model-name'] = res.records;

            //Write the response to file, if desired.
            fs.writeFile("../../datafiles/sf_output.json", JSON.stringify(sendMeBack, null, 4), function(){
                 console.log("RESPONSE WRITTEN TO FILE!");
            });

            resMain.send(sendMeBack);
        }, function(error){
            //Do your error logging here
            console.log("\n\nSALESFORCE QUERY ERROR!\n\n")
        });
    });
}
function singleObject(app){
    app.get('/endpoint/:Id', function(req, resMain) {
        console.log("Received GET for YOUR QUERY HERE - Single");
        console.log("PROTOCOL: " + req.protocol + '://' + req.get('host') + req.originalUrl + "\n");
        // console.log("====================================");
        // res.send("This is successful!");
        var query = "SELECT SOMETHING FROM SOMETHING_ELSE WHERE Id = '" + req.params.Id + "'";
        createQuery(query, function(res){

            var sendMeBack = {};
            sendMeBack['model-name'] = res.records;
            // fs.writeFileSync("datafiles/sf_output.json", JSON.stringify(sendMeBack, null, 4));
            resMain.send(sendMeBack);

        }, function(error){});
    });
}

function createQuery(queryString, success, error){
    var conn = new jsforce.Connection();

    conn.login(secrets.SF_USER, secrets.SF_PASSWORD, function(err, res) {
        if (err) {
            return console.error(err);
        }
        // callback(connection, response);

        //'SELECT Id, FirstName, LastName, primary_community__c, FullPhotoUrl FROM User'
        conn.query(queryString, function(err, res) {
            if (err) {
                error(err);
                return console.error(err);
            }

            success(res);
        });
    });
}

function determineQuery(query_name, query_params, query_limit){

    var query, columnName;
    var queryLimit = query_limit;

    if (query_name === "total_species_weight_by_location") {
        if (query_params === "weight_total") {
            columnName = "weight_kg__c";
        } else if (query_params === "numbers_total") {
            columnName = "num_items__c";
        }
        query = "SELECT date_trunc('month', odk_date__c)+ interval '3 hours' AS year_month, " +
            "species__c, landing_site__c, SUM(" + columnName + ") as " + query_params + " " +
            "FROM salesforce.ablb_monitor_catch__c " +
            "INNER JOIN salesforce.ablb_monitor_trip__c " +
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c " +
            "INNER JOIN salesforce.ablb_monitor_day__c " +
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c " +
            "WHERE " + columnName + " IS NOT NULL " +
            "GROUP BY year_month, landing_site__c, species__c " +
            "ORDER BY year_month, landing_site__c, species__c DESC LIMIT " + queryLimit + ";"
    } else if (query_name === "total_species_weight_by_month") {
        if (query_params === "weight_total") {
            columnName = "weight_kg__c";
        } else if (query_params === "numbers_total") {
            columnName = "num_items__c";
        }
        query = "SELECT date_trunc('month', odk_date__c)+ interval '3 hours' AS year_month, " +
            "species__c, SUM(" + columnName + ") as " + query_params + " " +
            "FROM salesforce.ablb_monitor_catch__c " +
            "INNER JOIN salesforce.ablb_monitor_trip__c " +
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c " +
            "INNER JOIN salesforce.ablb_monitor_day__c " +
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c " +
            "WHERE " + columnName + " IS NOT NULL " +
            "GROUP BY year_month, species__c " +
            "ORDER BY year_month, species__c DESC LIMIT " + queryLimit + ";"
    } else if (query_name === "total_species_weight_by_month_by_boat_type") {
        if (query_params === "weight_total") {
            columnName = "weight_kg__c";
        } else if (query_params === "numbers_total") {
            columnName = "num_items__c";
        }
        query = "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, landing_site__c, " +
            "species__c, coalesce(boat_type__c, 'unknown') as boat_type,  " +
            "SUM(" + columnName + ") as " + query_params + " FROM salesforce.ablb_monitor_catch__c " +
            "INNER JOIN salesforce.ablb_monitor_trip__c " +
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c " +
            "INNER JOIN salesforce.ablb_monitor_day__c " +
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c " +
            "WHERE " + columnName + " IS NOT NULL " +
            "GROUP BY landing_site__c, year_month, species__c, boat_type__c " +
            "ORDER BY landing_site__c, year_month, species__c, boat_type__c LIMIT " + queryLimit + ";"
    } else if (query_name === "total_species_weight_by_month_by_permit_type") {
        if (query_params === "weight_total") {
            columnName = "weight_kg__c";
        } else if (query_param=s == "numbers_total") {
            columnName = "num_items__c";
        }
        query = "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, landing_site__c, " +
            "species__c, coalesce(main_fisher_other_permit_type__c, 'no_permit') as permit_type, " +
            "SUM(" + columnName + ") as " + query_params + " FROM salesforce.ablb_monitor_catch__c " +
            "INNER JOIN salesforce.ablb_monitor_trip__c " +
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c " +
            "INNER JOIN salesforce.ablb_monitor_day__c " +
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c " +
            "WHERE " + columnName + " IS NOT NULL " +
            "GROUP BY landing_site__c, year_month, species__c, permit_type " +
            "ORDER BY landing_site__c, year_month, species__c, permit_type;"
    } else if (query_name == "total_boat_types_by_month") {
        //TODO: NOte that either main_fisher_id__c (abalobi-registered fisher) OR main_fisher_other__c (non-registered) will be populated, not both)
        query = "SELECT date_trunc('month', odk_date__c)+interval '3 hour' AS year_month, " +
            "landing_site__c, coalesce(boat_type__c, 'unknown') as boat_type, COUNT(*) " +
            "FROM salesforce.ablb_monitor_trip__c " +
            "INNER JOIN salesforce.ablb_monitor_day__c ON " +
            "salesforce.ablb_monitor_trip__c.parent_day__c = salesforce.ablb_monitor_day__c.sfid " +
            "GROUP BY year_month, landing_site__c, boat_type__c " +
            "ORDER BY year_month, landing_site__c LIMIT " + queryLimit + ";"
    } else if (query_name == "submissions_by_month_by_location") {
        query = "SELECT date_trunc('month', odk_date__c)+interval '3 hour' AS year_month, landing_site__c, COUNT(*) " +
            "FROM salesforce.ablb_monitor_day__c " +
            "GROUP BY year_month, landing_site__c " +
            "ORDER BY year_month, landing_site__c LIMIT " + queryLimit + ";"
    } else if (query_name == "samples_query") {
        if (query_params == "weight_avg") {
            columnName = "salesforce.ablb_monitor_sample__c.weight_kg__c";
        } else if (query_params == "length_avg") {
            columnName = "salesforce.ablb_monitor_sample__c.length_cm__c";
        }
        query = "SELECT date_trunc('month', odk_date__c) + interval '3 hours' AS year_month, " +
            "landing_site__c, salesforce.ablb_monitor_sample__c.species__c, " +
            "AVG(" + columnName + ") as " + query_params + " " +
            "FROM salesforce.ablb_monitor_sample__c " +
            "INNER JOIN salesforce.ablb_monitor_catch__c " +
            "ON salesforce.ablb_monitor_catch__c.odk_uuid__c = salesforce.ablb_monitor_sample__c.odk_parent_uuid__c " +
            "INNER JOIN salesforce.ablb_monitor_trip__c " +
            "ON salesforce.ablb_monitor_trip__c.odk_uuid__c = salesforce.ablb_monitor_catch__c.odk_parent_uuid__c " +
            "INNER JOIN salesforce.ablb_monitor_day__c " +
            "ON salesforce.ablb_monitor_day__c.odk_uuid__c = salesforce.ablb_monitor_trip__c.odk_parent_uuid__c " +
            "WHERE " + columnName + " > 0 " +
            "GROUP BY landing_site__c, year_month, salesforce.ablb_monitor_sample__c.species__c " +
            "ORDER BY landing_site__c, year_month, salesforce.ablb_monitor_sample__c.species__c DESC " +
            "LIMIT " + queryLimit + ";"
    }

    return query;
}


module.exports = {
    init: init
};
