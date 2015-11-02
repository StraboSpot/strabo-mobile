(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabRockdescriptionController', SpotTabRockdescriptionController);

  SpotTabRockdescriptionController.$inject = ['$scope', '$stateParams', '$log'];

  function SpotTabRockdescriptionController($scope, $stateParams, $log) {
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab rock description Controller');
  }
}());
