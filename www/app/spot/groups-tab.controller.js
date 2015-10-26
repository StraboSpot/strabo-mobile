'use strict';

angular
  .module('app')
  .controller('SpotTabGroupsController', function ($scope,
                                                   $log,
                                                   CurrentSpot) {
    $log.log('inside spot tab groups Controller');

    $scope.linkGroup = function () {
      CurrentSpot.setCurrentSpot($scope.spot);
      $scope.openModal('groupModal');
    };
  });
