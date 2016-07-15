var express = require('express'),
cors = require('cors'),
extend = require("extend")
app = express();
app.use(express.static('www'));
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
})

app.use(cors());

var pg = require('pg')
var DATABASE_URL="postgres://mczsldnlauxean:04ktVWpHIsEmvWpeC4gprxq9NG@ec2-54-247-121-238.eu-west-1.compute.amazonaws.com:5432/deurdovhbbo9ii"

var rows = {};
rows.subrow = {}
var row_count = 0;
var merge = require('merge')

app.get('/api/get', function(req, res){
    pg.defaults.ssl = true;
    pg.connect(DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting schemas...');

        var query =  client.query('SELECT * FROM salesforce.monitor_log__c')

        if (req.query.id == "query_boat_list"){
            query =  client.query('SELECT UNIQUE boat_name__c FROM salesforce.Monitor_Boat__c')
        }

        else if (req.query.id == "query_landing_soite_list"){
            query =  client.query('SELECT UNIQUE landing_site__c FROM salesforce.Monitor_Log__c')
        }

        else if (req.query.id == "query_samples"){
            query =  client.query('SELECT weight_kg__c, length_cm__c FROM salesforce.Monitor_Sample__c')
        }


        query.on('row', function(row) {
            console.log("start" +JSON.stringify(rows, null ,2))
            rows.subrow[row_count] = row
            row_count = row_count + 1;
            console.log("end" +JSON.stringify(rows, null, 2))
        })
        query.on('end', function(result) {


            console.log(rows);
            res.json(rows)
        })

    })
})
