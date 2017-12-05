(function () {
  'use strict';

  angular
    .module('app')
    .controller('OtherFeaturesTabController', OtherFeaturesTabController);

  OtherFeaturesTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'HelpersFactory',
    'ProjectFactory'];

  function OtherFeaturesTabController($ionicModal, $ionicPopup, $log, $scope, $state, HelpersFactory, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var defaultTypes = ['geomorphic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
      'other'];
    var thisTabName = 'other-features';

    vm.addFeature = addFeature;
    vm.deleteFeature = deleteFeature;
    vm.editFeature = editFeature;
    vm.newFeatureType = '';
    vm.otherFeature = {};
    vm.otherFeatureModal = {};
    vm.otherFeatureTypes = [];
    vm.submitFeature = submitFeature;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In OtherFeaturesTabController');

      // Loading tab from Spots list
      if ($state.current.name === 'app.spotTab.' + thisTabName) loadTab($state);
      // Loading tab in Map side panel
      $scope.$on('load-tab', function (event, args) {
        if (args.tabName === thisTabName) {
          vmParent.saveSpot().finally(function () {
            vmParent.spotChanged = false;
            loadTab({
              'current': {'name': 'app.spotTab.' + thisTabName},
              'params': {'spotId': args.spotId}
            });
          });
        }
      });
    }

    function loadTab(state) {
      vmParent.loadTab(state);  // Need to load current state into parent
      checkProperties();

      vm.otherFeatureTypes = ProjectFactory.getOtherFeatures();
      if (_.isEmpty(vm.otherFeatureTypes)) {
        ProjectFactory.saveProjectItem('other_features', defaultTypes).then(function () {
          vm.otherFeatureTypes = ProjectFactory.getOtherFeatures();
        });
      }

      createModal();
    }

    function checkProperties() {
      _.each(vmParent.spot.properties.other_features, function (otherFeature) {
        if (!otherFeature.label) otherFeature.label = createDefaultLabel(otherFeature);
        if (!otherFeature.id) otherFeature.id = HelpersFactory.getNewId();
      });
    }

    function createDefaultLabel(otherFeatureToLabel) {
      return otherFeatureToLabel.name || 'other feature';
    }


    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/other-features/other-feature-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.otherFeatureModal = modal;
      });
    }

    /**
     * Public Functions
     */

    function addFeature() {
      vm.otherFeature = {};
      vm.otherFeature.id = HelpersFactory.getNewId();
      vm.otherFeatureModal.show();
    }

    function deleteFeature(feature) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Feature',
        'template': 'Are you sure you want to delete this feature?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.other_features = _.reject(vmParent.spot.properties.other_features, function (oFeat) {
            return oFeat.id === feature.id;
          });
          if (vmParent.spot.properties.other_features.length === 0) delete vmParent.spot.properties.other_features;
        }
      });
    }

    function editFeature(feature) {
      vm.otherFeature = angular.fromJson(angular.toJson(feature));
      vm.otherFeatureModal.show();
    }

    function submitFeature() {
      if (_.size(vm.otherFeature) <= 1) {
        // If not more than id field no data has been entered so don't continue, just close modal
        vm.otherFeature = {};
        vm.newFeatureType = '';
        vm.otherFeatureModal.hide();
        return;
      }
      if (!vm.otherFeature.type || !vm.otherFeature.name) {
        $ionicPopup.alert({
          'title': 'Incomplete Data',
          'template': 'Please be sure to have at least a feature type and name.'
        });
      }
      else {
        if (!vm.otherFeature.label) vm.otherFeature.label = vm.otherFeature.name;
        if (!vmParent.spot.properties.other_features) vmParent.spot.properties.other_features = [];
        vmParent.spot.properties.other_features = _.reject(vmParent.spot.properties.other_features, function (oFeat) {
          return oFeat.id === vm.otherFeature.id;
        });

        if (vm.otherFeature.type === 'other') {
          if (vm.newFeatureType) {
            if (_.contains(vm.otherFeatureTypes, vm.newFeatureType)) {
              $ionicPopup.alert({
                'title': 'Alert!',
                'template': 'The type <b>' + vm.newFeatureType + '</b> is already being used. Choose a different type name.'
              });
            }
            else {
              vm.otherFeatureTypes.splice(-1, 0, vm.newFeatureType);
              ProjectFactory.saveProjectItem('other_features', vm.otherFeatureTypes).then(function () {
                vm.otherFeatureTypes = ProjectFactory.getOtherFeatures();
              });
              vm.otherFeature.type = vm.newFeatureType;
              vm.newFeatureType = '';
            }
          }
          else {
            $ionicPopup.alert({
              'title': 'Alert!',
              'template': 'You must specify a feature type.'
            });
          }
        }
        vmParent.spot.properties.other_features.push(vm.otherFeature);
        vm.otherFeature = {};
        vm.newFeatureType = '';
        vm.otherFeatureModal.hide();
      }
    }
  }
}());
