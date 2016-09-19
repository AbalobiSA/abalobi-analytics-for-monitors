var API_LIVE_URL = "https://abalobi-analytics-for-monitors.herokuapp.com/api/get/";
var API_DEV_URL = "http://localhost:5001/api/get/";

//TODO: Set this up to use env variables instead of needing to change this value for local testing
var API_URL = API_LIVE_URL;
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
