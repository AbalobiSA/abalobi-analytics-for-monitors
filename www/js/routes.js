angular.module('app.routes', ['auth0.lock', 'angular-jwt', 'ui.router'])

.config(function($stateProvider, $urlRouterProvider, lockProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
    })

    .state('menu.home', {
        url: '/home',
        views: {
            'side-menu21': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }
        }
    })

    .state('menu.chart_1', {
        url: '/chart_1',
        views: {
            'side-menu21': {
                templateUrl: 'templates/chart_1.html'
            }
        }
    })

    .state('menu.chart_2', {
        url: '/chart_2',
        views: {
            'side-menu21': {
                templateUrl: 'templates/chart_2.html'
            }
        }
    })



    .state('menu.chart_3', {
        url: '/chart_3',
        views: {
            'side-menu21': {
                templateUrl: 'templates/chart_3.html'
            }
        }
    })

    .state('menu.chart_4', {
        url: '/chart_4',
        views: {
            'side-menu21': {
                templateUrl: 'templates/chart_4.html'
            }
        }
    })

    .state('menu.chart_5', {
        url: '/chart_5',
        views: {
            'side-menu21': {
                templateUrl: 'templates/chart_5.html'
            }
        }
    })

    .state('menu.chart_6', {
        url: '/chart_6',
        views: {
            'side-menu21': {
                templateUrl: 'templates/chart_6.html'
            }
        }
    })

    .state('menu.chart_7', {
        url: '/chart_7',
        views: {
            'side-menu21': {
                templateUrl: 'templates/chart_7.html'
            }
        }
    })

    .state('menu', {
        url: '/side-menu21',
        templateUrl: 'templates/menu.html',
        abstract:true
    });

    lockProvider.init({
      clientID: 'FkmlnBqFVdI4psENfGQeSG5PNa96H3f4',
      domain: 'app56729554.eu.auth0.com'
    });

    $urlRouterProvider.otherwise('/login');



});
