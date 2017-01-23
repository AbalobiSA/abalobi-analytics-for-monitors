angular.module('app.services', [])

.factory('pgData', ['$http', function($http){

    var userinfo = {};
    var info = {};

    userinfo.getInfo =  function () {
        return info;
    };

    userinfo.updateInfo = function(data) {
        angular.merge(info, data);
        return info;
    };

    userinfo.clearInfo = function(){
        var blank = {};
        info = angular.copy(blank,info)
    };


    return userinfo
}])

.factory('authorizer', ['$state', function($state){
  return{
      checkAuthentication: function($state, locationString){
          var token = localStorage.getItem('id_token');
          if (token == null) {
              $state.go("login");
          } else {
            if (locationString == null){
              //$state.go("menu.home");
            } else{
              $state.go(locationString);
            }
          }
      }
    };
}]);
