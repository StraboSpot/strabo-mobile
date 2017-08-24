(function () {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$ionicLoading', '$ionicModal', '$ionicPopup', '$location', '$log', '$scope', '$state',
    'ProjectFactory', 'RemoteServerFactory', 'UserFactory', 'IS_WEB'];

  function LoginController($ionicLoading, $ionicModal, $ionicPopup, $location, $log, $scope, $state, ProjectFactory,
                           RemoteServerFactory, UserFactory, IS_WEB) {
    var vm = this;

    vm.createAccountModal = {};
    vm.login = null;
    vm.newAccountInfo = {};

    vm.createAccount = createAccount;
    vm.doLogin = doLogin;
    vm.showCreateAccountModal = showCreateAccountModal;
    vm.skip = skip;

    activate();

    /**
     * Private Functions
     */


    function activate() {
      checkForLogin();

      $ionicModal.fromTemplateUrl('app/login/create-account-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.createAccountModal = modal;
      });

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

      if (IS_WEB && GETcredentials && GETproject.id) $state.go('app.manage-project');
      else if (vm.login) {
        vm.login.password = '**********';
        $log.log('Skipping login page. Already logged in as: ', vm.login);
        vm.skip();
      }
    }

    /**
     * Public Functions
     */

    function createAccount() {
      if (!vm.newAccountInfo.first_name || !vm.newAccountInfo.last_name || !vm.newAccountInfo.email || !vm.newAccountInfo.password) {
        $ionicPopup.alert({
          'title': 'Incomplete Form',
          'template': 'All fields are required. Please complete all form fields.'
        });
      }
      else if (vm.newAccountInfo.password !== vm.newAccountInfo.confirm_password) {
        $ionicPopup.alert({
          'title': 'Mismatched Passwords',
          'template': 'Please make sure the passwords you\'ve entered match.'
        });
      }
      else {
        RemoteServerFactory.registerUser(vm.newAccountInfo).then(function (response) {
          $log.log('Registered User: ', response);
          var newUserData = response.data;

          if (newUserData.valid == "false") {
            $ionicPopup.alert({
              'title': 'Error',
              'template': newUserData.message
            });
          }
          else {
            vm.createAccountModal.hide();
            $ionicPopup.alert({
              'title': 'Success!',
              'template': newUserData.message
            });
          }
        }, function (err) {
          $log.log('Error:', err);
          $ionicPopup.alert({
            'title': 'Connection Error',
            'template': 'There was an error connecting to the server. You may try again later or use the Skip button' +
            ' in the bottom right to proceed without creating an account. Until you register and login you will not' +
            ' be able to sync any data with the server.'
          });
        });
      }
    }

    // Perform the login action
    function doLogin() {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner>'
      });
      UserFactory.doLogin(vm.login).then(function () {
        if (UserFactory.getUser()) vm.skip();
      }).finally(function () {
        $ionicLoading.hide();
      });
    }

    function showCreateAccountModal() {
      if (navigator.onLine) {
        vm.newAccountInfo = {};
        vm.createAccountModal.show();
      }
      else {
        $ionicPopup.alert({
          'title': 'Offline!',
          'template': 'Can\'t create an account while offline. You may use the Skip button in the bottom right' +
          ' to proceed without creating an account. Until you register and login you will not be able to sync any' +
          ' data with the server.'
        });
      }
    }

    function skip() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $state.go('app.manage-project');
      else $state.go('app.spots');
    }
  }
}());
