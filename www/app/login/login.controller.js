(function () {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$ionicLoading', '$ionicPopup', '$location', '$log', '$scope', '$state', 'ImageFactory',
    'OtherMapsFactory', 'ProjectFactory', 'SpotFactory', 'UserFactory', 'IS_WEB'];

  function LoginController($ionicLoading, $ionicPopup, $location, $log, $scope, $state, ImageFactory, OtherMapsFactory,
                           ProjectFactory, SpotFactory, UserFactory, IS_WEB) {
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
      $log.log('Check here for GET credentials: ', $location.search()['credentials']);
      $log.log('Check here for GET projectid: ', $location.search()['projectid']);

      var GETlogin = {};
      var GETcredentials = $location.search()['credentials'];
      var GETproject = {};
      GETproject.id = $location.search()['projectid'];

      if(IS_WEB && GETcredentials && GETproject.id){
        $state.go('app.manage-project');
      }else if (vm.login) {
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
