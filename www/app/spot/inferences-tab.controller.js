(function () {
  'use strict';

  angular
    .module('app')
    .controller('InferencesTabController', InferencesTabController);

  InferencesTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state'];

  function InferencesTabController($ionicModal, $ionicPopup, $log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = undefined;
    vmParent.choices = undefined;
    vmParent.loadTab($state);  // Need to load current state into parent

    var relationshipToEdit;
    var delRelationship;

    vm.addRelationship = addRelationship;
    vm.closeModal = closeModal;
    vm.deleteRelationship = deleteRelationship;
    vm.editRelationship = editRelationship;
    vm.orientationData = {'-- Select an Observation --': '-- Select an Observation --'};
    vm.outcropInPlaceChoices = ['5 - definitely in place', '4', '3',
      '2', '1 - float'];
    vm.relationship = {
      'deformation_event': undefined,
      'observationA': '-- Select an Observation --',
      'observationB': '-- Select an Observation --',
      'other_relationship': undefined,
      'relationship_type': '-- Select a Relationship --'
    };
    vm.relatedRosettaChoices = {};
    vm.relationshipTypeChoices = ['-- Select a Relationship --', 'cross-cuts', 'is cut by', 'is younger than', 'is older than',
      'is lower metamorphic grade than', 'is higher metamorphic grade than', 'is included within', 'includes', 'other'];
    vm.relationshipModal = {};
    vm.submitRelationship = submitRelationship;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In InferencesTabController');

      createModal();
      gatherRosettaChoices();
      gatherOrientationData();
    }

    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/inferences-relationship-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.relationshipModal = modal;
      });
    }

    function gatherOrientationData() {
      _.each(vmParent.spot.properties.orientation_data, function (orientation) {
        vm.orientationData[orientation.id] = orientation.label;
        _.each(orientation.associated_orientation, function (associated_orientation) {
          vm.orientationData[associated_orientation.id] = associated_orientation.label;
        });
      });
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

    function resetRelationshipVariables() {
      vm.relationship = {
        'deformation_event': undefined,
        'observationA': '-- Select an Observation --',
        'observationB': '-- Select an Observation --',
        'other_relationship': undefined,
        'relationship_type': '-- Select a Relationship --'
      };
      relationshipToEdit = undefined;
    }

    /**
     * Public Functions
     */

    function addRelationship() {
      vm.relationshipModal.show();
    }

    function closeModal(modal) {
      resetRelationshipVariables();
      vm[modal].hide();
    }

    function deleteRelationship(i) {
      delRelationship = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Relationship',
        'template': 'Are you sure you want to delete this relationship?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.inferences.relationships.splice(i, 1);
          if (vmParent.spot.properties.inferences.relationships.length === 0) {
            delete vmParent.spot.properties.inferences.relationships;
            if (_.isEmpty(vmParent.spot.properties.inferences)) delete vmParent.spot.properties.inferences;
          }
        }
        delRelationship = false;
      });
    }

    function editRelationship(i) {
      if (!delRelationship) {
        vm.relationship = {
          'deformation_event': vmParent.spot.properties.inferences.relationships[i].deformation_event,
          'observationA': vmParent.spot.properties.inferences.relationships[i].observationA,
          'observationB': vmParent.spot.properties.inferences.relationships[i].observationB,
          'other_relationship': vmParent.spot.properties.inferences.relationships[i].other_relationship,
          'relationship_type': vmParent.spot.properties.inferences.relationships[i].relationship_type
        };
        relationshipToEdit = i;
        vm.relationshipModal.show();
      }
    }

    function submitRelationship() {
      if (vm.relationship.observationA === '-- Select an Observation --' ||
        vm.relationship.relationship_type === '-- Select a Relationship --' ||
        vm.relationship.observationB === '-- Select an Observation --') {
        $ionicPopup.alert({
          'title': 'Incomplete Data',
          'template': 'Please be sure to select at least two observations and a relationship.'
        });
      }
      else {
        if (!vmParent.spot.properties.inferences) vmParent.spot.properties.inferences = {};
        if (!vmParent.spot.properties.inferences.relationships) vmParent.spot.properties.inferences.relationships = [];
        if (vm.relationship.relationship_type !== 'other') delete vm.relationship.other_relationship;
        if (angular.isDefined(relationshipToEdit)) {
          vmParent.spot.properties.inferences.relationships.splice(relationshipToEdit, 1, vm.relationship);
        }
        else vmParent.spot.properties.inferences.relationships.push(vm.relationship);
        vm.relationshipModal.hide();
        resetRelationshipVariables();
      }
    }
  }
}());
