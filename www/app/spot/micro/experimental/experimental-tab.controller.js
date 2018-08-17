(function () {
  'use strict';

  angular
    .module('app')
    .controller('ExperimentalTabController', ExperimentalTabController);

  ExperimentalTabController.$inject = ['$log', '$scope', '$state', 'FormFactory'];

  function ExperimentalTabController($log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'experimental';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In ExperimentalTabController');

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
      // FormFactory.setForm('micro', 'experimental');
      if (vmParent.spot.properties.micro && vmParent.spot.properties.micro.experimental) {
        $log.log('Experimental:', vmParent.spot.properties.micro.experimental);
        vmParent.data = vmParent.spot.properties.micro.experimental;
      }
      else vmParent.data = {};
    }

    /**
     * Public Functions
     */
  }
}());
