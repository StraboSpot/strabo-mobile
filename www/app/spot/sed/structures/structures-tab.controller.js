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

    vm.structuresForm = 'structures_physical';

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

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      if (vmParent.spot && !_.isEmpty(vmParent.spot)) {
        FormFactory.setForm('sed', 'structures_physical');
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.structures &&
          vmParent.spot.properties.sed.structures[vmParent.lithologyNum]) {
          vmParent.data = angular.copy(vmParent.spot.properties.sed.structures[vmParent.lithologyNum]);
        }
        else vmParent.data = {};
        $log.log('Sed Structures ' + (vmParent.lithologyNum + 1) + ':', vmParent.data);
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
