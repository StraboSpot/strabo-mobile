angular.module('app')

// Service for dealing with the creation of new spots and editing of existing spots
.service('NewSpot', function($filter) {
  var newSpot;

  // Initialize a new Spot
  var setNewSpot = function(geojsonObj) {
    if (!newSpot)
      newSpot = {};
      
    // If Spot already exists or was created from map
    // (Spot already has geometry and maybe properties too)
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
            date: $filter("date")(Date.now(), 'yyyy-MM-dd')
          };
        }
      }
    }
    // If new Spot created from Spots menu (Spot has no geometry yet)
    else {
      newSpot.properties = {
        date: $filter("date")(Date.now(), 'yyyy-MM-dd')
      };
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
  