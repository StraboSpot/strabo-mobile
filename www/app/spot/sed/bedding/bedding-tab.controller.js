(function () {
  'use strict';

  angular
    .module('app')
    .controller('SedBeddingTabController', SedBeddingTabController);

  SedBeddingTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', '$timeout',
    'FormFactory', 'StratSectionFactory'];

  function SedBeddingTabController($ionicModal, $ionicPopup, $log, $scope, $state, $timeout, FormFactory,
                                   StratSectionFactory) {
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

      // Apply manual skip logic to bedding fields
      $timeout(checkInterbedProportionChangeField, 1000);
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      if (vmParent.spot && !_.isEmpty(vmParent.spot)) {
        FormFactory.setForm('sed', 'bedding');

        vmParent.data = {};
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.bedding) {
          vmParent.dataOutsideForm = angular.copy(vmParent.spot.properties.sed.bedding);
          if (vmParent.dataOutsideForm.beds) delete vmParent.dataOutsideForm.beds;
          if (vmParent.spot.properties.sed.bedding.beds && vmParent.spot.properties.sed.bedding.beds[vmParent.lithologyNum]) {
            vmParent.data = angular.copy(vmParent.spot.properties.sed.bedding.beds[vmParent.lithologyNum]);
          }
        }
        setDefaultUnits();

        $log.log('Sed Bedding Shared :', vmParent.dataOutsideForm);
        $log.log('Sed Bedding Lithology ' + (vmParent.lithologyNum + 1) + ':', vmParent.data);
      }
      createWatches();
    }

    function createWatches() {
      // Watch for interbed_proportion_change changes and apply manual skip logic
      $scope.$watch('vm.dataOutsideForm.interbed_proportion_change', function (newValue, oldValue) {
        if (newValue && newValue !== oldValue) checkInterbedProportionChangeField();
      });
    }

    // The fields avg_thickness, min_thickness and max_thickness need to have skip logic tied to
    // interbed_proportion_change but since these fields aren't in the same form apply the logic manually
    function checkInterbedProportionChangeField() {
      var avgThicknessEl = document.getElementById('avg_thickness');
      var minThicknessEl = document.getElementById('min_thickness');
      var maxThicknessEl = document.getElementById('max_thickness');
      var thicknessUnitsEl = document.getElementById('interbed_thickness_units');
      var interbedGroupEl = document.getElementById('group_hh2iq16');
      if (avgThicknessEl) {
        if (vmParent.dataOutsideForm.interbed_proportion_change === 'increase'
          || vmParent.dataOutsideForm.interbed_proportion_change === 'decrease') {
          avgThicknessEl.style.display = 'none';
          minThicknessEl.style.display = '';
          maxThicknessEl.style.display = '';
          thicknessUnitsEl.style.display = '';
          interbedGroupEl.style.display = '';

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
          setDefaultUnits();
        }
        else if (vmParent.dataOutsideForm.interbed_proportion_change === 'no_change') {
          avgThicknessEl.style.display = '';
          minThicknessEl.style.display = 'none';
          maxThicknessEl.style.display = 'none';
          thicknessUnitsEl.style.display = '';
          interbedGroupEl.style.display = '';

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
          setDefaultUnits();
        }
        else {
          avgThicknessEl.style.display = 'none';
          minThicknessEl.style.display = 'none';
          maxThicknessEl.style.display = 'none';
          thicknessUnitsEl.style.display = 'none';
          interbedGroupEl.style.display = 'none';
        }
      }
    }

    /**
     * Public Functions
     */

    // Set the units to match that of the section
    function setDefaultUnits() {
      if (!vmParent.data.interbed_thickness_units || !vmParent.dataOutsideForm.package_thickness_units) {
        var units = StratSectionFactory.getDefaultUnits(vmParent.spot);
        if (units) {
          if (!vmParent.data.interbed_thickness_units) vmParent.data.interbed_thickness_units = units;
          if (!vmParent.dataOutsideForm.package_thickness_units) vmParent.dataOutsideForm.package_thickness_units = units;
        }
      }
    }

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
