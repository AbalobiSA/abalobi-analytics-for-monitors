// app.run.js
(function () {

  'use strict';

  angular
    .module('app')
    .run(run);

  function run($ionicPlatform, authService, lock, $rootScope) {


    // Put the authService on $rootScope so its methods
    // can be accessed from the nav bar
    $rootScope.authService = authService;

    // Register the authentication listener that is
    // set up in auth.service.js
    authService.registerAuthenticationListener(function(loginToken){
        // alert("SUCCESS");
        console.log(JSON.stringify(loginToken, null, 4));
    },function(){
      // alert("ERROR");

    });

    // Register the synchronous hash parser
    // when using UI Router
    lock.interceptHash();

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

    });

  }

})();
