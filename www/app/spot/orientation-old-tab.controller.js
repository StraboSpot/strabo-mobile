(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationOldTabController', OrientationOldTabController);

  OrientationOldTabController.$inject = ['$log', '$scope', '$state'];

  function OrientationOldTabController($log, $scope, $state) {
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In OrientationOldTabController');
    }
  }
}());
