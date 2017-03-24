angular.module('app.services', [])

    .factory('pgData', ['$http', function($http) {

        var userinfo = {};
        var info = {};

        userinfo.getInfo = function() {
            return info;
        };

        userinfo.updateInfo = function(data) {
            angular.merge(info, data);
            return info;
        };

        userinfo.clearInfo = function() {
            var blank = {};
            info = angular.copy(blank, info)
        };


        return userinfo
    }])

    .factory('authorizer', ['$state', '$http', function($state, $http) {
        return {
            checkAuthentication: function($state, locationString) {
                var server_url = "https://abalobi-analytics-for-monitors.herokuapp.com/authenticate";
                var token = localStorage.getItem('id_token');
                if (token === null) {
                    $state.go("login");
                }
                else {
                    //Check the token against another server endpoint.
                    //If there is a 401, the token is old. Clear it.

                    var currentAuth = localStorage.getItem('id_token');
                    // console.log("CURRENT ID TOKEN IS " + currentAuth);
                    var httpAuthString = "Bearer " + currentAuth;

                    $http({
                        method: 'GET',
                        url: server_url,
                        headers: {
                            authorization: httpAuthString
                        }
                    }).then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        console.log("SUCCESS: " + response.status);
                        $state.go("menu.home");
                    }, function errorCallback(response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        console.log("FAILURE: " + response.status);
                        localStorage.setItem('id_token', null);
                        token = null;
                        $state.go("login");
                    });



                    // if (locationString === null) {
                    //     //$state.go("menu.home");
                    // }
                    // else {
                    //     $state.go(locationString);
                    // }
                }
            }
        };
    }]);
