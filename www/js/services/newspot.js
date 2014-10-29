angular.module('app')

// Set the lat and long when adding a spot by clicking on the map
  .service('NewSpot', function() {
    var newLocation = {};
    
    var setNewLocation = function(lat, lng) {
      newLocation.newSpotLat = lat;
      newLocation.newSpotLng = lng;
    }
    
    var getNewLocation = function() {
      return newLocation;
    }
    
    var clearNewLocation = function() {
      newLocation = {};
    }
    
    return {
      setNewLocation: setNewLocation,
      getNewLocation: getNewLocation,
      clearNewLocation: clearNewLocation
    };
  })
  