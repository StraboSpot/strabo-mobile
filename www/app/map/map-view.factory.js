(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapViewFactory', MapViewFactory);

  MapViewFactory.$inject = ['$cordovaGeolocation', '$ionicPopup', '$log', 'CoordinateRangeFactory', 'MapLayerFactory',
    'MapSetupFactory', 'OfflineTilesFactory', 'SpotFactory'];

  function MapViewFactory($cordovaGeolocation, $ionicPopup, $log, CoordinateRangeFactory, MapLayerFactory, MapSetupFactory,
                          OfflineTilesFactory, SpotFactory) {
    var mapView;
    var viewExtent;

    return {
      'clearExtent': clearExtent,
      'getCurrentLocation': getCurrentLocation,
      'getExtent': getExtent,
      'setExtent': setExtent,
      'getMapView': getMapView,
      'getMapViewExtent': getMapViewExtent,
      'setMapView': setMapView,
      'zoomToSpotsExtent': zoomToSpotsExtent
    };

    function clearExtent() {
      viewExtent = null;
    }

    function getCurrentLocation(map, locationOn) {
      var geolocationWatchId;
      var geolocationLayer = MapLayerFactory.getGeolocationLayer();

      if (locationOn) {
        $log.log('toggleLocation is now true');
        $cordovaGeolocation.getCurrentPosition({
          'maximumAge': 0,
          'timeout': 10000,
          'enableHighAccuracy': true
        }).then(
          function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var altitude = position.coords.altitude;
            var accuracy = position.coords.accuracy;
            var heading = position.coords.heading;
            var speed = position.coords.speed;

            $log.log('getLocation ', [lat, lng],
              '(accuracy: ' + accuracy + ') (altitude: ' + altitude + ') (heading: ' + heading + ') (speed: ' + speed + ')');

            var newView = new ol.View({
              'center': ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
              'zoom': 18,
              'minZoom': 4
            });
            map.setView(newView);
          }, function (err) {
            $ionicPopup.alert({
              'title': 'Alert!',
              'template': 'Unable to get location: ' + err.message
            });
          });

        geolocationWatchId = $cordovaGeolocation.watchPosition({
          'frequency': 1000,
          'timeout': 10000,
          'enableHighAccuracy': true // may cause errors if true
        });

        geolocationWatchId.then(
          null,
          function (err) {
            $ionicPopup.alert({
              'title': 'Alert!',
              'template': 'Unable to get location for geolocationWatchId: ' + geolocationWatchId.watchID + ' (' + err.message + ')'
            });
            // TODO: what do we do here?
          },
          function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var altitude = position.coords.altitude;
            var accuracy = position.coords.accuracy;
            var altitudeAccuracy = position.coords.altitudeAccuracy;
            var heading = position.coords.heading;
            var speed = position.coords.speed;

            /*$log.log('getLocation-watch ', [lat, lng],
              '(accuracy: ' + accuracy + ') (altitude: ' + altitude + ') (heading: ' + heading + ') (speed: ' + speed + ')');
             */
            // create a point feature and assign the lat/long to its geometry
            var iconFeature = new ol.Feature({
              'geometry': new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'))
            });

            // add addition geolocation data to the feature so we can recall it later
            iconFeature.set('altitude', altitude);
            iconFeature.set('accuracy', (accuracy === null) ? null : Math.floor(accuracy));
            iconFeature.set('altitudeAccuracy', altitudeAccuracy);
            iconFeature.set('heading', heading);
            iconFeature.set('speed', (speed === null) ? null : Math.floor(speed));

            var vectorSource = new ol.source.Vector({
              'features': [iconFeature]
            });

            geolocationLayer.setSource(vectorSource);
          });
      }
      else {
        // locationOn must be false
        $log.log('toggleLocation is now false');

        // clear geolocation watch
        if (geolocationWatchId) geolocationWatchId.clearWatch();

        // clear the geolocation marker
        geolocationLayer.setSource(new ol.source.Vector({}));
      }
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
      // did we come back from a map provider?
      if (OfflineTilesFactory.getCurrentMapProvider()) {
        // yes -- then we need to change the current visible layer
        $log.log('back at map, ', OfflineTilesFactory.getCurrentMapProvider());

        var onlineLayer = MapLayerFactory.getOnlineLayer();
        var onlineLayerCollection = onlineLayer.getLayers().getArray();

        _.each(onlineLayerCollection, function (layer) {
          if (layer.get('id') === OfflineTilesFactory.getCurrentMapProvider()) {
            layer.setVisible(true);
          }
          else {
            layer.setVisible(false);
          }
        });
      }
      return mapView;
    }

    function getMapViewExtent(map) {
      // Point object
      function Point(lat, lng) {
        this.lat = lat;
        this.lng = lng;
      }

      var extent = map.getView().calculateExtent(map.getSize());
      var zoom = map.getView().getZoom();
      var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent),
        'EPSG:3857', 'EPSG:4326');
      var topRight = ol.proj.transform(ol.extent.getTopRight(extent),
        'EPSG:3857', 'EPSG:4326');

      return {
        'topRight': new Point(topRight[1], topRight[0]),
        'bottomLeft': new Point(bottomLeft[1], bottomLeft[0]),
        'zoom': zoom
      };
    }

    function setMapView(view) {
      mapView = view;
    }

    function zoomToSpotsExtent(map, imageBasemap) {
      // nope, we have NO mapview set, so...
      var isImageBasemap = angular.isDefined(imageBasemap);

      // Remove spots that don't have a geometry defined or are mapped on an image
      function getMapSpots(spots) {
        return _.reject(spots, function (spot) {
          return !_.has(spot, 'geometry') || _.has(spot.properties, 'image_basemap');
        });
      }

      // Get only the spots mapped on this image
      function getImageBasemapSpots(spots) {
        return _.filter(spots, function (spot) {
          return spot.properties.image_basemap === imageBasemap.id;
        });
      }

      // If there is just one spot set the map view centered at the single spot
      // Otherwise fit the map view to the extent of the spots
      function setNewMapView(spots) {
        CoordinateRangeFactory.setAllCoordinates(spots);
        var newExtent = ol.extent.boundingExtent(_.compact(CoordinateRangeFactory.getAllCoordinates()));
        var newExtentCenter = ol.extent.getCenter(newExtent);
        if (spots.length === 1) {
          $log.log('Found 1 spot, setting the map view to center on the spot.');
          var initialMapView = MapSetupFactory.getInitialMapView();
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
      function setNewImageBasemapView(spots) {
        $log.log('Fitting the map view to the extent of the spots.');
        CoordinateRangeFactory.setAllCoordinates(spots);
        var newExtent = ol.extent.boundingExtent(_.compact(CoordinateRangeFactory.getAllCoordinates()));
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
      var spots = SpotFactory.getActiveSpots();
      if (isImageBasemap) {
        spots = getImageBasemapSpots(spots);
        if (spots.length > 0) {
          doFlyByAnimation();
          setNewImageBasemapView(spots);
        }
      }
      else {
        spots = getMapSpots(spots);
        if (spots.length > 0) {
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
    }
  }
}());
