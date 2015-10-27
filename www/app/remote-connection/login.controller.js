(function () {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', '$state', '$ionicPopup', '$log', 'LoginFactory', 'SyncService'];

  function LoginController($scope, $state, $ionicPopup, $log, LoginFactory, SyncService) {
    $scope.skip = function () {
      $state.go('app.spots');
    };

    // Form data for the login modal
    $scope.loginData = {};

    // is the user logged in from before?
    LoginFactory.getLogin()
      .then(function (login) {
        if (login !== null) {
          // we do have a login -- lets set the authentication
          $log.log('we have a login already, skipping login page', login);
          $scope.skip();
        }
      });

    // Perform the login action
    $scope.doLogin = function () {
      $scope.loginData.email = $scope.loginData.email.toLowerCase();
      // Authenticate user login
      if (navigator.onLine) {
        SyncService.authenticateUser($scope.loginData)
          .then(function (response) {
            if (response.status === 200 && response.data.valid === 'true') {
              $log.log('Logged in successfully.');
              LoginFactory.setLogin($scope.loginData).then(function () {
                $state.go('app.spots');
              });
            }
            else {
              $ionicPopup.alert({
                'title': 'Login Failure!',
                'template': 'Incorrect username or password.'
              });
            }
          },
          function (errorMessage) {
            $ionicPopup.alert({
              'title': 'Alert!',
              'template': errorMessage
            });
          }
        );
      }
      else {
        $ionicPopup.alert({
          'title': 'Offline!',
          'template': 'Can\'t login while offline.'
        });
      }
    };
  }
}());