angular.module('app')

// Set the lat and long when adding a spot by clicking on the map
.service('NewSpot', function() {
  var newLocation = {};

  var setGeoJson = function(geojson) {
    //newLocation.geojson = geojson;
    newLocation = geojson;
  }
  
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
    setGeoJson: setGeoJson,
    setNewLocation: setNewLocation,
    getNewLocation: getNewLocation,
    clearNewLocation: clearNewLocation
  };
})
  