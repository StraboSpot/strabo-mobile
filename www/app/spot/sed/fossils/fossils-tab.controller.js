(function () {
  'use strict';

  angular
    .module('app')
    .controller('SedFossilsTabController', SedFossilsTabController);

  SedFossilsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory'];

  function SedFossilsTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'sed-fossils';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SedFossilsTabController');

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
        FormFactory.setForm('sed', 'fossils');
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.fossils &&
          vmParent.spot.properties.sed.fossils[vmParent.lithologyNum]) {
          vmParent.data = angular.copy(vmParent.spot.properties.sed.fossils[vmParent.lithologyNum]);
        }
        else vmParent.data = {};
        $log.log('Sed fossils ' + (vmParent.lithologyNum + 1) + ':', vmParent.data);
      }
    }
  }
}());
