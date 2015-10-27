(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupsController', SpotTabGroupsController);

  SpotTabGroupsController.$inject = ['$scope', '$log', 'CurrentSpot'];

  function SpotTabGroupsController($scope, $log, CurrentSpot) {
    $log.log('inside spot tab groups Controller');

    $scope.linkGroup = function () {
      CurrentSpot.setCurrentSpot($scope.spot);
      $scope.openModal('groupModal');
    };
  }
}());
