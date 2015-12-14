(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationDataTabController', OrientationDataTabController);

  OrientationDataTabController.$inject = ['$log', '$scope', '$state', 'SpotFactory'];

  function OrientationDataTabController($log, $scope, $state, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.addLine = addLine;
    vm.addPlane = addPlane;
    vm.addTabularZone = addTabularZone;
    vm.goToOrientation = goToOrientation;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In OrientationDataTabController');
    }

    /**
     * Public Functions
     */

    function addLine() {
      SpotFactory.setCurrentOrientationIndex(null);
      $state.go('app.new-linear-orientation');
    }

    function addPlane() {
      SpotFactory.setCurrentOrientationIndex(null);
      $state.go('app.new-planar-orientation');
    }

    function addTabularZone() {
      SpotFactory.setCurrentOrientationIndex(null);
      $state.go('app.new-tabular-zone-orientation');
    }

    function goToOrientation(orientation, index) {
      console.log('here', orientation);
      SpotFactory.setCurrentOrientationIndex(index);
      $state.go('app.orientation');
    }
  }
}());
