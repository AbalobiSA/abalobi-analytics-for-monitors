var API_LIVE_URL = "";
var API_DEV_URL = "http://localhost:42957/api/get/";
var API_URL = API_DEV_URL;
angular.module('monitorData')
    .factory('MonitorResource', ['$resource',
    function($resource) {
        console.log("getting resource");
        return $resource(API_URL+'?id=:queryType', {}, {
            query: {
              method: 'GET',
              params: {queryType: 'qwe'},
              isArray: true
            }
        });
    }
]);
