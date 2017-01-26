(function () {
  'use strict';

  angular
    .module('app')
    .controller('AboutController', AboutController);

  AboutController.$inject = ['$ionicLoading', '$ionicPopup', '$log', '$scope', 'IS_WEB'];

  function AboutController($ionicLoading, $ionicPopup, $log, $scope, IS_WEB) {
    var vm = this;
    var deploy = new Ionic.Deploy();

    vm.checkForUpdates = checkForUpdates;
    vm.doUpdate = doUpdate;
    vm.hasUpdate = false;
    vm.isWeb = IS_WEB;
    vm.msg = undefined;

    /**
     * Public Functions
     */

    // Check Ionic Deploy for new code
    function checkForUpdates() {
      $log.log('Ionic Deploy: Checking for updates');
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner>'
      });
      vm.checkedForUpdates = false;
      deploy.check().then(function (hasUpdate) {
        $log.log('Ionic Deploy: Update available: ' + hasUpdate);
        vm.hasUpdate = hasUpdate;
        if (!vm.hasUpdate) vm.msg = 'No Update Available';
        else vm.msg = undefined;
        $ionicLoading.hide();
        $scope.$apply();
      }, function (err) {
        vm.msg = 'Unable to check for updates.';
        $scope.$apply();
        $ionicLoading.hide();
        $log.error('Ionic Deploy: Unable to check for updates', err);
      });
    }

    // Update app code with new release from Ionic Deploy
    function doUpdate() {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner>'
      });
      deploy.update().then(function (res) {
        $log.log('Ionic Deploy: Update Success! ', res);
      }, function (err) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          'title': 'Error!',
          'template': 'Error downloading update: ' + err
        });
        $log.log('Ionic Deploy: Update error! ', err);
      }, function (prog) {
        $log.log('Ionic Deploy: Progress... ', prog);
      });
    }
  }
}());