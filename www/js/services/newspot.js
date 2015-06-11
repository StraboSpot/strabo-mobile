angular.module('app')

// Service for dealing with the creation of new spots and editing of existing spots
.service('NewSpot', function() {
  var newSpot;

  // Initialize a new Spot
  var setNewSpot = function(geojsonObj) {
    if (!newSpot)
      newSpot = {
        'geometry': {},
        'type': undefined,
        'properties': {}
      };

    if (geojsonObj) {
      if (geojsonObj.geometry)
        newSpot.geometry = geojsonObj.geometry;
      if (geojsonObj.type)
        newSpot.type = geojsonObj.type;
      if (geojsonObj.properties)
        newSpot.properties = geojsonObj.properties;
      if (!newSpot.properties.date || !newSpot.properties.date ) {
        var time = new Date(Date.now());
        time.setSeconds(00);
        time.setMilliseconds(00);
        newSpot.properties['date'] = new Date(Date.now());
        newSpot.properties['time'] = time;
      }
      if (!newSpot.properties.id)
        newSpot.properties['id'] = Math.floor((new Date().getTime() + (Math.random() * 9000 + 1000) * .0001) * 10000); // datetime with random 4 digit number appended

      // Set type
      if (!newSpot.properties.type) {
        switch (newSpot.geometry.type){
          case "Point":
            newSpot.properties['type'] = 'point';
            break;
          case "LineString":
            newSpot.properties['type'] = 'line';
            break;
          case "Polygon":
            newSpot.properties['type'] = 'polygon';
            break;
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
