// Service for dealing with the creation of new spots and editing of existing spots

angular
  .module('app')
  .service('NewSpot', function () {
    var newSpot;

    // Initialize a new Spot
    var setNewSpot = function (jsonObj) {
      newSpot = {
        'type': 'Feature',
        'properties': {}
      };

      // Set the geometry if the spot has been mapped
      if (jsonObj.geometry) {
        newSpot.geometry = jsonObj.geometry;
      }

      // Set the properties
      newSpot.properties = jsonObj.properties;

      // Set the date and time to now
      var d = new Date(Date.now());
      d.setMilliseconds(0);
      newSpot.properties.date = d;
      newSpot.properties.time = d;

      // Set id from the timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)
      newSpot.properties.id = Math.floor((new Date().getTime() + Math.random()) * 10);
    };

    var getNewSpot = function () {
      return newSpot;
    };

    var clearNewSpot = function () {
      newSpot = null;
    };

    return {
      'setNewSpot': setNewSpot,
      'getNewSpot': getNewSpot,
      'clearNewSpot': clearNewSpot
    };
  });
