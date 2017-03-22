// var app;
var jsforce = require('jsforce');
var secrets = require("../../secrets/secrets.js");
var fs = require("fs");

function init(pass_express) {

    var app = pass_express;

    allObject(app);
    singleObject(app);
}

function allObject(app){
    app.get('/endpoint', function(req, resMain) {

        console.log("Received GET for YOUR QUERY HERE - Multiple");
        console.log("PROTOCOL: " + req.protocol + '://' + req.get('host') + req.originalUrl + "\n");

        var query = "SELECT SOMETHING FROM SOMETHING_ELSE";
        createQuery(query, function(res) {
            var sendMeBack = {};

            sendMeBack['model-name'] = res.records;

            // fs.writeFileSync("datafiles/sf_output.json", JSON.stringify(sendMeBack, null, 4));

            resMain.send(sendMeBack);
        }, function(error){});


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



module.exports = {
    init: init
}
