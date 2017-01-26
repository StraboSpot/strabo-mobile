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
        $log.log('First, force logout and destroy project');
        UserFactory.clearUser();
        ProjectFactory.destroyProject();
        SpotFactory.clearAllSpots();
        ImageFactory.deleteAllImages();
        OtherMapsFactory.destroyOtherMaps();
        $log.log('Credentials set, check for validity.');
        GETcredentials = atob(GETcredentials);
        $log.log('Credentials decoded: ',GETcredentials);
        GETlogin.email = GETcredentials.split("*****")[0];
        GETlogin.password = GETcredentials.split("*****")[1];
        GETlogin.encoded_login = btoa(GETlogin.email+':'+GETlogin.password);
        $log.log('Username: ',GETlogin.email);
        $log.log('Password: ',GETlogin.password);
        $log.log('encoded: ',GETlogin.encoded_login);

        UserFactory.doLogin(GETlogin).then(function () {
          $log.log('Made it past doLogin.');
          if (UserFactory.getUser()){
            $log.log('GetUser: ', UserFactory.getUser());
            ProjectFactory.setUser(UserFactory.getUser());
            ProjectFactory.loadProjectRemote(GETproject).then(function () {
              $state.go('app.manage-project');
            });
          }
        }).finally(function () {
          $ionicLoading.hide();
        });
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
