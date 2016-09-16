var API_LIVE_URL = "https://test-abalobi-monitor.herokuapp.com/";
var API_DEV_URL = "http://localhost:5001/api/get/";
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
