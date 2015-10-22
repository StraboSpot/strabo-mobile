/**
 * Save the current map view lat, long and zoom level
 */

'use strict';

angular
  .module('app')
  .service('MapView', function () {
    var mapView;

    var setMapView = function (view) {
      mapView = view;
    };

    var getMapView = function () {
      return mapView;
    };

    return {
      'setMapView': setMapView,
      'getMapView': getMapView
    };
  });
