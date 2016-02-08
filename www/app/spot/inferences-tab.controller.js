(function () {
  'use strict';

  angular
    .module('app')
    .controller('InferencesTabController', InferencesTabController);

  InferencesTabController.$inject = ['$log', '$scope', '$state'];

  function InferencesTabController($log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In InferencesTabController');

      vm.relatedRosettaChoices = _.reject(vmParent.spots, function (spot) {
        return spot.properties.id === vmParent.spot.properties.id;
      });
    }

    /**
     * Public Functions
     */
  }
}());
