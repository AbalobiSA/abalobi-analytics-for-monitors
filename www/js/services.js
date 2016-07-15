angular.module('app.services', [])

.factory('pgData', ['$http', function($http){

    var userinfo = {};
    var info = {}

    userinfo.getInfo =  function () {
        return info;
    }

    userinfo.updateInfo = function(data) {
        angular.merge(info, data);
        return info;
    }

    userinfo.clearInfo = function(){
        var blank = {};
        info = angular.copy(blank,info)
    }


    return userinfo
}])
