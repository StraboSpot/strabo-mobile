(function () {
  'use strict';

  angular
    .module('app')
    .controller('UserController', UserController);

  UserController.$inject = ['$ionicPopup', '$log', 'LoginFactory', 'RemoteServerFactory'];

  function UserController($ionicPopup, $log, LoginFactory, RemoteServerFactory) {
    var vm = this;

    vm.doLogin = doLogin;
    vm.doLogout = doLogout;
    vm.hideActionButtons = {
      'login': false,
      'logout': true
    };
    vm.loginData = {};                  // Form data for the login modal

    activate();

    /**
     * Private Functions
     */
    function activate() {
      checkForLogin();
    }

    function checkForLogin() {
      // is the user logged in from before?
      LoginFactory.getLogin().then(
        function (login) {
          if (login !== null) {
            // we do have a login -- lets set the authentication
            $log.log('we have a login!', login);

            // set the email to the login email
            vm.loginData.email = login.email;
            hideLoginButton();
          }
          else {
            // nope, dont have a login
            $log.log('no login!');
            hideLogoutButton();
          }
        });
    }

    function hideLoginButton() {
      vm.hideActionButtons.login = true;
      vm.hideActionButtons.logout = false;
    }

    function hideLogoutButton() {
      vm.hideActionButtons.login = false;
      vm.hideActionButtons.logout = true;
    }

    /**
     * Public Functions
     */

    // Perform the login action when the user presses the login icon
    function doLogin() {
      vm.loginData.email = vm.loginData.email.toLowerCase();
      // Authenticate user login
      if (navigator.onLine) {
        RemoteServerFactory.authenticateUser(vm.loginData).then(
          function (response) {
            if (response.status === 200 && response.data.valid === 'true') {
              $log.log('Logged in successfully.');
              hideLoginButton();
              LoginFactory.setLogin(vm.loginData);
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

    // Perform the logout action when the user presses the logout icon
    function doLogout() {
      $log.log('Logged out');
      // we do have a login so we should destroy the login because the user wants to logout
      LoginFactory.destroyLogin();
      vm.loginData = {
        'email': null,
        'password': null
      };
      hideLogoutButton();
    }
  }
}());
