angular.module('app')

// Service for dealing with the creation of new spots and editing of existing spots
.service('NewSpot', function($filter) {
  var newSpot;

  // Initialize a new Spot
  var setNewSpot = function(geojsonObj) {
    if (!newSpot)
      newSpot = {};
      
    if (geojsonObj) {
      if (geojsonObj.geometry)
        newSpot.geometry = geojsonObj.geometry;
      if (geojsonObj.type)
        newSpot.type = geojsonObj.type
      if (geojsonObj.properties)
        newSpot.properties = geojsonObj.properties
      else {
        if (!newSpot.properties) {
          newSpot.properties = {
            date: $filter("date")(Date.now(), 'yyyy-MM-dd'),
            time: $filter("date")(Date.now(), 'HH:mm'),
            strike: 0,
            dip: 0
          };
        }
      }
    }
  }
  
  var getNewSpot = function() {
    return newSpot;
  }
  
  var clearNewSpot = function() {
    newSpot = null;
  }
  
  return {
    setNewSpot: setNewSpot,
    getNewSpot: getNewSpot,
    clearNewSpot: clearNewSpot
  };
})
  