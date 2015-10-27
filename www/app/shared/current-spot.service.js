/**
 * Service for temporarily saving the current spot
 * Used for preserving spot when switching tabs or changing the location/geometry
 */

(function () {
  'use strict';

  angular
    .module('app')
    .service('CurrentSpot', CurrentSpot);

  function CurrentSpot() {
    var currentSpot;

    var setCurrentSpot = function (geojsonObj) {
      currentSpot = geojsonObj;
    };

    var getCurrentSpot = function () {
      return currentSpot;
    };

    var clearCurrentSpot = function () {
      currentSpot = null;
    };

    return {
      'setCurrentSpot': setCurrentSpot,
      'getCurrentSpot': getCurrentSpot,
      'clearCurrentSpot': clearCurrentSpot
    };
  }
}());
