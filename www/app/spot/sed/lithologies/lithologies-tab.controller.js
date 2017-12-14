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

    vm.showStratInterval = false;

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
      FormFactory.setForm('sed', 'lithologies');
      if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.lithologies) {
        $log.log('Sed Lithologies:', vmParent.spot.properties.sed.lithologies);
        vmParent.data = vmParent.spot.properties.sed.lithologies;
      }
      else vmParent.data = {};
    }

    /**
     * Public Functions
     */

  }
}());
