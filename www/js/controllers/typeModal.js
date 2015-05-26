angular.module('app')

.controller("ModalCtrl", function($scope, NewSpot) {

  $scope.pointTypes = [
    "Measurements and Observations",
   /* "Contact",
    "Fault",
    "Fold",
    "Notes",
    "Orientation",
    "Sample Locality",
    "Shear Zone",*/
    "Spot Grouping"
  ];

  $scope.lineTypes = [
    "Contacts and Traces",
   /* "Contact",
    "Fault",
    "Fold",
    "Notes",
    "Shear Zone",*/
    "Spot Grouping"
  ];

  $scope.polyTypes = [
  /*  "Notes",*/
  /*  "Rock Description",*/
    "Polygon Form",
    "Spot Grouping"
  ];

  $scope.allTypes = _.sortBy(_.union($scope.pointTypes, $scope.lineTypes, $scope.polyTypes), function (type) { return type; });

  // a geojson template we pass in when creating a new spot from the spot menu
  var geojsonTemplate = {
    "geometry": {
      "type": "Point",
      "coordinates": [0, 0]
    }
  };

  // Set spot type for newspot
  $scope.setSpotType = function(type){
    // If spot was not created from map assume it's a point for now
    if (!NewSpot.getNewSpot())
      NewSpot.setNewSpot(geojsonTemplate);
    $scope.spot = NewSpot.getNewSpot();
    $scope.spot.properties.type = type;
    NewSpot.setNewSpot($scope.spot);
  };
});