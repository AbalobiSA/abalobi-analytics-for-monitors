var API_LIVE_URL = "https://abalobi-analytics-for-monitors.herokuapp.com/api/get/";
var API_DEV_URL = "http://localhost:5001/api/get/";
var API_DEV_URL_ANDREW = "http://localhost:5000/api/get/";

//TODO: Why doesn't this work??:   var API_URL = process.env.API_URL;
var API_URL = API_DEV_URL;

angular.module('monitorData')
    .factory('MonitorResource', ['$resource',
    function($resource) {
        return $resource(API_URL+'?id=:queryType&param=:parameter', {}, {
            query: {
              method: 'GET',
              isArray: true
            }
        });
    }
]);
