(function () {
  'use strict';

  angular
    .module('app')
    .controller('SedStructuresTabController', SedStructuresTabController);

  SedStructuresTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory'];

  function SedStructuresTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'sed-structures';

    vm.structuresForm = 'physical_structures';

    vm.switchForm = switchForm;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SedStructuresTabController');

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

    function getStructuresFromLithologies() {
      if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.lithologies) {
        if (vmParent.spot.properties.sed.lithologies.mud_silt_prin_struct) {
          if (!vmParent.spot.properties.sed.structures) vmParent.spot.properties.sed.structures = {};
          vmParent.spot.properties.sed.structures.mudstone_structures = true;
          vmParent.spot.properties.sed.structures.mud_silt_prin_struct = vmParent.spot.properties.sed.lithologies.mud_silt_prin_struct;
        }
        if (vmParent.spot.properties.sed.lithologies.sandstone_prin_struct) {
          if (!vmParent.spot.properties.sed.structures) vmParent.spot.properties.sed.structures = {};
          vmParent.spot.properties.sed.structures.sandstone_structures = true;
          vmParent.spot.properties.sed.structures.sandstone_prin_struct = vmParent.spot.properties.sed.lithologies.sandstone_prin_struct;
        }
        if (vmParent.spot.properties.sed.lithologies.conglomerate_prin_struct) {
          if (!vmParent.spot.properties.sed.structures) vmParent.spot.properties.sed.structures = {};
          vmParent.spot.properties.sed.structures.conglomerate_structures = true;
          vmParent.spot.properties.sed.structures.conglomerate_prin_struct = vmParent.spot.properties.sed.lithologies.conglomerate_prin_struct;
        }
        if (vmParent.spot.properties.sed.lithologies.breccia_prin_struct) {
          if (!vmParent.spot.properties.sed.structures) vmParent.spot.properties.sed.structures = {};
          vmParent.spot.properties.sed.structures.breccia_structures = true;
          vmParent.spot.properties.sed.structures.breccia_prin_struct = vmParent.spot.properties.sed.lithologies.breccia_prin_struct;
        }
        if (vmParent.spot.properties.sed.lithologies.limestone_dolomite_prin_struct) {
          if (!vmParent.spot.properties.sed.structures) vmParent.spot.properties.sed.structures = {};
          vmParent.spot.properties.sed.structures.limestone_structures = true;
          vmParent.spot.properties.sed.structures.limestone_dolomite_prin_struct = vmParent.spot.properties.sed.lithologies.limestone_dolomite_prin_struct;
        }
      }
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      if (vmParent.spot && !_.isEmpty(vmParent.spot)) {
        FormFactory.setForm('sed', 'physical_structures');
        getStructuresFromLithologies();
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.structures) {
          $log.log('Sed Structures:', vmParent.spot.properties.sed.structures);
          vmParent.data = vmParent.spot.properties.sed.structures;
        }
        else vmParent.data = {};
      }
    }

    /**
     * Public Functions
     */

    function switchForm(form) {
      vm.structuresForm = form;
      FormFactory.setForm('sed', form);
    }

  }
}());
