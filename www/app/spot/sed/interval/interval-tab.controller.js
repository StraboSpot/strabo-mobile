(function () {
  'use strict';

  angular
    .module('app')
    .controller('SedIntervalTabController', SedIntervalTabController);

  SedIntervalTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory'];

  function SedIntervalTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'sed-interval';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SedIntervalTabController');

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
        FormFactory.setForm('sed', 'interval');
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.interval) {
          $log.log('Sed Interval:', vmParent.spot.properties.sed.interval);
          vmParent.data = vmParent.spot.properties.sed.interval;
        }
        else vmParent.data = {};
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.character) {
          vmParent.data.interval_type = vmParent.spot.properties.sed.character;
        }
      }
    }

    /**
     * Public Functions
     */

  }
}());
