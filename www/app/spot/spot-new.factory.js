/**
 * Factory for dealing with the creation of new spots and editing of existing spots
 */

(function () {
  'use strict';

  angular
    .module('app')
    .factory('NewSpotFactory', NewSpotFactory);

  function NewSpotFactory() {
    var newSpot;

    return {
      'clearNewSpot': clearNewSpot,
      'getNewSpot': getNewSpot,
      'setNewSpot': setNewSpot
    };

    /**
     * Public Functions
     */

    function clearNewSpot() {
      newSpot = null;
    }

    function getNewSpot() {
      return newSpot;
    }

    // Initialize a new Spot
    function setNewSpot(jsonObj) {
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
    }
  }
}());
