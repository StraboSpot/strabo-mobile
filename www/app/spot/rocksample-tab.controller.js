(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabRocksampleController', SpotTabRocksampleController);

  SpotTabRocksampleController.$inject = ['$scope', '$stateParams', '$log'];

  function SpotTabRocksampleController($scope, $stateParams, $log) {
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab rock sample Controller');
  }
}());
