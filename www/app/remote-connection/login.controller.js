(function () {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$ionicPopup', '$log', '$state', 'RemoteServerFactory', 'UserFactory'];

  function LoginController($ionicPopup, $log, $state, RemoteServerFactory, UserFactory) {
    var vm = this;

    vm.doLogin = doLogin;
    vm.loginData = {};        // Form data for the login modal
    vm.skip = skip;

    activate();

    function activate() {
      checkForLogin();
    }

    function checkForLogin() {
      var login = UserFactory.getLogin();
      if (login) {
        $log.log('Skipping login page, already logged in as: ', login);
        vm.skip();
      }
    }

    // Perform the login action
    function doLogin() {
      vm.loginData.email = vm.loginData.email.toLowerCase();
      // Authenticate user login
      if (navigator.onLine) {
        RemoteServerFactory.authenticateUser(vm.loginData).then(
          function (response) {
            if (response.status === 200 && response.data.valid === 'true') {
              $log.log('Logged in successfully.');
              UserFactory.setLogin(vm.loginData).then(function () {
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
    }

    function skip() {
      $state.go('app.spots');
    }
  }
}());
