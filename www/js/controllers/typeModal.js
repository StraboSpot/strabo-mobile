angular.module('app')
  .controller("ModalCtrl", function($scope, NewSpot) {

    $scope.spotTypes = [
      { "label": "Station", "value": "point" },
      { "label": "Contact or Trace", "value": "line" },
      { "label": "Rock Description Only", "value": "polygon" },
      { "label": "Spot Group", "value": "group" }
    ];

    // Set spot type for newspot
    $scope.setSpotType = function(type){
      switch(type) {
        case "point":
          var geojsonTemplate = {
            "geometry": {
              "type": "Point"
            }
          };
          break;
        case "line":
          var geojsonTemplate = {
            "geometry": {
              "type": "LineString"
            }
          };
          break;
        case "polygon":
          var geojsonTemplate = {
            "geometry": {
              "type": "Polygon"
            }
          };
          break;
        case "group":
          var geojsonTemplate = {
            "geometry": {
              "type": "Polygon"
            }
          };
          break;
      }
      NewSpot.setNewSpot(geojsonTemplate);
      $scope.spot = NewSpot.getNewSpot();
      $scope.spot.properties.type = type;
      NewSpot.setNewSpot($scope.spot);
    };
  });