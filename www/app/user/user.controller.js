(function () {
  'use strict';

  angular
    .module('app')
    .controller('UserController', UserController);

  UserController.$inject = ['$ionicPopup', '$log', '$scope', 'UserFactory'];

  function UserController($ionicPopup, $log, $scope, UserFactory) {
    var vm = this;

    vm.data = null;
    vm.login = null;
    vm.doLogin = doLogin;
    vm.doLogout = doLogout;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.data = UserFactory.getUser();
    }

    /**
     * Public Functions
     */

    // Perform the login action when the user presses the login icon
    function doLogin() {
      if (navigator.onLine) {
        UserFactory.doLogin(vm.login).then(function () {
          vm.data = UserFactory.getUser();
        });
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
      vm.login = null;
      vm.data = null;
      UserFactory.clearUser();
      $log.log('Logged out');
    }

    function submit() {
      UserFactory.saveUser(vm.data);
    }
  }
}());
