(function () {
  'use strict';

  angular
    .module('app')
    .controller('AboutController', AboutController);

  AboutController.$inject = ['$ionicLoading', '$log', '$scope'];

  function AboutController($ionicLoading, $log, $scope) {
    var vm = this;
    var deploy = new Ionic.Deploy();

    vm.checkedForUpdates = false;
    vm.checkForUpdates = checkForUpdates;
    vm.doUpdate = doUpdate;
    vm.hasUpdate = false;
    vm.isWeb = typeof cordova === 'undefined';

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
        vm.checkedForUpdates = true;
        vm.hasUpdate = hasUpdate;
        $ionicLoading.hide();
        $scope.$apply();
      }, function (err) {
        $ionicLoading.hide();
        $log.error('Ionic Deploy: Unable to check for updates', err);
      });
    }

    // Update app code with new release from Ionic Deploy
    function doUpdate() {
      deploy.update().then(function (res) {
        $log.log('Ionic Deploy: Update Success! ', res);
      }, function (err) {
        $log.log('Ionic Deploy: Update error! ', err);
      }, function (prog) {
        $log.log('Ionic Deploy: Progress... ', prog);
      });
    }
  }
}());
