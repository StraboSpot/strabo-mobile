(function () {
  'use strict';

  angular
    .module('app')
    .controller('UserController', UserController);

  UserController.$inject = ['$ionicPopup', '$log', '$scope', 'UserFactory'];

  function UserController($ionicPopup, $log, $scope, UserFactory) {
    var vm = this;

    vm.currentUser = null;
    vm.data = {};
    vm.dataOriginal = {};
    vm.isPristine = isPristine;
    vm.doLogin = doLogin;
    vm.doLogout = doLogout;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.currentUser = UserFactory.getCurrentUser();
      if (vm.currentUser) {
        vm.data = UserFactory.getCurrentUserData();
        vm.dataOriginal = vm.data;
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

    /**
     * Public Functions
     */

    // Perform the login action when the user presses the login icon
    function doLogin() {
      if (navigator.onLine) {
        vm.data.login.email = vm.data.login.email.toLowerCase();
        UserFactory.doLogin(vm.data.login).then(function () {
          vm.currentUser = UserFactory.getCurrentUser();
          // As long as a current user has been set login was successful
          if (vm.currentUser) {
            var encodedLogin = Base64.encode(vm.data.login.email + ':' + vm.data.login.password);
            vm.data = UserFactory.getCurrentUserData();
            if (!vm.data) {
              vm.data = {'email': vm.currentUser, 'encodedLogin': encodedLogin};
            }
            else {
              vm.data.encodedLogin = encodedLogin;
            }
            UserFactory.saveUser(vm.data);
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

    // Destory the user data on when the logout button pressed
    function doLogout() {
      vm.currentUser = null;
      vm.data = {};
      UserFactory.clearCurrentUser();
      $log.log('Logged out');
    }

    function submit() {
      UserFactory.saveUser(vm.data);
      vm.dataOriginal = vm.data;
    }
  }
}());
