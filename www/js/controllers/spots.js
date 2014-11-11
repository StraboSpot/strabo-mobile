angular.module('app')

.controller('SpotsCtrl', function($scope, $location, Spots, NewSpot) {
  // Load or initialize Spots
  $scope.spots = Spots.all();

  // a geojson template we pass in when creating a new spot from the spot menu
  var geojsonTemplate = {
    "geometry": {
      "type": "Point",
      "coordinates": [0, 0]
    }
  };

  // Create a new Spot
  $scope.newSpot = function() {
    // we create a new spot and pass in the template because a new spot created in this manner is always a single point
    NewSpot.setNewSpot(geojsonTemplate);
    $location.path("/app/spots/newspot");
  };
});