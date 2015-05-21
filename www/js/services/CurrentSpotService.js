angular.module('app')

// Service for dealing with the creation of current spots and editing of existing spots
.service('CurrentSpot', function($filter) {
  var currentSpot;

  // Initialize a current Spot
  var setCurrentSpot = function(geojsonObj) {
    if (!currentSpot)
      currentSpot = {};

    if (geojsonObj) {
      if (geojsonObj.geometry)
        currentSpot.geometry = geojsonObj.geometry;
      if (geojsonObj.type)
        currentSpot.type = geojsonObj.type;
      if (geojsonObj.properties)
        currentSpot.properties = geojsonObj.properties;
      else {
        if (!currentSpot.properties) {
          var time = new Date(Date.now());
          time.setSeconds(00);
          time.setMilliseconds(00);
          currentSpot.properties = {
            date: new Date(Date.now()),
            time: time,
            id: Math.floor((new Date().getTime() + (Math.random() * 9000 + 1000) * .0001) * 10000), // datetime with random 4 digit number appended
            name: new Date().getTime().toString()
          };
        }
      }
    }
  };

  var getCurrentSpot = function() {
    return currentSpot;
  };

  var clearCurrentSpot = function() {
    currentSpot = null;
  };

  return {
    setCurrentSpot: setCurrentSpot,
    getCurrentSpot: getCurrentSpot,
    clearCurrentSpot: clearCurrentSpot
  };
});
