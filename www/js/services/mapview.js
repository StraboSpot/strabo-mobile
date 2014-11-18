angular.module('app')

// Save the current map view lat, long and zoom level
.service('MapView', function() {
  var mapView;
  var restoreView;
  
  var setMapView = function(view) {
    mapView = view;
  }
  
  var getMapView = function() {
    return mapView;
  }
  
  var setRestoreView = function() {
    restoreView = true;
  }
  
  var getRestoreView = function() {
    return restoreView;
  }
  
  return {
    setMapView: setMapView,
    getMapView: getMapView,
    setRestoreView: setRestoreView,
    getRestoreView: getRestoreView
  };
})
  