angular.module('app')

.controller("ModalCtrl", function($scope, NewSpot) {

  $scope.pointTypes = [
    { type: "Contact Outcrop" },
    { type: "Fault Outcrop" },
    { type: "Notes" },
    { type: "Orientation" },
    { type: "Rock Description" },
    { type: "Sample" },
    { type: "Spot Grouping" }
  ];

  $scope.lineTypes = [
    { type: "Contact Trace" },
    { type: "Fault Trace" },
    { type: "Hinge Surface Trace" },
    { type: "Notes" },
    { type: "Spot Grouping" }
  ];

  $scope.polyTypes = [
    { type: "Notes" },
    { type: "Rock Description" },
    { type: "Spot Grouping" }
  ];

  $scope.allTypes = [
    { type: "Contact Outcrop" },
    { type: "Contact Trace" },
    { type: "Fault Outcrop" },
    { type: "Fault Trace" },
    { type: "Hinge Surface Trace" },
    { type: "Notes" },
    { type: "Orientation" },
    { type: "Rock Description" },
    { type: "Sample" },
    { type: "Spot Grouping" }
  ];

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
    $scope.spot.properties.spottype = type;
    NewSpot.setNewSpot($scope.spot);
  };
});