/**
 * Service for temporarily saving the current spot
 * Used for preserving spot when switching tabs or changing the location/geometry
 */

(function () {
  'use strict';

  angular
    .module('app')
    .factory('CurrentSpotFactory', CurrentSpotFactory);

  function CurrentSpotFactory() {
    var currentSpot;

    return {
      'clearCurrentSpot': clearCurrentSpot,
      'getCurrentSpot': getCurrentSpot,
      'setCurrentSpot': setCurrentSpot
    };

    function clearCurrentSpot() {
      currentSpot = null;
    }

    function getCurrentSpot() {
      return currentSpot;
    }

    function setCurrentSpot(geojsonObj) {
      currentSpot = geojsonObj;
    }
  }
}());
