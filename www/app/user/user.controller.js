(function () {
  'use strict';

  angular
    .module('app')
    .controller('UserController', UserController);

  UserController.$inject = ['$ionicPopup', '$log', '$scope', 'RemoteServerFactory', 'UserFactory'];

  function UserController($ionicPopup, $log, $scope, RemoteServerFactory, UserFactory) {
    var vm = this;

    vm.data = {};
    vm.dataOriginal = {};
    vm.isPristine = isPristine;
    vm.doLogin = doLogin;
    vm.doLogout = doLogout;
    vm.hideActionButtons = {
      'login': false,
      'logout': true
    };
    vm.loggedIn = false;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.data = UserFactory.getUserData();
      if (vm.data.login) {
        $log.log('Logged in as: ', vm.data.login);
        vm.loggedIn = true;
        vm.dataOriginal = vm.data;
        hideLoginButton();
      }
      else {
        $log.log('No login!');
        vm.loggedIn = false;
        hideLogoutButton();
      }

      // Watch whether form has been modified or not
      $scope.$watch('vm.isPristine()', function (pristine) {
        vm.pristine = pristine;
      });
    }

    function isPristine() {
      vm.data = _.pick(vm.data, _.identity);
      return _.isEqual(vm.dataOriginal, vm.data);
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
      vm.data.login.email = vm.data.login.email.toLowerCase();
      // Authenticate user login
      if (navigator.onLine) {
        RemoteServerFactory.authenticateUser(vm.data.login).then(
          function (response) {
            if (response.status === 200 && response.data.valid === 'true') {
              $log.log('Logged in successfully.');
              hideLoginButton();
              UserFactory.setLogin(vm.data.login);
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

    // Destory the user data on when the logout button pressed
    function doLogout() {
      UserFactory.destroyLogin();
      vm.data = {};
      vm.loggedIn = false;
      hideLogoutButton();
      $log.log('Logged out');
    }

    function submit() {
      UserFactory.save(vm.data);
      vm.dataOriginal = vm.data;
    }
  }
}());
