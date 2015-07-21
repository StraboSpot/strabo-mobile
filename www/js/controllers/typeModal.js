angular.module('app')
  .controller("ModalCtrl", function ($scope, NewSpot) {

    $scope.spotTypes = [
      {"label": "Station", "value": "point", "tab": "details"},
      {"label": "Contact or Trace", "value": "line", "tab": "details"},
      {"label": "Rock Description Only", "value": "polygon", "tab": "rockdescription"},
      {"label": "Spot Group", "value": "group", "tab": "details"}
    ];

    // Set spot type for new spot
    $scope.setSpotType = function (type) {
      var jsonTemplate = {
        "properties": {
          "type": type
        }
      };
      NewSpot.setNewSpot(jsonTemplate);
    };
  });