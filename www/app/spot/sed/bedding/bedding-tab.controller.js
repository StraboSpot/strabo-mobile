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
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.bedding) {
          vmParent.dataOutsideForm = angular.copy(vmParent.spot.properties.sed.bedding);
          if (vmParent.spot.properties.sed.bedding.beds && vmParent.spot.properties.sed.bedding.beds[vmParent.lithologyNum]) {
            vmParent.data = angular.copy(vmParent.spot.properties.sed.bedding.beds[vmParent.lithologyNum]);
          }
        }
        $log.log('Sed Bedding Shared :', vmParent.dataOutsideForm);
        $log.log('Sed Bedding Lithology ' + (vmParent.lithologyNum + 1) + ':', vmParent.data);
      }
      createWatches();
    }

    function createWatches() {
      // Watch for interbed_proportion_change changes
      $scope.$watch('vm.dataOutsideForm.interbed_proportion_change', function (newValue, oldValue) {
        if (newValue && newValue !== oldValue) checkInterbedProportionChangeField();
      });
    }

    function checkInterbedProportionChangeField() {
      var avgThicknessEl = document.getElementById('avg_thickness');
      var minThicknessEl = document.getElementById('min_thickness');
      var maxThicknessEl = document.getElementById('max_thickness');
      if (avgThicknessEl) {
        if (vmParent.dataOutsideForm.interbed_proportion_change === 'increase'
          || vmParent.dataOutsideForm.interbed_proportion_change === 'decrease') {
          avgThicknessEl.style.display = 'none';
          minThicknessEl.style.display = '';
          maxThicknessEl.style.display = '';
          // Delete avg thickness fields
          if (vmParent.data.avg_thickness) delete vmParent.data.avg_thickness;
          if (vmParent.spot.properties && vmParent.spot.properties.sed) {
            var sed = vmParent.spot.properties.sed;
            _.times(2, function (n) {
              if (sed.bedding && sed.bedding.beds && sed.bedding.beds[n]) {
                if (sed.bedding.beds[n].avg_thickness) delete sed.bedding.beds[n].avg_thickness;
              }
            });
          }
        }
        else if (vmParent.dataOutsideForm.interbed_proportion_change === 'no_change') {
          avgThicknessEl.style.display = '';
          minThicknessEl.style.display = 'none';
          maxThicknessEl.style.display = 'none';
          // Delete any min & max thickness fields
          if (vmParent.data.max_thickness) delete vmParent.data.max_thickness;
          if (vmParent.data.min_thickness) delete vmParent.data.min_thickness;
          if (vmParent.spot.properties && vmParent.spot.properties.sed) {
            var sed = vmParent.spot.properties.sed;
            _.times(2, function (n) {
              if (sed.bedding && sed.bedding.beds && sed.bedding.beds[n]) {
                if (sed.bedding.beds[n].min_thickness) delete sed.bedding.beds[n].min_thickness;
                if (sed.bedding.beds[n].max_thickness) delete sed.bedding.beds[n].max_thickness;
              }
            });
          }
        }
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
