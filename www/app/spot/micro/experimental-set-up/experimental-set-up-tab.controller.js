(function () {
  'use strict';

  angular
    .module('app')
    .controller('ExperimentalSetUpTabController', ExperimentalSetUpTabController);

  ExperimentalSetUpTabController.$inject = ['$log', '$scope', '$state', 'FormFactory'];

  function ExperimentalSetUpTabController($log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'experimental-set-up';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In ExperimentalSetUpTabController');

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
        FormFactory.setForm('micro', 'experimental_set_up');
        if (vmParent.spot.properties.micro && vmParent.spot.properties.micro.experimental_set_up) {
          $log.log('Experimental Set Up:', vmParent.spot.properties.micro.experimental_set_up);
          vmParent.data = vmParent.spot.properties.micro.experimental_set_up;
          if (vmParent.data.date_of_experiment) {
            vmParent.data.date_of_experiment = new Date(vmParent.data.date_of_experiment);
          }
        }
        else vmParent.data = {};
      }
    }

    /**
     * Public Functions
     */

  }
}());
