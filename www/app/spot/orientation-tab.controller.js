(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationTabController', OrientationTabController);

  OrientationTabController.$inject = ['$log', '$scope', '$state'];

  function OrientationTabController($log, $scope, $state) {
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In OrientationTabController');
    }
  }
}());
