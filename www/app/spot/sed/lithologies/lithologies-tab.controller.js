(function () {
  'use strict';

  angular
    .module('app')
    .controller('SedLithologiesTabController', SedLithologiesTabController);

  SedLithologiesTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory'];

  function SedLithologiesTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'sed-lithologies';

    vm.lithologyForm = 'lithologies_basics';
    vm.showStratInterval = false;

    vm.switchLithologyForm = switchLithologyForm;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SedLithologiesTabController');

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
        FormFactory.setForm('sed', 'lithologies_basics');
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.lithologies) {
          $log.log('Sed Lithologies:', vmParent.spot.properties.sed.lithologies);
          vmParent.data = vmParent.spot.properties.sed.lithologies;
        }
        else vmParent.data = {};

        createWatches();
      }
    }

    function createWatches() {
      // Watch for principal siliciclastic type changes
      $scope.$watch('vm.data.principal_siliciclastic_type', function (newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          if (vmParent.data.principal_siliciclastic_type === 'claystone'
            || vmParent.data.principal_siliciclastic_type === 'mudstone') {
            vmParent.data.mud_silt_principal_grain_size = 'clay';
          }
          else if (vmParent.data.principal_siliciclastic_type === 'siltstone') {
            vmParent.data.mud_silt_principal_grain_size = 'silt';
          }
        }
      });

      // Watch for interbed siliciclastic type changes
      $scope.$watch('vm.data.interbed_siliciclastic_type', function (newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          if (vmParent.data.interbed_siliciclastic_type === 'claystone'
            || vmParent.data.interbed_siliciclastic_type === 'mudstone') {
            vmParent.data.mud_silt_interbed_grain_size = 'clay';
          }
          else if (vmParent.data.interbed_siliciclastic_type === 'siltstone') {
            vmParent.data.mud_silt_interbed_grain_size = 'silt';
          }
        }
      });
    }

    /**
     * Public Functions
     */

    function switchLithologyForm(form) {
      vm.lithologyForm = form;
      FormFactory.setForm('sed', form);
    }
  }
}());
