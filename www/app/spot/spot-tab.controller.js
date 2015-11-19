(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabController', SpotTabController);

  SpotTabController.$inject = ['$scope', '$stateParams', '$log'];

  function SpotTabController($scope, $stateParams, $log) {
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotTabController');
    }
  }
}());
