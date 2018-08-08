(function () {
  'use strict';

  angular
    .module('app')
    .controller('DataTabController', DataTabController);

  DataTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state'];

  function DataTabController($ionicModal, $ionicPopup, $log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'data';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In DataTabController');

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
      $log.log('Data:', vmParent.spot.properties.data);
    }

    /**
     * Public Functions
     */

  }
}());
