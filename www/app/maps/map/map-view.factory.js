(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapViewFactory', MapViewFactory);

  MapViewFactory.$inject = ['$ionicLoading', '$ionicPopup', '$log', 'HelpersFactory', 'MapLayerFactory', 'SpotFactory'];

  function MapViewFactory($ionicLoading, $ionicPopup, $log, HelpersFactory, MapLayerFactory, SpotFactory) {
    var mapView;
    var viewExtent;
    var initialMapView;
    var locationOn;

    return {
      'clearExtent': clearExtent,
      'getCurrentLocation': getCurrentLocation,
      'getInitialMapView': getInitialMapView,
      'getMapView': getMapView,
      'getMapViewExtent': getMapViewExtent,
      'setInitialMapView': setInitialMapView,
      'setLocationOn': setLocationOn,
      'setMapView': setMapView,
      'setMapViewExtent': setMapViewExtent,
      'setMapViewToSpot': setMapViewToSpot,
      'zoomToPoint': zoomToPoint,
      'zoomToSpotsExtent': zoomToSpotsExtent
    };

    /**
     * Private Functions
     */

    function gotCurrentPosition(map, position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var altitude = position.coords.altitude;
      var accuracy = position.coords.accuracy;
      var heading = position.coords.heading;
      var speed = position.coords.speed;

      $log.log('Got Location: ', [lat, lng],
        '(accuracy: ' + accuracy + ') (altitude: ' + altitude + ') (heading: ' + heading + ') (speed: ' + speed + ')');

      var newView = new ol.View({
        'center': ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
        'zoom': 18,
        'minZoom': 4
      });
      map.setView(newView);
      $ionicLoading.hide();
    }

    function showCurrentPositionError(err) {
      $ionicPopup.alert({
        'title': 'Alert!',
        'template': 'Unable to get your current position: ' + err.message
      });
      $ionicLoading.hide();
    }

    /**
     * Public Functions
     */

    function clearExtent() {
      viewExtent = null;
    }

    function getCurrentLocation(map) {
      var geolocationWatchId;
      var geolocationLayer = MapLayerFactory.getGeolocationLayer();

      function clearWatch() {
        if (geolocationWatchId) navigator.geolocation.clearWatch(geolocationWatchId);  // clear geolocation watch
        geolocationLayer.setSource(new ol.source.Vector({}));   // clear the geolocation marker
      }

      if (locationOn) {
        $log.log('toggleLocation is now true');
        $ionicLoading.show({
          'template': '<ion-spinner></ion-spinner><br>Getting location...'
        });
        if (navigator.geolocation) {
          const geolocationOptions = {
            'maximumAge': 0,
            'timeout': 10000,
            'enableHighAccuracy': true
          };
          navigator.geolocation.getCurrentPosition(function (position) {
            gotCurrentPosition(map, position);
            const watchOptions = {
              'frequency': 1000,
              'timeout': 10000,
              'enableHighAccuracy': true // may cause errors if true
            };
            geolocationWatchId = navigator.geolocation.watchPosition(function (position) {
              // Make sure the location toggle hasn't been turned off
              if (locationOn) {
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

                $log.log('setting geolocation source');
                geolocationLayer.setSource(vectorSource);
              }
              else {
                $log.log('toggleLocation is now false');
                clearWatch();
              }
            }, null, watchOptions);
          }, showCurrentPositionError, geolocationOptions);
        }
        else showCurrentPositionError('Geolocation is not supported by this browser.');
      }
      else {
        // locationOn must be false
        $log.log('toggleLocation is now false');
        clearWatch();
      }
    }

    function getInitialMapView() {
      return initialMapView;
    }

    function getMapView() {
      return mapView;
    }

    function getMapViewExtent() {
      return viewExtent;
    }

    function setInitialMapView(imageBasemap) {
      var center;
      var extent;
      var projection;
      var zoom;
      var minZoom;

      if (!imageBasemap) {
        projection = 'EPSG:3857';
        center = [-11000000, 4600000];
        zoom = 4;
        minZoom = 4;
      }
      else {
        extent = [0, 0, imageBasemap.width, imageBasemap.height];
        projection = new ol.proj.Projection({
          'code': 'map-image',
          'units': 'pixels',
          'extent': extent
        });
        center = ol.extent.getCenter(extent);
        zoom = 2;
        minZoom = 1;
      }

      initialMapView = new ol.View({
        'projection': projection,
        'center': center,
        'zoom': zoom,
        'minZoom': minZoom
      });
    }

    function setLocationOn(inLocationOn) {
      locationOn = inLocationOn;
    }

    function setMapView(map) {
      mapView = map.getView();
      $log.log('Saving map view as:', mapView);
      setMapViewExtent(map.getSize());
    }

    function setMapViewExtent(size) {
      // Point object
      function Point(lat, lng) {
        this.lat = lat;
        this.lng = lng;
      }

      var extent = mapView.calculateExtent(size);
      var zoom = HelpersFactory.roundToDecimalPlaces(mapView.getZoom(), 2);
      var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent),
        'EPSG:3857', 'EPSG:4326');
      var topRight = ol.proj.transform(ol.extent.getTopRight(extent),
        'EPSG:3857', 'EPSG:4326');

      viewExtent = {
        'topRight': new Point(topRight[1], topRight[0]),
        'bottomLeft': new Point(bottomLeft[1], bottomLeft[0]),
        'zoom': zoom
      };
    }

    function setMapViewToSpot(spot) {
      if (spot.geometry) {
        var center = SpotFactory.getCenter(spot);
        var spotCenter = ol.proj.transform([center.lon, center.lat], 'EPSG:4326', 'EPSG:3857');
        mapView = new ol.View({
          'center': spotCenter,
          'zoom': 16
        });
      }
    }

    function zoomToPoint(point, zoom) {
      var mapCenter = ol.proj.transform(point, 'EPSG:4326', 'EPSG:3857');
      mapView = new ol.View({
        'center': mapCenter,
        'zoom': zoom
      });
    }

    function zoomToSpotsExtent(map, spots) {
      if (spots.length > 0) {
        var features = turf.featureCollection(spots);
        var allCoords = turf.coordAll(features);
        var extent = ol.extent.boundingExtent(allCoords);
        if (map.getView().getProjection().getUnits() === 'pixels') map.getView().fit(extent, {'maxZoom': 6});
        else map.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857'),
          {'maxZoom': 15, 'duration': 1000});
      }
      else if (map.getView().getProjection().getUnits() === 'pixels') {
        map.getView().fit([0, 0, 150, 150]);
      }
      else {
        $log.log('No Spots found! Attempting to geolocate ...');
        if (navigator.geolocation) {
          const geolocationOptions = {
            'maximumAge': 0,
            'timeout': 1000,
            'enableHighAccuracy': true
          };
          navigator.geolocation.getCurrentPosition(function (position) {
            gotCurrentPosition(map, position);
          }, showCurrentPositionError, geolocationOptions);
        }
        else showCurrentPositionError('Geolocation is not supported by this browser.');
      }
    }
  }
}());
