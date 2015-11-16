(function () {
  'use strict';

  angular
    .module('app')
    .controller('UserController', UserController);

  UserController.$inject = ['$ionicPopup', '$log', 'RemoteServerFactory', 'UserFactory'];

  function UserController($ionicPopup, $log, RemoteServerFactory, UserFactory) {
    var vm = this;

    vm.doLogin = doLogin;
    vm.doLogout = doLogout;
    vm.hideActionButtons = {
      'login': false,
      'logout': true
    };
    vm.loggedIn = false;
    vm.loginData = {};                  // Form data for the login modal
    vm.save = save;
    vm.userName = '';

    activate();

    /**
     * Private Functions
     */
    function activate() {
      checkForLogin();
    }

    function checkForLogin() {
      // is the user logged in from before?
      UserFactory.getLogin().then(
        function (login) {
          if (login !== null) {
            // we do have a login -- lets set the authentication
            $log.log('we have a login!', login);

            // set the email to the login email
            vm.loginData.email = login.email;
            hideLoginButton();
            vm.loggedIn = true;
            getUserName();
          }
          else {
            // nope, dont have a login
            $log.log('no login!');
            hideLogoutButton();
            vm.loggedIn = false;
          }
        });
    }

    function getUserName() {
      UserFactory.getUserName().then(function (userName) {
        vm.userName = userName;
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
              UserFactory.setLogin(vm.loginData);
              vm.loggedIn = true;
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
      UserFactory.destroyLogin();
      vm.loginData = {
        'email': null,
        'password': null
      };
      hideLogoutButton();
      vm.loggedIn = false;
      vm.userName = null;
    }

    function save() {
      UserFactory.setUserName(vm.userName).then(function () {
        $ionicPopup.alert({
          'title': 'User Profile!',
          'template': 'Saved user profile.<br>User Name: ' + vm.userName
        });
      });
    }
  }
}());
