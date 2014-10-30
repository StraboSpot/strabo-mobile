angular.module('app')

// Save the current map view lat, long and zoom level
.service('MapView', function() {
  var mapView = {};
  var restoreView;
  
  var setZoom = function(zoom) {
    mapView.zoom = zoom;
  }
  
  var setLat = function(lat) {
    mapView.lat = lat;
  }
  
  var setLng = function(lng) {
    mapView.lng = lng;
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
    setZoom: setZoom,
    setLat: setLat,
    setLng: setLng,
    getMapView: getMapView,
    setRestoreView: setRestoreView,
    getRestoreView: getRestoreView
  };
})
  