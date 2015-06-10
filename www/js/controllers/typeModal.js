angular.module('app')

.controller("ModalCtrl", function($scope, NewSpot) {

  $scope.pointTypes = [
    "Measurements and Observations",
    "Spot Grouping"
  ];

  $scope.lineTypes = [
    "Contacts and Traces",
    "Spot Grouping"
  ];

  $scope.polyTypes = [
    "Rock Description",
    "Spot Grouping"
  ];

  $scope.allTypes = _.sortBy(_.union($scope.pointTypes, $scope.lineTypes, $scope.polyTypes), function (type) { return type; });

  // Set spot type for newspot
  $scope.setSpotType = function(type){
    // If spot was not created from map assume it's a point for now
    if (!NewSpot.getNewSpot())
    {
      switch(type) {
        case "Measurements and Observations":
          var geojsonTemplate = {
            "geometry": {
              "type": "Point",
              "coordinates": [0, 0]
            }
          };
          break;
        case "Contacts and Traces":
          var geojsonTemplate = {
            "geometry": {
              "type": "LineString"
            }
          };
          break;
        case "Rock Description":
          var geojsonTemplate = {
            "geometry": {
              "type": "Polygon"
            }
          };
          break;
        case "Spot Grouping":
          var geojsonTemplate = {
            "geometry": {
              "type": "Polygon"
            }
          };
          break;
      }
      NewSpot.setNewSpot(geojsonTemplate);
    }

    $scope.spot = NewSpot.getNewSpot();
    $scope.spot.properties.type = type;
    NewSpot.setNewSpot($scope.spot);
  };
});