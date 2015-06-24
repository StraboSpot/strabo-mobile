angular.module('app')
  .controller('SpotTabGroupsCtrl', function ($scope,
                                             CurrentSpot) {

    console.log('inside spot tab groups ctrl');

    $scope.linkGroup = function() {
      CurrentSpot.setCurrentSpot($scope.spot);
      $scope.openModal("groupModal");
    };

  });
