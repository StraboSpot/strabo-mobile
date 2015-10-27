(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupmembersController', SpotTabGroupmembersController);

  SpotTabGroupmembersController.$inject = ['$scope', '$log', 'CurrentSpot'];

  function SpotTabGroupmembersController($scope, $log, CurrentSpot) {
    $log.log('inside spot tab group members Controller');

    $scope.addGroupMember = function () {
      CurrentSpot.setCurrentSpot($scope.spot);
      $scope.openModal('groupMembersModal');
    };
  }
}());
