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
        newSpot.type = geojsonObj.type;
      if (geojsonObj.properties)
        newSpot.properties = geojsonObj.properties;
      else {
        if (!newSpot.properties) {
          var time = new Date(Date.now());
          time.setSeconds(00);
          time.setMilliseconds(00);
          newSpot.properties = {
            date: new Date(Date.now()),
            time: time,
            id: new Date().getTime().toString(),
            name: new Date().getTime().toString()
          };
        }
      }
    }
  };

  var getNewSpot = function() {
    return newSpot;
  };

  var clearNewSpot = function() {
    newSpot = null;
  };

  return {
    setNewSpot: setNewSpot,
    getNewSpot: getNewSpot,
    clearNewSpot: clearNewSpot
  };
});
