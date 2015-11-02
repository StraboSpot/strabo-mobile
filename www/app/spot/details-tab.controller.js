(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabDetailController', SpotTabDetailController);

  SpotTabDetailController.$inject = ['$scope', '$stateParams', '$log'];

  function SpotTabDetailController($scope, $stateParams, $log) {
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab detail Controller');
  }
}());
