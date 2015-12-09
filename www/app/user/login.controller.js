(function () {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$ionicPopup', '$log', '$state', 'UserFactory'];

  function LoginController($ionicPopup, $log, $state, UserFactory) {
    var vm = this;

    vm.login = null;
    vm.doLogin = doLogin;
    vm.skip = skip;

    activate();

    function activate() {
      checkForLogin();
    }

    function checkForLogin() {
      var login = UserFactory.getUser();
      if (login) {
        $log.log('Skipping login page. Already logged in as: ', login);
        vm.skip();
      }
    }

    // Perform the login action
    function doLogin() {
      if (navigator.onLine) {
        UserFactory.doLogin(vm.login).then(function () {
          if (UserFactory.getUser()) $state.go('app.spots');
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
