(function () {
  'use strict';

  angular
    .module('app')
    .controller('OtherFeaturesTabController', OtherFeaturesTabController);

  OtherFeaturesTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'ProjectFactory'];

  function OtherFeaturesTabController($ionicModal, $ionicPopup, $log, $scope, $state, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = undefined;
    vmParent.choices = undefined;
    vmParent.loadTab($state);  // Need to load current state into parent

    var delFeature;
    var defaultTypes = ['geomorhic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
      'other'];
    var featureToEdit;

    vm.addFeature = addFeature;
    vm.closeModal = closeModal;
    vm.deleteFeature = deleteFeature;
    vm.deleteType = deleteType;
    vm.editFeature = editFeature;
    vm.editTypes = editTypes;
    vm.filterDefaults = filterDefaults;
    vm.newFeatureType = '';
    vm.otherFeature = {
      'type': undefined,
      'name': undefined,
      'description': undefined
    };
    vm.otherFeatureModal = {};
    vm.otherFeatureTypes = [];
    vm.submitFeature = submitFeature;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In OtherFeaturesTabController');

      vm.addedTypes = _.without(vm.otherFeatureTypes, 'geomorhic', 'hydrologic', 'paleontological', 'igneous',
        'metamorphic', 'sedimentological', 'other');

      var savedOtherFeatures = ProjectFactory.getOtherFeatures();
      if (_.isEmpty(savedOtherFeatures)) {
        ProjectFactory.saveOtherFeatures(defaultTypes).then(
          function () {
            vm.otherFeatureTypes = ProjectFactory.getOtherFeatures();
          });
      }
      else vm.otherFeatureTypes = ProjectFactory.getOtherFeatures();

      createModal();
    }

    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/other-feature-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.otherFeatureModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/spot/other-feature-types-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.otherFeatureTypesModal = modal;
      });
    }

    function saveFeature() {
      if (angular.isDefined(featureToEdit)) {
        vmParent.spot.properties.other_features.splice(featureToEdit, 1, vm.otherFeature);
      }
      else vmParent.spot.properties.other_features.push(vm.otherFeature);
      vm.otherFeatureModal.hide();
    }

    /**
     * Public Functions
     */

    function addFeature() {
      featureToEdit = undefined;
      vm.otherFeature = {};
      vm.otherFeatureModal.show();
    }

    function closeModal(modal) {
      vm.newFeatureType = '';
      vm[modal].hide();
    }

    function deleteFeature(i) {
      delFeature = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Feature',
        'template': 'Are you sure you want to delete this feature?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.other_features.splice(i, 1);
          if (vmParent.spot.properties.other_features.length === 0) {
            delete vmParent.spot.properties.other_features;
          }
        }
        delFeature = false;
      });
    }

    function deleteType(i) {
      var customTypes = _.reject(vm.otherFeatureTypes, function (type) {
        return _.contains(defaultTypes, type);
      });
      var usedType = _.filter(vmParent.spots, function (spot) {
        return _.filter(spot.properties.other_features, function (otherFeature) {
          return otherFeature.type === customTypes[i];
        });
      });
      var spotNames = [];
      _.each(usedType, function (spot) {
        spotNames.push(spot.properties.name);
      });
      if (usedType) {
        $ionicPopup.alert({
          'title': 'Type in Use',
          'template': 'This type is used in the following Spot(s). Please remove the type from these Spot(s) before' +
          ' deleting this type. Spot(s): ' + spotNames.join(', ')
        });
      }
      else customTypes.splice(i, 1);
    }

    function editFeature(i) {
      if (!delFeature) {
        vm.otherFeature = {
          'type': vmParent.spot.properties.other_features[i].type,
          'name': vmParent.spot.properties.other_features[i].name,
          'description': vmParent.spot.properties.other_features[i].description
        };
        featureToEdit = i;
        vm.otherFeatureModal.show();
      }
    }

    function editTypes() {
      vm.otherFeatureTypesModal.show();
    }

    function filterDefaults(type) {
      return _.indexOf(defaultTypes, type) === -1;
    }

    function submitFeature() {
      if (!vm.otherFeature.type || !vm.otherFeature.name) {
        $ionicPopup.alert({
          'title': 'Incomplete Data',
          'template': 'Please be sure to have at least a feature type and name.'
        });
      }
      else {
        if (!vmParent.spot.properties.other_features) vmParent.spot.properties.other_features = [];
        var dup = _.find(vmParent.spot.properties.other_features, function (feature) {
          return feature.name === vm.otherFeature.name;
        });
        if (_.indexOf(vmParent.spot.properties.other_features, dup) === featureToEdit) dup = undefined;
        if (!dup) {
          if (vm.otherFeature.type === 'other') {
            if (vm.newFeatureType) {
              if (_.indexOf(vm.otherFeatureTypes, vm.newFeatureType) === -1) {
                vm.otherFeatureTypes.splice(-1, 0, vm.newFeatureType);
                ProjectFactory.saveOtherFeatures(vm.otherFeatureTypes);
                vm.otherFeature.type = vm.newFeatureType;
                vm.newFeatureType = '';
                saveFeature();
              }
              else {
                $ionicPopup.alert({
                  'title': 'Alert!',
                  'template': 'The type <b>' + vm.newFeatureType + '</b> is already being used. Choose a different type name.'
                });
              }
            }
            else {
              $ionicPopup.alert({
                'title': 'Alert!',
                'template': 'You must specify a feature type.'
              });
            }
          }
          else saveFeature();
        }
        else {
          $ionicPopup.alert({
            'title': 'Alert!',
            'template': 'The feature name <b>' + vm.otherFeature.name + '</b> is already being used. Choose a different feature name.'
          });
        }
      }
    }
  }
}());
