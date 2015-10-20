angular
  .module('app')
  .controller('SpotTabGroupmembersCtrl', function ($scope,
                                                   $log,
                                                   CurrentSpot) {
    $log.log('inside spot tab group members ctrl');

    $scope.addGroupMember = function () {
      CurrentSpot.setCurrentSpot($scope.spot);
      $scope.openModal('groupMembersModal');
    };
  });
