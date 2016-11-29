(function() {
    'use strict';

    var API_LIVE_URL = "https://abalobi-analytics-for-monitors.herokuapp.com/api/get/";
    var API_DEV_URL = "http://localhost:5001/api/get/";
    var API_DEV_URL_ANDREW = "http://localhost:5000/api/get/";

    var API_URL = API_LIVE_URL;

    angular.module('monitorData')
        .factory('MonitorResource', ['$resource',
        function($resource) {
          var currentAuth = localStorage.getItem('id_token');
          console.log("CURRENT ID TOKEN IS " + currentAuth);
          var httpAuthString = "Bearer " + currentAuth;
            return $resource(API_URL+'?id=:queryType&param=:parameter', {}, {
                query: {
                  method: 'GET',
                  isArray: true,
                  authorization: httpAuthString
                }
            });
        }
    ]);
})();
