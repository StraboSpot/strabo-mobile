angular.module('app')

  .controller('SpotsCtrl', function($scope, $location, Spots, NewSpot) {
    // Load or initialize Spots
    $scope.spots = Spots.all();

    // Create a new Spot
    $scope.newSpot = function() {
      NewSpot.setNewSpot();
      $location.path("/app/spots/newspot");
    };
  });