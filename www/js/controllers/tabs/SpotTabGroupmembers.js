angular.module('app')
  .controller('SpotTabGroupmembersCtrl', function ($scope,
                                                   CurrentSpot) {

    console.log('inside spot tab group members ctrl');

    $scope.addGroupMember = function () {
      CurrentSpot.setCurrentSpot($scope.spot);
      $scope.openModal("groupMembersModal");
    };

  });
