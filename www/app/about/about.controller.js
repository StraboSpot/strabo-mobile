(function () {
  'use strict';

  angular
    .module('app')
    .controller('AboutController', AboutController);

  AboutController.$inject = ['$scope'];

  function AboutController($scope) {
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
      console.log('Ionic Deploy: Checking for updates');
      vm.checkedForUpdates = false;
      deploy.check().then(function(hasUpdate) {
        console.log('Ionic Deploy: Update available: ' + hasUpdate);
        vm.checkedForUpdates = true;
        vm.hasUpdate = hasUpdate;
        $scope.$apply();
      }, function(err) {
        console.error('Ionic Deploy: Unable to check for updates', err);
      });
    }
    
    // Update app code with new release from Ionic Deploy
    function doUpdate() {
      deploy.update().then(function(res) {
        console.log('Ionic Deploy: Update Success! ', res);
      }, function(err) {
        console.log('Ionic Deploy: Update error! ', err);
      }, function(prog) {
        console.log('Ionic Deploy: Progress... ', prog);
      });
    }
  }
}());
