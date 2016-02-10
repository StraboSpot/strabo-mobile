(function () {
  'use strict';

  angular
    .module('app')
    .controller('InferencesTabController', InferencesTabController);

  InferencesTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state'];

  function InferencesTabController($ionicModal, $ionicPopup, $log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;
    var index;
    var deleteRel;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.addRelationship = addRelationship;
    vm.addThisRelationship = addThisRelationship;
    vm.closeModal = closeModal;
    vm.deformationEvent = undefined;
    vm.deleteRelationship = deleteRelationship;
    vm.editRelationship = editRelationship;
    vm.editThisRelationship = editThisRelationship;
    vm.observationA = '-- Select an Observation --';
    vm.observationB = '-- Select an Observation --';
    vm.operationAdd = true;
    vm.orientationData = ['-- Select an Observation --'];
    vm.otherRelationship = undefined;
    vm.outcropInPlaceChoices = ['5 - definitely in place', '4', '3',
      '2', '1 - float'];
    vm.relationship = '-- Select a Relationship --';
    vm.relationshipChoices = ['-- Select a Relationship --', 'cross-cuts', 'is cut by', 'is younger than', 'is older than',
      'is lower metamorphic grade than', 'is higher metamorphic grade than', 'is included within', 'includes', 'other'];
    vm.relationshipModal = {};
    vm.toggleRosetta = toggleRosetta;

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
      $ionicModal.fromTemplateUrl('app/spot/relationship-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.relationshipModal = modal;
      });
    }

    function gatherOrientationData() {
      if (vmParent.spot.properties.orientation_data) {
        _.each(vmParent.spot.properties.orientation_data, function (orientation) {
          if (orientation.feature_type && (orientation.strike || orientation.trend)) {
            var name = orientation.feature_type.replace(/_/g, ' ');
            var value = orientation.strike ? orientation.strike : '';
            if (!value) value = orientation.trend ? orientation.trend : '';
            vm.orientationData.push(name + ' ' + value);
          }
        });
      }
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
      vm.deformationEvent = undefined;
      vm.observationA = '-- Select an Observation --';
      vm.observationB = '-- Select an Observation --';
      vm.otherRelationship = undefined;
      vm.relationship = '-- Select a Relationship --';
      index = undefined;
    }

    /**
     * Public Functions
     */

    function addRelationship() {
      if (vm.orientationData.length > 1) {
        vm.operationAdd = true;
        vm.relationshipModal.show();
      }
      else {
        $ionicPopup.alert({
          'title': 'Orientation Data Needed',
          'template': 'There must be at least two orientation observations for this Spot before any relationships' +
          ' can be made. Valid orientation observations for relationships must include both a feature type and a' +
          ' strike or trend.'
        });
      }
    }

    function addThisRelationship() {
      vm.relationshipModal.hide();
      if (!vmParent.spot.properties.inferences.relationships) vmParent.spot.properties.inferences.relationships = [];
      vmParent.spot.properties.inferences.relationships.push({
        'deformation_event': vm.deformationEvent,
        'observationA': vm.observationA,
        'observationB': vm.observationB,
        'other_relationship': vm.otherRelationship,
        'relationship': vm.relationship
      });
      resetRelationshipVariables();
    }

    function closeModal(modal) {
      resetRelationshipVariables();
      vm[modal].hide();
    }

    function deleteRelationship(i) {
      deleteRel = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Relationship',
        'template': 'Are you sure you want to delete this relationship?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.inferences.relationships.splice(i, 1);
          if (vmParent.spot.properties.inferences.relationships.length === 0) {
            delete vmParent.spot.properties.inferences.relationships;
          }
        }
        deleteRel = false;
      });
    }

    function editRelationship(i) {
      if (!deleteRel) {
        vm.deformationEvent = vmParent.spot.properties.inferences.relationships[i].deformation_event;
        vm.observationA = vmParent.spot.properties.inferences.relationships[i].observationA;
        vm.observationB = vmParent.spot.properties.inferences.relationships[i].observationB;
        vm.otherRelationship = vmParent.spot.properties.inferences.relationships[i].other_relationship;
        vm.relationship = vmParent.spot.properties.inferences.relationships[i].relationship;
        vm.operationAdd = false;
        index = i;
        vm.relationshipModal.show();
      }
    }

    function editThisRelationship() {
      vm.relationshipModal.hide();
      vmParent.spot.properties.inferences.relationships.splice(index, 1, {
        'deformation_event': vm.deformationEvent,
        'observationA': vm.observationA,
        'observationB': vm.observationB,
        'other_relationship': vm.otherRelationship,
        'relationship': vm.relationship
      });
      resetRelationshipVariables();
    }

    function toggleRosetta() {
      if (!vmParent.spot.properties.inferences.rosetta_outcrop) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Turn off Rosetta?',
          'template': 'By toggling off Rosetta you will be clearing all Rosetta data for this Spot. Continue?'
        });
        confirmPopup.then(function (res) {
          if (res) delete vmParent.spot.properties.inferences;
          else vmParent.spot.properties.inferences.rosetta_outcrop = true;
        });
      }
    }
  }
}());
