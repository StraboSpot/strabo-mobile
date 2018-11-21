(function () {
  'use strict';

  angular
    .module('app')
    .controller('ExperimentalResultsTabController', ExperimentalResultsTabController);

  ExperimentalResultsTabController.$inject = ['$log', '$scope', '$state', 'FormFactory'];

  function ExperimentalResultsTabController($log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'experimental-results';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In ExperimentalResultsTabController');

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
        FormFactory.setForm('micro', 'experimental_results');
        if (vmParent.spot.properties.micro && vmParent.spot.properties.micro.experimental_results) {
          $log.log('Experimental Results:', vmParent.spot.properties.micro.experimental_results);
          vmParent.data = vmParent.spot.properties.micro.experimental_results;
        }
        else vmParent.data = {};
      }
    }

    /**
     * Public Functions
     */

  }
}());
