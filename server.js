/*
    Abalobi Analytics for Monitors
    Node API Server

 */

/*==================================================================
    Imports
==================================================================*/

var GLOBAL_SETTINGS = require("./server_settings.json");
const dbSecrets = require('./server-secrets');

var localSecrets;

if (GLOBAL_SETTINGS.USE_LOCAL_SECRETS){
    localSecrets = require("./secrets_local.json");
}

const express = require('express');
const cors = require('cors');
const extend = require("extend");
const app = express();

/*==================================================================
    Global Variables
 ==================================================================*/



/*==================================================================
    Configuration
 ==================================================================*/

app.use(express.static('www'));
app.set('port', process.env.PORT || 5001);

const jwt = require('express-jwt');

var authenticate;

if (!GLOBAL_SETTINGS.USE_LOCAL_SECRETS) {
    authenticate = jwt({
        secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
        audience: process.env.AUTH0_CLIENT_ID
    });
} else {
    authenticate = jwt({
        secret: new Buffer(localSecrets.OAUTH_SECRET, 'base64'),
        audience: localSecrets.OAUTH_CLIENT_ID
    });
}


debugAuthentication();

app.use(cors());

//secure GET API
app.use('/api/get', authenticate);

/*==================================================================
    Modules
 ==================================================================*/

//Import modules
var pg_queries = require("./server_components/postgres/all_requests.js");
var pg_old_queries = require("./server_components/postgres/old_requests.js");
var sf_queries = require("./server_components/salesforce/sf_all_requests.js");

if (GLOBAL_SETTINGS.USE_SALESFORCE_REQUESTS === false){
    if (GLOBAL_SETTINGS.USE_OLD_PG_DATABASE === true){
        pg_old_queries.init(app);
    } else{
        pg_queries.init(app);
    }
} else{
    sf_queries.init(app);
}





//Run the server
app.listen(app.get('port'), function() {
    console.log('\n\nExpress server listening on port ' + app.get('port'));
});


/*==================================================================
 Utility Functions
 ==================================================================*/

function debugAuthentication() {

    try {
        console.log("\nLogging authenticate object...");
        console.log(authenticate);
    } catch (ex) {

    }

    try {
        console.log("\nLogging authenticate string...");
        console.log(JSON.stringify(authenticate, null, 4));
    } catch (ex) {

    }

    console.log("\n");
}
