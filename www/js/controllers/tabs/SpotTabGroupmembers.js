'use strict';

angular
  .module('app')
  .controller('SpotTabGroupmembersController', function ($scope,
                                                         $log,
                                                         CurrentSpot) {
    $log.log('inside spot tab group members Controller');

    $scope.addGroupMember = function () {
      CurrentSpot.setCurrentSpot($scope.spot);
      $scope.openModal('groupMembersModal');
    };
  });
