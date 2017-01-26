(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapViewFactory', MapViewFactory);

  MapViewFactory.$inject = ['$cordovaGeolocation', '$ionicPopup', '$log', 'CoordinateRangeFactory', 'MapLayerFactory',
    'SpotFactory'];

  function MapViewFactory($cordovaGeolocation, $ionicPopup, $log, CoordinateRangeFactory, MapLayerFactory,
                          SpotFactory) {
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
      'zoomToSpotsExtent': zoomToSpotsExtent
    };

    /**
     * Public Functions
     */

    function clearExtent() {
      viewExtent = null;
    }

    function getCurrentLocation(map) {
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
            // Too many alerts on iOS
            /*$ionicPopup.alert({
             'title': 'Alert!',
             'template': 'Unable to get location for geolocationWatchId: ' + geolocationWatchId.watchID + ' (' + err.message + ')'
             });*/
            // TODO: what do we do here?
          },
          function (position) {
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
              if (geolocationWatchId) geolocationWatchId.clearWatch();
              // clear the geolocation marker
              geolocationLayer.setSource(new ol.source.Vector({}));
            }
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

      if (!imageBasemap) {
        projection = 'EPSG:3857';
        center = [-11000000, 4600000];
        zoom = 4;
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
      }

      initialMapView = new ol.View({
        'projection': projection,
        'center': center,
        'zoom': zoom,
        'minZoom': zoom
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
      var zoom = mapView.getZoom();
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
          map.getView().setCenter(ol.proj.transform(
            [newExtentCenter[0], newExtentCenter[1]],
            'EPSG:4326', 'EPSG:3857'));
          map.getView().setZoom(15);
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
            function () {
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
