(function () {
  'use strict';

  angular
    .module('app')
    .controller('ManageProjectController', ManageProjectController);

  ManageProjectController.$inject = ['$ionicPopup', '$log', '$state', 'ProjectFactory', 'SpotFactory'];

  function ManageProjectController($ionicPopup, $log, $state, ProjectFactory, SpotFactory) {
    var vm = this;

    var defaultTypes = ['geomorhic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
      'other'];

    vm.deleteType = deleteType;
    vm.filterDefaultTypes = filterDefaultTypes;
    vm.newRockUnit = newRockUnit;
    vm.otherFeatureTypes = [];
    vm.rockUnits = [];

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.rockUnits = ProjectFactory.getRockUnits();

      var savedOtherFeatures = ProjectFactory.getOtherFeatures();
      if (_.isEmpty(savedOtherFeatures)) {
        ProjectFactory.saveOtherFeatures(defaultTypes).then(
          function () {
            vm.otherFeatureTypes = ProjectFactory.getOtherFeatures();
          });
      }
      else vm.otherFeatureTypes = ProjectFactory.getOtherFeatures();
    }

    /**
     * Public Functions
     */

    function deleteType(i) {
      var customTypes = _.reject(vm.otherFeatureTypes, function (type) {
        return _.contains(defaultTypes, type);
      });
      var usedType = _.filter(SpotFactory.getSpots(), function (spot) {
        if (spot.properties.other_features) {
          return _.find(spot.properties.other_features, function (otherFeature) {
            return otherFeature.type === customTypes[i];
          }) || false;
        }
        return false;
      });
      var spotNames = [];
      _.each(usedType, function (spot) {
        spotNames.push(spot.properties.name);
      });
      if (usedType.length === 1) {
        $ionicPopup.alert({
          'title': 'Type in Use',
          'template': 'This type is used in the following Spot. Please remove the type from this Spot before' +
          ' deleting this type. Spot: ' + spotNames.join(', ')
        });
      }
      else if (usedType.length > 1) {
        $ionicPopup.alert({
          'title': 'Type in Use',
          'template': 'This type is used in the following Spots. Please remove the type from these Spots before' +
          ' deleting this type. Spots: ' + spotNames.join(', ')
        });
      }
      else {
        ProjectFactory.destroyOtherFeature(i + defaultTypes.length - 1);
      }
    }

    function filterDefaultTypes(type) {
      return _.indexOf(defaultTypes, type) === -1;
    }

    function newRockUnit() {
      $state.go('app.new-rock-unit');
    }
  }
}());
