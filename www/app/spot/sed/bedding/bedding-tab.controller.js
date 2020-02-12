(function () {
  'use strict';

  angular
    .module('app')
    .controller('SedBeddingTabController', SedBeddingTabController);

  SedBeddingTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory'];

  function SedBeddingTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'sed-bedding';

    vm.shouldShowInterbedBeddingFields = shouldShowInterbedBeddingFields;
    vm.shouldShowPackageBeddingFields = shouldShowPackageBeddingFields;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SedBeddingTabController');

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
      vmParent.loadTab(state);     // Need to load current state into parent
      if (vmParent.spot && !_.isEmpty(vmParent.spot)) {
        FormFactory.setForm('sed', 'bedding');

        vmParent.data = {};
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.bedding){
          vmParent.dataOutsideForm = angular.copy(vmParent.spot.properties.sed.bedding);
          if (vmParent.dataOutsideForm.beds) delete vmParent.dataOutsideForm.beds;
          if (vmParent.spot.properties.sed.bedding.beds && vmParent.spot.properties.sed.bedding.beds[vmParent.lithologyNum]) {
            vmParent.data = angular.copy(vmParent.spot.properties.sed.bedding.beds[vmParent.lithologyNum]);
          }
        }
        $log.log('Sed Bedding Shared :', vmParent.dataOutsideForm);
        $log.log('Sed Bedding Lithology ' + (vmParent.lithologyNum + 1) + ':', vmParent.data);
      }
    }

    /**
     * Public Functions
     */

    function shouldShowInterbedBeddingFields() {
      return vmParent.spot && vmParent.spot.properties && vmParent.spot.properties.sed && vmParent.spot.properties.sed.character &&
        (vmParent.spot.properties.sed.character === 'interbedded' || vmParent.spot.properties.sed.character === 'bed_mixed_lit');
    }

    function shouldShowPackageBeddingFields() {
      return vmParent.spot && vmParent.spot.properties && vmParent.spot.properties.sed && vmParent.spot.properties.sed.character &&
        vmParent.spot.properties.sed.character === 'package_succe';
    }
  }
}());
