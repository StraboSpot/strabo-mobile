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

    vm.lithologyForm = 'lithologies_lithology';

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
        FormFactory.setForm('sed', 'lithologies_lithology');
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.lithologies
          && vmParent.spot.properties.sed.lithologies[vmParent.lithologyNum]) {
          vmParent.data = angular.copy(vmParent.spot.properties.sed.lithologies[vmParent.lithologyNum]);
        }
        else vmParent.data = {};
        $log.log('Sed Lithology ' + (vmParent.lithologyNum + 1) + ':', vmParent.data);

        createWatches();
      }
    }

    function createWatches() {
      // Watch for principal siliciclastic type changes
      $scope.$watch('vm.data.siliciclastic_type', function (newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          if (vmParent.data.siliciclastic_type === 'claystone'
            || vmParent.data.siliciclastic_type === 'mudstone') {
            vmParent.data.mud_silt_grain_size = 'clay';
          }
          else if (vmParent.data.siliciclastic_type === 'siltstone') {
            vmParent.data.mud_silt_grain_size = 'silt';
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
