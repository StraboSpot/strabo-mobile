angular.module('app')

.controller("ModalCtrl", function($scope, NewSpot) {

  $scope.pointTypes = [
    { type: "Contact Outcrop", template: "commonfields" },
    { type: "Fault Outcrop", template: "commonfields" },
    { type: "Notes", template: "commonfields" },
    { type: "Orientation", template: "newspot" },
    { type: "Rock Description", template: "commonfields" },
    { type: "Sample", template: "commonfields" }
  ];

  $scope.lineTypes = [
    { type: "Contact Trace", template: "commonfields" },
    { type: "Fault Trace", template: "commonfields" },
    { type: "Hinge Surface Trace", template: "commonfields" },
    { type: "Notes", template: "commonfields" }
  ];

  $scope.polyTypes = [
    { type: "Notes", template: "commonfields" },
    { type: "Rock Description", template: "commonfields" }
  ];

  $scope.allTypes = [
    { type: "Contact Outcrop", template: "commonfields" },
    { type: "Contact Trace", template: "commonfields" },
    { type: "Fault Outcrop", template: "commonfields" },
    { type: "Fault Trace", template: "commonfields" },
    { type: "Hinge Surface Trace", template: "commonfields" },
    { type: "Notes", template: "commonfields" },
    { type: "Orientation", template: "newspot" },
    { type: "Rock Description", template: "commonfields" }
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