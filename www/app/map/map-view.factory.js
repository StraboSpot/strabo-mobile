(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapViewFactory', MapViewFactory);

  MapViewFactory.$inject = ['$cordovaGeolocation', '$ionicPopup', '$log',
    'CoordinateRange', 'InitializeMapFactory', 'SpotsFactory'];

  function MapViewFactory($cordovaGeolocation, $ionicPopup, $log,
                          CoordinateRange, InitializeMapFactory, SpotsFactory) {
    var mapView;
    var viewExtent;

    return {
      'clearExtent': clearExtent,
      'getExtent': getExtent,
      'setExtent': setExtent,
      'getMapView': getMapView,
      'setMapView': setMapView,
      'zoomToSpotsExtent': zoomToSpotsExtent
    };

    function clearExtent() {
      viewExtent = null;
    }

    function getExtent() {
      return viewExtent;
    }

    function setExtent(mapProvider, topRight, bottomLeft, zoom) {
      viewExtent = {
        'mapProvider': mapProvider,
        'topRight': topRight,
        'bottomLeft': bottomLeft,
        'zoom': zoom
      };
    }

    function getMapView() {
      return mapView;
    }

    function setMapView(view) {
      mapView = view;
    }

    function zoomToSpotsExtent(map, imageMap) {
      // nope, we have NO mapview set, so...
      var isImageMap = angular.isDefined(imageMap);

      // Remove spots that don't have a geometry defined or are mapped on an image
      function getMapSpots(spots) {
        return _.reject(spots, function (spot) {
          return !_.has(spot, 'geometry') || _.has(spot.properties, 'image_map');
        });
      }

      // Get only the spots mapped on this image
      function getImageMapSpots(spots) {
        return _.filter(spots, function (spot) {
          return spot.properties.image_map === imageMap.id;
        });
      }

      // If there is just one spot set the map view centered at the single spot
      // Otherwise fit the map view to the extent of the spots
      function setNewMapView(spots) {
        CoordinateRange.setAllCoordinates(spots);
        var newExtent = ol.extent.boundingExtent(_.compact(CoordinateRange.getAllCoordinates()));
        var newExtentCenter = ol.extent.getCenter(newExtent);
        if (spots.length === 1) {
          $log.log('Found 1 spot, setting the map view to center on the spot.');
          var initialMapView = InitializeMapFactory.getInitialMapView();
          initialMapView.setCenter(ol.proj.transform(
            [newExtentCenter[0], newExtentCenter[1]],
            'EPSG:4326', 'EPSG:3857'));
          initialMapView.setZoom(15);
        }
        else {
          $log.log('Found multiple spots, fitting the map view to the extent of the spots.');
          var newView = new ol.View({
            'center': ol.proj.transform([newExtentCenter[0], newExtentCenter[1]], 'EPSG:4326', 'EPSG:3857')
          });
          map.setView(newView);
          map.getView().fit(ol.proj.transformExtent(newExtent, 'EPSG:4326', 'EPSG:3857'), map.getSize());
        }
      }

      // Fit the extent of the spots
      function setNewImageMapView(spots) {
        $log.log('Fitting the map view to the extent of the spots.');
        CoordinateRange.setAllCoordinates(spots);
        var newExtent = ol.extent.boundingExtent(_.compact(CoordinateRange.getAllCoordinates()));
        map.getView().fit(newExtent, map.getSize());
      }

      function doFlyByAnimation() {
        var duration = 2000;
        var start = +new Date();
        var pan = ol.animation.pan({
          'duration': duration,
          'source': map.getView().getCenter(),
          'start': start
        });
        var bounce = ol.animation.bounce({
          'duration': duration,
          'resolution': map.getView().getResolution(),
          'start': start
        });
        map.beforeRender(pan, bounce);
      }

      // Loop through all spots and create ol vector layers
      SpotsFactory.all().then(function (spots) {
        if (isImageMap) {
          spots = getImageMapSpots(spots);
          if (spots.length > 0) {
            doFlyByAnimation();
            setNewImageMapView(spots);
          }
        }
        else {
          if (spots.length > 0) {
            spots = getMapSpots(spots);
            doFlyByAnimation();
            setNewMapView(spots);
          }
          else {
            $log.log('No spots found, attempting to geolocate and center on the that.');
            // attempt to geolocate instead
            $cordovaGeolocation.getCurrentPosition({
              'maximumAge': 0,
              'timeout': 10000,
              'enableHighAccuracy': true
            }).then(
              function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;

                $log.log('initial getLocation ', [lat, lng]);

                var newView = new ol.View({
                  'center': ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
                  'zoom': 17,
                  'minZoom': 4
                });
                map.setView(newView);
              },
              function (err) {
                // uh oh, cannot geolocate, nor have any spots
                $ionicPopup.alert({
                  'title': 'Alert!',
                  'template': 'Could not geolocate your position.  Defaulting you to 0,0'
                });
                var newView = new ol.View({
                  'center': ol.proj.transform([0, 0], 'EPSG:4326', 'EPSG:3857'),
                  'zoom': 4,
                  'minZoom': 4
                });
                map.setView(newView);
              }
            );
          }
        }
      });
    }
  }
}());
