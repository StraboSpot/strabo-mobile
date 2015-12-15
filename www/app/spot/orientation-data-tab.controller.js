(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationDataTabController', OrientationDataTabController);

  OrientationDataTabController.$inject = ['$ionicPopup', '$log', '$scope', '$state', 'SpotFactory'];

  function OrientationDataTabController($ionicPopup, $log, $scope, $state, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.addAssociatedLine = addAssociatedLine;
    vm.addAssociatedPlane = addAssociatedPlane;
    vm.addLine = addLine;
    vm.addPlane = addPlane;
    vm.addTabularZone = addTabularZone;
    vm.deleteAssociatedOrientation = deleteAssociatedOrientation;
    vm.deleteOrientation = deleteOrientation;
    vm.goToAssociatedOrientation = goToAssociatedOrientation;
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

    function addAssociatedLine(index) {
      SpotFactory.setCurrentOrientationIndex(index, undefined);
      $state.go('app.new-linear-orientation');
    }

    function addAssociatedPlane(index) {
      SpotFactory.setCurrentOrientationIndex(index, undefined);
      $state.go('app.new-planar-orientation');
    }

    function addLine() {
      SpotFactory.setCurrentOrientationIndex(undefined, undefined);
      $state.go('app.new-linear-orientation');
    }

    function addPlane() {
      SpotFactory.setCurrentOrientationIndex(undefined, undefined);
      $state.go('app.new-planar-orientation');
    }

    function addTabularZone() {
      SpotFactory.setCurrentOrientationIndex(undefined, undefined);
      $state.go('app.new-tabular-zone-orientation');
    }

    function deleteAssociatedOrientation(index, associatedIndex) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Associated Orientation',
        'template': 'Are you sure you want to delete this  associated orientation?'
      });
      confirmPopup.then(function (res) {
        if (res) SpotFactory.destroyOrientation(index, associatedIndex);
      });
    }

    function deleteOrientation(index) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Orientation',
        'template': 'Are you sure you want to delete this orientation?'
      });
      confirmPopup.then(function (res) {
        if (res) SpotFactory.destroyOrientation(index, undefined);
      });
    }

    function goToAssociatedOrientation(index, associatedIndex) {
      console.log('i ', index, 'ai: ', associatedIndex);
      SpotFactory.setCurrentOrientationIndex(index, associatedIndex);
      $state.go('app.orientation');
    }

    function goToOrientation(index) {
      SpotFactory.setCurrentOrientationIndex(index, undefined);
      $state.go('app.orientation');
    }
  }
}());
