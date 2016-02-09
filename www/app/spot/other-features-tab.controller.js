(function () {
  'use strict';

  angular
    .module('app')
    .controller('OtherFeaturesTabController', OtherFeaturesTabController);

  OtherFeaturesTabController.$inject = ['$ionicPopup', '$log', '$scope', '$state'];

  function OtherFeaturesTabController($ionicPopup, $log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.addFeature = addFeature;
    vm.otherFeature = {
      'type': undefined,
      'name': undefined,
      'description': undefined
    };
    vm.otherFeatureTypes = ['geomorhic', 'hydrologic', 'paleontological',
      'igneous', 'metamorphic', 'sedimentological', 'other'];
    vm.deleteFeature = deleteFeature;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In OtherFeaturesTabController');
    }

    /**
     * Public Functions
     */

    function addFeature() {
      if (!vmParent.spot.properties.other_features) {
        vmParent.spot.properties.other_features = [];
      }
      // Check if the field name already exists in properties.other_features
      var found = _.find(vmParent.spot.properties.other_features, function (feature) {
        return feature.name === vm.otherFeature.name;
      });

      if (found) {
        $ionicPopup.alert({
          'title': 'Alert!',
          'template': 'The feature name <b>' + vm.otherFeature.name + '</b> is already being used. Choose a different feature name.'
        });
      }
      else {
        vmParent.spot.properties.other_features.push({
          'name': vm.otherFeature.name,
          'type': vm.otherFeature.type,
          'description': vm.otherFeature.description
        });
        vm.otherFeature = {
          'type': undefined,
          'name': undefined,
          'description': undefined
        };
      }
    }

    function deleteFeature(featureName) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Feature',
        'template': 'Are you sure you want to delete this feature?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.other_features = _.reject(vmParent.spot.properties.other_features,
            function (feature) {
              return feature.name === featureName;
            });
          if (vmParent.spot.properties.other_features.length === 0) {
            delete vmParent.spot.properties.other_features;
          }
        }
      });
    }
  }
}());
