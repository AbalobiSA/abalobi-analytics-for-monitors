// !!! THIS CODE IS NOT USED AT PRESENT - OLD CODE!!!
angular.module('app.controllers', [])

.controller('simpleAuthChecker', function($scope, $state, $http, pgData, authService, authorizer) {
    var vm = this;
    vm.authService = authService;

    authorizer.checkAuthentication($state);

    $scope.$on('$ionicView.enter', function() {
        authorizer.checkAuthentication($state);
    });

    $scope.logout = function() {
        vm.authService.logout();
        alert("logging out");
        $state.go("login");
    }

})


.controller('loginCtrl', function($scope, $state, $http, pgData, authService, authorizer) {
    var vm = this;
    vm.authService = authService;
    // vm.authService.login();


    authorizer.checkAuthentication($state, "menu.home");
    // checkAuthentication();


    $scope.$on('$ionicView.enter', function() {
      var token = localStorage.getItem('id_token');
      if (token == null) {
          vm.authService.login();
      }

        // authorizer.checkAuthentication();
    });

    $scope.login = function(){
        vm.authService.login();
        authorizer.checkAuthentication($state, "menu.home");
    }

})




.controller('HomeCtrl', function($scope, $http, pgData, $state, authService, authorizer) {
    var vm = this;
    vm.authService = authService;
    $scope.authData = {};

    authorizer.checkAuthentication($state);


    $scope.$on('$ionicView.enter', function() {
        authorizer.checkAuthentication($state);
        $scope.authData.id_token = localStorage.getItem('id_token');

    });

    $scope.go = function() {

    }





})

.controller('Chart1Ctrl', function($scope, $http, $ionicLoading, authService, authorizer) {
    var vm = this;
    vm.authService = authService;

    authorizer.checkAuthentication($state);
    var auth_token = "";

    $scope.$on('$ionicView.enter', function() {
        authorizer.checkAuthentication($state);
        auth_token = localStorage.getItem('id_token');
    });


    $ionicLoading.show({
        template: 'Loading...'
    });



    $http({
            method: 'GET',
            url: 'https://abalobi-analytics-for-monitors.herokuapp.com/api/get/',
            authorization: 'Bearer ' + auth_token


        }).success(function(data) {

            $scope.data = angular.copy((data));
            $ionicLoading.hide()
        })
        .error(function(data) {
            $ionicLoading.hide();
            alert("Error");
            console.log('Error: ' + data);
        });
})

.controller('Chart2Ctrl', function($scope, pgData, $http, $ionicLoading, authService, authorizer) {
    var vm = this;
    vm.authService = authService;
    authorizer.checkAuthentication($state);


    $scope.$on('$ionicView.enter', function() {
        authorizer.checkAuthentication($state);
    });
    $ionicLoading.show({
        template: 'Loading...'
    });

    $http({
            method: 'GET',
            url: 'https://abalobi-analytics-for-monitors.herokuapp.com/api/get',
            params: {
                "id": "query_landing_site_list"
            }

        }).success(function(data) {

            $scope.data = angular.copy(data);
            $ionicLoading.hide()
        })
        .error(function(data) {
            $ionicLoading.hide();
            alert("Error");
            console.log('Error: ' + data);
        });

})

.controller('Chart3Ctrl', function($scope, pgData, $http, $ionicLoading, authService, authorizer) {
    var vm = this;
    vm.authService = authService;
    authorizer.checkAuthentication($state);

    $scope.$on('$ionicView.enter', function() {
        authorizer.checkAuthentication($state);
    });

    $ionicLoading.show({
        template: 'Loading...'
    });

    $http({
            method: 'GET',
            url: 'https://abalobi-analytics-for-monitors.herokuapp.com/api/get',
            params: {
                "id": "query_samples"
            }

        }).success(function(data) {

            JSON.stringify(data);
            $scope.data = angular.copy(data);
            $ionicLoading.hide()
        })
        .error(function(data) {
            $ionicLoading.hide();
            alert("Error");
            console.log('Error: ' + data);
        });

});
