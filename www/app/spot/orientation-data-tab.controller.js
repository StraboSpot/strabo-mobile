(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationDataTabController', OrientationDataTabController);

  OrientationDataTabController.$inject = ['$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory', 'SpotFactory'];

  function OrientationDataTabController($ionicPopup, $log, $scope, $state, DataModelsFactory, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = undefined;
    vmParent.choices = undefined;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.addAssociatedLine = addAssociatedLine;
    vm.addAssociatedPlane = addAssociatedPlane;
    vm.addLine = addLine;
    vm.addPlane = addPlane;
    vm.addTabularZone = addTabularZone;
    vm.deleteAssociatedOrientation = deleteAssociatedOrientation;
    vm.deleteOrientation = deleteOrientation;
    vm.featureTypeLabel = featureTypeLabel;
    vm.goToAssociatedOrientation = goToAssociatedOrientation;
    vm.goToOrientation = goToOrientation;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In OrientationDataTabController');

      handleOrienations();
    }

    function assignName(inData) {
      inData.name = '';
      if (inData.feature_type) inData.name += DataModelsFactory.getFeatureTypeLabel(inData.feature_type);
      else inData.name += inData.orientation_type.split('_')[0] + ' feature';
      if (inData.strike) inData.name += ' ' + inData.strike.toString();
      else if (inData.trend) inData.name += ' ' + inData.trend.toString();
    }

    function handleProperties(ids, orientation) {
      if (!orientation.name) assignName(orientation);
      if (!orientation.id) {
        orientation.id = Math.floor((new Date().getTime() + Math.random()) * 10);
        while (_.indexOf(ids, orientation.id) !== -1) {
          orientation.id = Math.floor((new Date().getTime() + Math.random()) * 10);
        }
        ids.push(orientation.id);
      }
    }

    function handleOrienations() {
      var ids = [];
      _.each(vmParent.data.orientation_data, function (orientation) {
        handleProperties(ids, orientation);
        _.each(orientation.associated_orientation, function (associated_orientation) {
          handleProperties(ids, associated_orientation);
        });
      });
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

    function featureTypeLabel(type) {
      return DataModelsFactory.getFeatureTypeLabel(type);
    }

    function goToAssociatedOrientation(index, associatedIndex) {
      $log.log('i ', index, 'ai: ', associatedIndex);
      SpotFactory.setCurrentOrientationIndex(index, associatedIndex);
      $state.go('app.orientation');
    }

    function goToOrientation(index) {
      SpotFactory.setCurrentOrientationIndex(index, undefined);
      $state.go('app.orientation');
    }
  }
}());
