angular.module('app')

.controller('SpotsCtrl', function(
  $scope,
  $location,
  SpotsFactory,
  NewSpot) {

  // Load or initialize Spots
  $scope.spots;

  SpotsFactory.all().then(function(spots) {
    $scope.spots = spots;
  });

  // a geojson template we pass in when creating a new spot from the spot menu
  var geojsonTemplate = {
    "geometry": {
      "type": "Point",
      "coordinates": [0, 0]
    }
  };

  // clears all spots
  $scope.clearAllSpots = function() {
    if (window.confirm("Do you want to delete ALL the spots?")) {
      SpotsFactory.clear(function() {
        alert("all spots have been cleared");
        // update the spots list
        SpotsFactory.all().then(function(spots) {
          $scope.spots = spots;
        });
      });
    }
  }

  // Create a new Spot
  $scope.newSpot = function() {
    // we create a new spot and pass in the template because a new spot created in this manner is always a single point
    NewSpot.setNewSpot(geojsonTemplate);
    $location.path("/app/spots/newspot");
  };
});