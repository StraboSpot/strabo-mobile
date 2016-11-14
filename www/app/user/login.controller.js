(function () {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$ionicLoading', '$ionicPopup', '$log', '$scope', '$state', 'ProjectFactory',
    'UserFactory'];

  function LoginController($ionicLoading, $ionicPopup, $log, $scope, $state, ProjectFactory, UserFactory) {
    var vm = this;

    vm.login = null;
    vm.doLogin = doLogin;
    vm.skip = skip;

    activate();

    function activate() {
      checkForLogin();

      $scope.$on('$ionicView.loaded', function () {
        ionic.Platform.ready(function () {
          if (navigator && navigator.splashscreen) navigator.splashscreen.hide();
        });
      });
    }

    function checkForLogin() {
      vm.login = UserFactory.getUser();
      if (vm.login) {
        vm.login.password = '**********';
        $log.log('Skipping login page. Already logged in as: ', vm.login);
        vm.skip();
      }
    }

    // Perform the login action
    function doLogin() {
      if (navigator.onLine) {
        $ionicLoading.show({
          'template': '<ion-spinner></ion-spinner>'
        });
        UserFactory.doLogin(vm.login).then(function () {
          if (UserFactory.getUser()) vm.skip();
        }).finally(function () {
          $ionicLoading.hide();
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
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $state.go('app.manage-project');
      else $state.go('app.spots');
    }
  }
}());
