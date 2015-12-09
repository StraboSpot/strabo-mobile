(function () {
  'use strict';

  angular
    .module('app')
    .controller('UserController', UserController);

  UserController.$inject = ['$ionicPopup', '$log', '$scope', 'UserFactory'];

  function UserController($ionicPopup, $log, $scope, UserFactory) {
    var vm = this;

    vm.data = null;
    vm.dataOriginal = null;
    vm.isPristine = isPristine;
    vm.login = null;
    vm.doLogin = doLogin;
    vm.doLogout = doLogout;
    vm.pristine = true;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.data = UserFactory.getUser();
      vm.dataOriginal = vm.data;

      // Watch whether form has been modified or not
      $scope.$watch('vm.isPristine()', function (pristine) {
        vm.pristine = pristine;
      });
    }

    function isPristine() {
      vm.data = _.pick(vm.data, _.identity);
      if (_.isEmpty(vm.data)) vm.data = null;
      return _.isEqual(vm.dataOriginal, vm.data);
    }

    /**
     * Public Functions
     */

    // Perform the login action when the user presses the login icon
    function doLogin() {
      if (navigator.onLine) {
        UserFactory.doLogin(vm.login).then(function () {
          vm.data = UserFactory.getUser();
          vm.dataOriginal = vm.data;
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
      vm.dataOriginal = null;
      UserFactory.clearUser();
      $log.log('Logged out');
    }

    function submit() {
      UserFactory.saveUser(vm.data);
      vm.dataOriginal = vm.data;
    }
  }
}());
