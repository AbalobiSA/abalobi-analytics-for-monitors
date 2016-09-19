// These were moved to ENV var API_URL
//var API_LIVE_URL = "https://abalobi-analytics-for-monitors.herokuapp.com/api/get/";
//var API_DEV_URL = "http://localhost:5001/api/get/";

var API_URL =  = process.env.API_URL;

angular.module('monitorData')
    .factory('MonitorResource', ['$resource',
    function($resource) {
        console.log("getting resource");
        return $resource(API_URL+'?id=:queryType', {}, {
            query: {
              method: 'GET',
              isArray: true
            }
        });
    }
]);
