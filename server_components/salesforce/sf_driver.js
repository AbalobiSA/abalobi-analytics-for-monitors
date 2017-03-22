/**
 * Created by Carl on 2017-03-22.
 */
// var bodyParser = require("body-parser");
// var spawn = require("child_process").spawn,
//     child;
var app;
// var cors = require('cors');
// var request = require('request');
// var jsforce = require('jsforce');
// var secrets = require("../../secrets/secrets.js");
var fs = require("fs");

function init(express){
    app = express;

    // console.log("Launching REST API...");
    //
    // var rest_users = require("./req_users.js");
    // var rest_trips = require("./req_trips.js");
    // var rest_communities = require("./req_communities.js");
    //
    // rest_users.init(app);
    // rest_trips.init(app);
    // rest_communities.init(app);
    //
    // console.log("REST API Initialized.\n");
}

module.exports = {
    init: init
};
