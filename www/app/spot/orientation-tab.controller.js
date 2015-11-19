(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationTabController', OrientationTabController);

  OrientationTabController.$inject = ['$scope', '$stateParams', '$log'];

  function OrientationTabController($scope, $stateParams, $log) {
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In OrientationTabController');
    }
  }
}());
