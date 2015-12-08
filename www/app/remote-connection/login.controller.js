(function () {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$ionicPopup', '$log', '$state', 'UserFactory'];

  function LoginController($ionicPopup, $log, $state, UserFactory) {
    var vm = this;

    vm.doLogin = doLogin;
    vm.loginData = {};        // Form data for the login modal
    vm.skip = skip;

    activate();

    function activate() {
      checkForLogin();
    }

    function checkForLogin() {
      var login = UserFactory.getCurrentUser();
      if (login) {
        $log.log('Skipping login page, already logged in as: ', login);
        vm.skip();
      }
    }

    // Perform the login action
    function doLogin() {
      if (navigator.onLine) {
        vm.data.login.email = vm.data.login.email.toLowerCase();
        UserFactory.doLogin(vm.data.login).then(function () {
          var currentUser = UserFactory.getCurrentUser();
          // As long as a current user has been set login was successful
          if (currentUser) {
            var encodedLogin = Base64.encode(vm.data.login.email + ':' + vm.data.login.password);
            var data = UserFactory.getCurrentUserData();
            if (!data) {
              data = {'email': vm.currentUser, 'encodedLogin': encodedLogin};
            }
            else {
              data.encodedLogin = encodedLogin;
            }
            UserFactory.saveUser(data);
            $state.go('app.spots');
          }
        });
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
