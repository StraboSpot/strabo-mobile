(function () {
  'use strict';

  angular
    .module('app')
    .controller('_3DStructuresTabController', _3DStructuresTabController);

  _3DStructuresTabController.$inject = ['$log', '$scope', '$state'];

  function _3DStructuresTabController($log, $scope, $state) {
    var vmParent = $scope.vm;
    vmParent.loadTab($state);     // Need to load current state into parent

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In 3DStructuresTabController');

      if (!vmParent.spot.properties._3d_structures) vmParent.spot.properties._3d_structures = {};
      vmParent.data = vmParent.spot.properties._3d_structures;
    }
  }
}());
