angular
  .module('app')
  .controller('SpotTabLinksController', function ($scope,
                                            $log,
                                            CurrentSpot) {
    $log.log('inside spot tab links Controller');

    $scope.linkSpot = function () {
      CurrentSpot.setCurrentSpot($scope.spot);
      $scope.openModal('linkModal');
    };

    $scope.setLinkRelationship = function (item, relationship) {
      var related_spot = _.find($scope.links_selected, function (rel_spot) {
        return rel_spot.id === item.id;
      });
      related_spot['relationship'] = relationship.type;
    };
  });
