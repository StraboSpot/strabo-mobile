(function () {
  'use strict';

  angular
    .module('app')
    .controller('InferencesTabController', InferencesTabController);

  InferencesTabController.$inject = ['$log', '$scope', '$state', 'ProjectFactory'];

  function InferencesTabController($log, $scope, $state, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = undefined;
    vmParent.choices = undefined;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.featureLevelRelationships = [];
    vm.outcropInPlaceChoices = ['5 - definitely in place', '4', '3',
      '2', '1 - float'];
    vm.relatedRosettaChoices = {};
    vm.spotLevelRelationships = [];

    vm.goToRelationship = goToRelationship;
    vm.goToRelationships = goToRelationships;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In InferencesTabController');

      gatherRosettaChoices();
      loadRelationships();
    }

    function gatherRosettaChoices() {
      vm.relatedRosettaChoices = _.filter(vmParent.spots, function (spot) {
        if (spot.properties.inferences && spot.properties.inferences.rosetta_outcrop) {
          return spot.properties.inferences.rosetta_outcrop;
        }
      });
      vm.relatedRosettaChoices = _.reject(vm.relatedRosettaChoices, function (spot) {
        return spot.properties.id === vmParent.spot.properties.id;
      });
    }

    function loadRelationships() {
      var relationships = ProjectFactory.getRelationshipsBySpotId(vmParent.spot.properties.id);

      _.each(relationships, function (relationship) {
        if (relationship.a && relationship.a.spots && _.contains(relationship.a.spots, vmParent.spot.properties.id)) {
          if (!_.contains(vm.spotLevelRelationships, relationship)) vm.spotLevelRelationships.push(relationship);
        }
        if (relationship.a && relationship.a.features && relationship.a.features[vmParent.spot.properties.id]) {
          vm.featureLevelRelationships = _.reject(vm.featureLevelRelationships, function (featureLevelRelationship) {
            return featureLevelRelationship.id === relationship.id;
          });
          vm.featureLevelRelationships.push(relationship);
        }
        if (relationship.b && relationship.b.spots && _.contains(relationship.b.spots, vmParent.spot.properties.id)) {
          if (!_.contains(vm.spotLevelRelationships, relationship)) vm.spotLevelRelationships.push(relationship);
        }
        if (relationship.b && relationship.b.features && relationship.b.features[vmParent.spot.properties.id]) {
          vm.featureLevelRelationships = _.reject(vm.featureLevelRelationships, function (featureLevelRelationship) {
            return featureLevelRelationship.id === relationship.id;
          });
          vm.featureLevelRelationships.push(relationship);
        }
      });
    }

    /**
     * Public Functions
     */

    function goToRelationship(id) {
      vmParent.submit('/app/relationships/' + id);
    }

    function goToRelationships() {
      vmParent.submit('/app/relationships');
    }
  }
}());
