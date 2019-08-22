(function () {
  'use strict';

  angular
    .module('app')
    .controller('NotesTabController', NotesTabController);

  NotesTabController.$inject = ['$log', '$scope', '$state'];

  function NotesTabController($log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'notes';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In NotesTabController');

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
      if (vmParent.spot && !_.isEmpty(vmParent.spot)) vmParent.data = vmParent.spot.properties;
    }
  }
}());
