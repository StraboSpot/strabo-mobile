angular.module('app')

  .controller('SpotsCtrl', function($scope, $location, Spots) {
    // Load or initialize Spots
    $scope.spots = Spots.all();

    // Create a new Spot
    $scope.newSpot = function() {
      $location.path("/app/spots/newspot");
      //$location.path("/app/spots/"+$scope.spots.length);
    };
  });