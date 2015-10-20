angular
  .module('app')
  .controller('ModalCtrl', function ($scope, NewSpot) {
    $scope.spotTypes = [
      {'label': 'Station (spatial)', 'value': 'group', 'tab': 'details'},
      {'label': 'Group (conceptual)', 'value': 'group', 'tab': 'details'},
      {'label': 'Measurement or Observation', 'value': 'point', 'tab': 'details'},
      {'label': 'Contact or Trace', 'value': 'line', 'tab': 'details'},
      {'label': 'Rock Description', 'value': 'polygon', 'tab': 'rockdescription'}
    ];

    // Set spot type for new spot
    $scope.setSpotType = function (type) {
      var jsonTemplate = {
        'properties': {
          'type': type
        }
      };
      NewSpot.setNewSpot(jsonTemplate);
    };
  });
