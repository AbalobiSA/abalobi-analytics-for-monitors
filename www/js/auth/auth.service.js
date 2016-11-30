// components/auth/auth.service.js

(function() {

  'use strict';

  angular
    .module('app')
    .service('authService', authService);

  function authService($rootScope, angularAuth0, authManager, jwtHelper, $location, $ionicPopup) {

    var userProfile = JSON.parse(localStorage.getItem('profile')) || {};

    function login() {
      angularAuth0.login({
        connection: 'salesforce',
        responseType: 'token',
        popup: true
      }, onAuthenticated, null);
    }

    function logout() {
      localStorage.removeItem('id_token');
      localStorage.removeItem('profile');
      authManager.unauthenticate();
      userProfile = {};
    }

    function authenticateAndGetProfile() {
      var result = angularAuth0.parseHash(window.location.hash);

      if (result && result.idToken) {
        onAuthenticated(null, result);
      } else if (result && result.error) {
        onAuthenticated(result.error);
      }
    }

    function onAuthenticated(error, authResult) {
      if (error) {
        return $ionicPopup.alert({
          title: 'Login failed!',
          template: error
        });
      }

      localStorage.setItem('id_token', authResult.idToken);
      authManager.authenticate();

      angularAuth0.getProfile(authResult.idToken, function(error, profileData) {
        if (error) {
          return console.log(error);
        }

        localStorage.setItem('profile', JSON.stringify(profileData));
        userProfile = profileData;

        $location.path('/');
      });
    }

    // Set up the logic for when a user authenticates
    // This method is called from app.run.js
    // function registerAuthenticationListener(success, error) {
    //   lock.on('authenticated', function (authResult) {
    //     localStorage.setItem('id_token', authResult.idToken);
    //     authManager.authenticate();
    //     lock.hide();
    //
    //     location.hash = '#/';
    //
    //     lock.getProfile(authResult.idToken, function(error, profile) {
    //       if (error) {
    //         console.log(error);
    //       }
    //       localStorage.setItem('profile', JSON.stringify(profile));
    //     });
    //     success(authResult);
    //   });
    // }

    function checkAuthOnRefresh() {
      var token = localStorage.getItem('id_token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          if (!$rootScope.isAuthenticated) {
            authManager.authenticate();
          }
        }
      }
    }

    return {
      userProfile: userProfile,
      login: login,
      logout: logout,
      checkAuthOnRefresh: checkAuthOnRefresh,
      authenticateAndGetProfile: authenticateAndGetProfile
    }
  }
})();
