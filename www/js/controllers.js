angular.module('app.controllers', [])

.controller('HomeCtrl', function($scope , $http, pgData) {

    $scope.go = function(){

    }


})

.controller('Chart1Ctrl', function($scope, $http, $ionicLoading) {

    $ionicLoading.show({
        template: 'Loading...'
    })

    $http({
       method: 'GET',
       url: 'https://test-abalobi-monitor.herokuapp.com/api/get'
     

   }).success(function(data) {

       $scope.data = angular.copy((data))
       $ionicLoading.hide()
   })
   .error(function(data) {
       $ionicLoading.hide()
       alert("Error")
       console.log('Error: ' + data);
   });



})

.controller('Chart2Ctrl', function($scope, pgData, $http, $ionicLoading) {

    $ionicLoading.show({
        template: 'Loading...'
    })

    $http({
       method: 'GET',
       url: 'https://test-abalobi-monitor.herokuapp.com/api/get',
       params : {"id" : "query_landing_site_list"}

    }).success(function(data) {

       $scope.data = angular.copy(data)
       $ionicLoading.hide()
    })
    .error(function(data) {
       $ionicLoading.hide()
       alert("Error")
       console.log('Error: ' + data);
    });

})

.controller('Chart3Ctrl', function($scope, pgData, $http, $ionicLoading) {

    $ionicLoading.show({
        template: 'Loading...'
    })

    $http({
       method: 'GET',
       url: 'https://test-abalobi-monitor.herokuapp.com/api/get',
       params : {"id" : "query_samples"}

    }).success(function(data) {

        JSON.stringify(data)
       $scope.data = angular.copy(data)
       $ionicLoading.hide()
    })
    .error(function(data) {
       $ionicLoading.hide()
       alert("Error")
       console.log('Error: ' + data);
    });

})
