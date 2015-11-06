(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageMapController', ImageMapController);

  ImageMapController.$inject = ['$window', '$rootScope', '$state', '$cordovaGeolocation', '$location',
    '$filter', '$ionicHistory', '$ionicModal', '$ionicPopup', '$ionicActionSheet',
    '$ionicSideMenuDelegate', '$log', 'NewSpot', 'CurrentSpot', 'CoordinateRange',
    'MapView', 'OfflineTilesFactory', 'SlippyTileNamesFactory', 'SpotsFactory',
    'ViewExtentFactory', 'SymbologyFactory', 'MapLayerFactory', 'ImageMapService', 'DrawFactory',
    'InitializeMapFactory'];

  function ImageMapController($window, $rootScope, $state, $cordovaGeolocation, $location,
                              $filter, $ionicHistory, $ionicModal, $ionicPopup, $ionicActionSheet,
                              $ionicSideMenuDelegate, $log, NewSpot, CurrentSpot, CoordinateRange,
                              MapView, OfflineTilesFactory, SlippyTileNamesFactory, SpotsFactory,
                              ViewExtentFactory, SymbologyFactory, MapLayerFactory, ImageMapService, DrawFactory,
                              InitializeMapFactory) {
    var vm = this;

    vm.imageMap = ImageMapService.getCurrentImageMap();

    var map;
    var featureLayer;
    var popup;

    activate();

    function activate() {
      InitializeMapFactory.setImageMap(vm.imageMap);
      InitializeMapFactory.setInitialMapView();
      InitializeMapFactory.setMap();
      InitializeMapFactory.setLayers();
      InitializeMapFactory.setMapControls();
      InitializeMapFactory.setPopupOverlay();

      map = InitializeMapFactory.getMap();
      featureLayer = MapLayerFactory.getFeatureLayer();
      popup = InitializeMapFactory.getPopupOverlay();
    }

    // disable dragging back to ionic side menu because this affects drawing tools
    $ionicSideMenuDelegate.canDragContent(false);

    Math.radians = function (deg) {
      return deg * (Math.PI / 180);
    };

    // did we come back from a map provider?
    /*       if (OfflineTilesFactory.getCurrentMapProvider()) {
     // yes -- then we need to change the current visible layer
     $log.log('back at map, ', OfflineTilesFactory.getCurrentMapProvider());

     var onlineLayerCollection = onlineLayer.getLayers().getArray();

     _.each(onlineLayerCollection, function(layer) {
     if (layer.get('id') == OfflineTilesFactory.getCurrentMapProvider()) {
     layer.setVisible(true);
     } else {
     layer.setVisible(false);
     }
     });
     }
     */
    // update the current visible layer, there is no return type as it updates the scope variable directly
    var getCurrentVisibleLayer = function () {
      // the first element in the layers array is our ol.layer.group that contains all the map tile layers
      var mapTileLayers = map.getLayers().getArray()[0].getLayers().getArray();

      // loop through and get the first layer that is visible
      var mapTileId = _.find(mapTileLayers, function (layer) {
        return layer.getVisible();
      });

      return mapTileId.get('id');
    };

    /*      vm.isOnline = function() {
     return navigator.onLine;
     };
     */
    // Watch whether we have internet access or not
    /*       vm.$watch('isOnline()', function(online) {

     if (!online) {
     $log.log('Offline');

     // remove the online maps
     map.removeLayer(onlineLayer);
     map.removeLayer(onlineOverlayLayer);

     // Add offline tile layer
     map.getLayers().insertAt(0, offlineLayer);
     map.getLayers().insertAt(1, offlineOverlayLayer);

     // clear the tiles, because we need to redraw if tiles have already been loaded to the screen
     map.getLayers().getArray()[0].getLayers().item(0).getSource().tileCache.clear();
     map.getLayers().getArray()[0].getLayers().item(1).getSource().tileCache.clear();
     map.getLayers().getArray()[1].getLayers().item(0).getSource().tileCache.clear();

     // re-render the map, grabs 'new' tiles from storage
     map.render();
     } else {
     $log.log('Online');

     // remove the offline layers
     map.removeLayer(offlineLayer);
     map.removeLayer(offlineOverlayLayer);

     // Add online map layer
     map.getLayers().insertAt(0, onlineLayer);
     map.getLayers().insertAt(1, onlineOverlayLayer);
     }
     });
     */
    // cache the tiles in the current view but don't switch to the offline layer
    /*   vm.cacheOfflineTiles = function() {
     if (navigator.onLine) {
     // get the map extent
     var mapViewExtent = getMapViewExtent();

     // set the extent into the ViewExtentFactory
     ViewExtentFactory.setExtent(getCurrentVisibleLayer(), mapViewExtent.topRight, mapViewExtent.bottomLeft, mapViewExtent.zoom);

     // we set the current map provider so if we ever come back, we should try to use that map provider instead of the default provider
     OfflineTilesFactory.setCurrentMapProvider(getCurrentVisibleLayer());

     $location.path('/app/map/archiveTiles');
     } else
     $ionicPopup.alert({
     title: 'Offline!',
     template: 'You must be online to save a map!'
     });
     };*/

    // If the map is moved save the view
    map.on('moveend', function (evt) {
      // MapView.setMapView(map.getView());

      // update the zoom information control
      vm.currentZoom = evt.map.getView().getZoom();
    });

    // Zoom to the extent of the spots, if that fails geolocate the user
    vm.zoomToSpotsExtent = function () {
      // nope, we have NO mapview set, so...

      // Loop through all spots and create ol vector layers
      SpotsFactory.all().then(function (spots) {
        // Get only the spots mapped on this image
        spots = _.filter(spots, function (spot) {
          return spot.properties.image_map === vm.imageMap.id;
        });

        // do we even have any spots?
        if (spots.length > 0) {
          $log.log('found spots, attempting to get the center of all spots and change the map view to that');
          CoordinateRange.setAllCoordinates(spots);
          var newExtent = ol.extent.boundingExtent(_.compact(CoordinateRange.getAllCoordinates()));
          var newExtentCenter = ol.extent.getCenter(newExtent);

          // fly-by map animation
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

          if (spots.length === 1) {
            // we just have a single spot, so we should fixate the resolution manually
            // initialMapView.setCenter(newExtentCenter);
            map.getView().fit(newExtent, map.getSize());
            // initialMapView.setZoom(15);
            map.getView().setZoom(3);
          }
          else {
            // we have multiple spots -- need to create the new view with the new center
            /*   var newView = new ol.View({
             center: newExtentCenter
             });

             map.setView(newView);*/
            map.getView().fit(newExtent, map.getSize());
          }
        }
        // no spots either, then attempt to geolocate the user
        else {
          $log.log('no spots found');
          // attempt to geolocate instead
          /*     $cordovaGeolocation.getCurrentPosition({
           maximumAge: 0,
           timeout: 10000,
           enableHighAccuracy: true
           })
           .then(function (position) {
           var lat = position.coords.latitude;
           var lng = position.coords.longitude;

           $log.log('initial getLocation ', [lat, lng]);

           var newView = new ol.View({
           center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
           zoom: 17,
           minZoom: 4
           });
           map.setView(newView);
           }, function (err) {
           // uh oh, cannot geolocate, nor have any spots
           $ionicPopup.alert({
           title: 'Alert!',
           template: 'Could not geolocate your position.  Defaulting you to 0,0'
           });
           var newView = new ol.View({
           center: ol.proj.transform([0, 0], 'EPSG:4326', 'EPSG:3857'),
           zoom: 4,
           minZoom: 4
           });
           map.setView(newView);
           });*/
        }
      });
    };

    //  do we currently have mapview set?  if so, we should reset the map view to that first
    /*   if (MapView.getMapView()) {
     $log.log('have mapview set, changing map view to that');
     map.setView(MapView.getMapView());
     }
     else
     vm.zoomToSpotsExtent();
     */

    // Point object
    var Point = function (lat, lng) {
      this.lat = lat;
      this.lng = lng;
    };
    /*
     var getMapViewExtent = function () {
     var extent = map.getView().calculateExtent(map.getSize());
     var zoom = map.getView().getZoom();
     var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent),
     'EPSG:3857', 'EPSG:4326');
     var topRight = ol.proj.transform(ol.extent.getTopRight(extent),
     'EPSG:3857', 'EPSG:4326');

     return {
     topRight: new Point(topRight[1], topRight[0]),
     bottomLeft: new Point(bottomLeft[1], bottomLeft[0]),
     zoom: zoom
     };
     };*/

    // we want to load all the geojson markers from the persistence storage onto the map
    // creates a ol vector layer for supplied geojson object
    var geojsonToVectorLayer = function (geojson) {
      // textStyle is a function because each point has a different text associated
      var textStyle = function (text) {
        return new ol.style.Text({
          'font': '12px Calibri,sans-serif',
          'text': text,
          'fill': new ol.style.Fill({
            'color': '#000'
          }),
          'stroke': new ol.style.Stroke({
            'color': '#fff',
            'width': 3
          })
        });
      };

      var textStylePoint = function (text, rotation) {
        return new ol.style.Text({
          'font': '12px Calibri,sans-serif',
          'text': '          ' + text,  // we pad with spaces due to rotational offset
          'textAlign': 'center',
          'rotation': Math.radians(rotation) * (-1),
          'fill': new ol.style.Fill({
            'color': '#000'
          }),
          'stroke': new ol.style.Stroke({
            'color': '#fff',
            'width': 3
          })
        });
      };

      var getIconForFeature = function (feature) {
        var rotation = feature.get('strike') || feature.get('trend') || 0;
        var orientation = feature.get('dip') || feature.get('plunge') || 0;
        var feature_type = feature.get('planar_feature_type') || feature.get('linear_feature_type');

        // Is this a planar or linear feature? If both use planar.
        var pORl = feature.get('planar_feature_type') ? 'planar' : 'linear';
        // If feature_type is undefined use planar as default so get the default planar symbol
        pORl = feature_type ? pORl : 'planar';

        return new ol.style.Icon({
          'anchorXUnits': 'fraction',
          'anchorYUnits': 'fraction',
          'opacity': 1,
          'rotation': Math.radians(rotation) * (-1),
          'src': SymbologyFactory.getSymbolPath(feature_type, pORl, orientation),
          'scale': 0.05
        });
      };

      // Set styles for points, lines and polygon and groups
      function styleFunction(feature, resolution) {
        var styles = [];
        var pointText = angular.isDefined(feature.get('plunge')) ? feature.get('plunge').toString() : feature.get('label');
        pointText = angular.isDefined(feature.get('dip')) ? feature.get('dip').toString() : pointText;

        var rotation = feature.get('strike') || feature.get('trend') || 0;

        switch (feature.get('type')) {
          case 'point':
            var pointStyle = [
              new ol.style.Style({
                'image': getIconForFeature(feature),
                'text': textStylePoint(pointText, rotation)
              })
            ];
            styles.Point = pointStyle;
            styles.MultiPoint = pointStyle;
            break;
          case 'line':
            var lineStyle = [
              new ol.style.Style({
                'stroke': new ol.style.Stroke({
                  'color': 'rgba(204, 0, 0, 0.7)',
                  'width': 3
                }),
                'text': textStyle(feature.get('label'))
              })
            ];
            styles.LineString = lineStyle;
            styles.MultiLineString = lineStyle;
            break;
          case 'polygon':
            var polyText = feature.get('unit_label_abbreviation') ? feature.get('unit_label_abbreviation') : feature.get('label');
            var polyStyle = [
              new ol.style.Style({
                'stroke': new ol.style.Stroke({
                  'color': '#000000',
                  'width': 0.5
                }),
                'fill': new ol.style.Fill({
                  'color': 'rgba(102, 0, 204, 0.4)'
                }),
                'text': textStyle(polyText)
              })
            ];
            styles.Polygon = polyStyle;
            styles.MultiPolygon = polyStyle;
            break;
          case 'group':
            var groupText = feature.get('group_name') ? feature.get('group_name') : feature.get('label');
            var groupStyle = [
              new ol.style.Style({
                'stroke': new ol.style.Stroke({
                  'color': '#000000',
                  'width': 0.5
                }),
                'fill': new ol.style.Fill({
                  'color': 'rgba(255, 128, 0, 0.4)'
                }),
                'text': textStyle(groupText)
              })
            ];
            styles.Polygon = groupStyle;
            styles.MultiPolygon = groupStyle;
            break;
        }
        return styles[feature.getGeometry().getType()];
      }

      return new ol.layer.Vector({
        'source': new ol.source.Vector({
          'features': (new ol.format.GeoJSON()).readFeatures(geojson/* , {
           featureProjection: 'EPSG:3857'
           }*/)
        }),
        'title': geojson.properties.name,
        'style': styleFunction
      });
    };

    // Loop through all spots and create ol vector layers
    SpotsFactory.all().then(function (spots) {
      // wipe the array because we want to avoid duplicating the feature in the ol.Collection
      featureLayer.getLayers().clear();

      // Get mappable spots (spots made from the Spots Page, instead of
      // from the map, do not have geometry until defined by the user)
      /*  var mappableSpots = _.filter(spots, function (spot) {
       return spot.geometry.coordinates;
       });*/

      ImageMapService.clearCurrentImageMap();

      var mappableSpots = _.filter(spots, function (spot) {
        return spot.properties.image_map === vm.imageMap.id;
      });

      // get distinct groups and aggregate spots by group type
      var spotGroup = _.groupBy(mappableSpots, function (spot) {
        return spot.properties.type;
      });

      var spotTypes = {
        'point': 'Measurements & Observations',
        'line': 'Contacts & Traces',
        'polygon': 'Rock Descriptions',
        'group': 'Stations'
      };

      // go through each group and assign all the aggregates to the geojson feature
      for (var key in spotGroup) {
        if (spotGroup.hasOwnProperty(key)) {
          // create a geojson to hold all the spots that fit the same spot type
          var spotTypeLayer = {
            'type': 'FeatureCollection',
            'features': spotGroup[key],
            'properties': {
              'name': spotTypes[key] + ' (' + spotGroup[key].length + ')'
            }
          };

          // add the feature collection layer to the map
          featureLayer.getLayers().push(geojsonToVectorLayer(spotTypeLayer));
        }
      }
    });

    map.on('touchstart', function (event) {
      $log.log('touch');
      $log.log(event);
    });

    // display popup on click
    map.on('click', function (evt) {
      $log.log('map clicked');

      // are we in draw mode?  If so we dont want to display any popovers during draw mode
      if (!DrawFactory.isDrawMode()) {
        // clear any existing popovers
        popup.hide();

        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
          return feature;
        }, this, function (layer) {
          // we only want the layer where the spots are located
          return (layer instanceof ol.layer.Vector) && layer.get('name') !== 'drawLayer' && layer.get('name') !== 'geolocationLayer';
        });

        var layer = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
          return layer;
        }, this, function (layer) {
          // we only want the layer where the spots are located
          return (layer instanceof ol.layer.Vector) && layer.get('name') !== 'drawLayer' && layer.get('name') !== 'geolocationLayer';
        });

        var spotTypes = [{
          'label': 'Measurement or Observation',
          'value': 'point'
        }, {
          'label': 'Contact or Trace',
          'value': 'line'
        }, {
          'label': 'Rock Description',
          'value': 'polygon'
        }, {
          'label': 'Station',
          'value': 'group'
        }];

        // we need to check that we're not clicking on the geolocation layer
        if (feature && layer.get('name') !== 'geolocationLayer') {
          // popup content
          var content = '';
          content += '<a href="#/spotTab/' + feature.get('id') + '/notes"><b>' + feature.get('name') + '</b></a>';
          content += '<br>';
          content += '<small>' + _.findWhere(spotTypes, {'value': feature.get('type')}).label + '</small>';

          if (feature.get('planar_feature_type')) {
            content += '<br>';
            content += '<small>' + feature.get('planar_feature_type') + '</small>';
          }

          if (feature.get('contact_type')) {
            content += '<br>';
            content += '<small>' + feature.get('contact_type') + '</small>';
          }

          if (feature.get('rock_type')) {
            content += '<br>';
            content += '<small>' + feature.get('rock_type') + '</small>';
          }

          if (feature.get('strike') && feature.get('dip')) {
            content += '<br>';
            content += '<small>' + feature.get('strike') + '&deg; strike / ' + feature.get('dip') + '&deg; dip</small>';
          }

          if (feature.get('linear_feature_type')) {
            content += '<br>';
            content += '<small>' + feature.get('linear_feature_type') + '</small>';
          }

          if (feature.get('trend') && feature.get('plunge')) {
            content += '<br>';
            content += '<small>' + feature.get('trend') + '&deg; trend / ' + feature.get('plunge') + '&deg; plunge</small>';
          }

          if (feature.get('group_relationship')) {
            content += '<br>';
            content += '<small>Grouped by: ' + feature.get('group_relationship').join(', ') + '</small>';
          }
          content = content.replace(/_/g, ' ');

          // setup the popup position
          popup.show(evt.coordinate, content);
        }
      }
    });
    /*
     var geolocationWatchId;

     // Get current position
     vm.toggleLocation = function () {

     if (vm.locationOn === undefined || vm.locationOn === false) {
     vm.locationOn = true;
     } else {
     vm.locationOn = false;
     }

     if (vm.locationOn) {
     $log.log('toggleLocation is now true');
     $cordovaGeolocation.getCurrentPosition({
     maximumAge: 0,
     timeout: 10000,
     enableHighAccuracy: true
     })
     .then(function (position) {
     var lat = position.coords.latitude;
     var lng = position.coords.longitude;
     var altitude = position.coords.altitude;
     var accuracy = position.coords.accuracy;
     var heading = position.coords.heading;
     var speed = position.coords.speed;

     $log.log('getLocation ', [lat, lng], '(accuracy: ' + accuracy + ') (altitude: ' + altitude + ') (heading: ' + heading + ') (speed: ' + speed + ')');

     var newView = new ol.View({
     center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
     zoom: 18,
     minZoom: 4
     });
     map.setView(newView);
     }, function (err) {
     $ionicPopup.alert({
     title: 'Alert!',
     template: 'Unable to get location: ' + err.message
     });
     });

     geolocationWatchId = $cordovaGeolocation.watchPosition({
     frequency: 1000,
     timeout: 10000,
     enableHighAccuracy: true // may cause errors if true
     });

     geolocationWatchId.then(
     null,
     function (err) {
     $ionicPopup.alert({
     title: 'Alert!',
     template: 'Unable to get location for geolocationWatchId: ' + geolocationWatchId.watchID + ' (' + err.message + ')'
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

     $log.log('getLocation-watch ', [lat, lng], '(accuracy: ' + accuracy + ') (altitude: ' + altitude + ') (heading: ' + heading + ') (speed: ' + speed + ')');

     // create a point feature and assign the lat/long to its geometry
     var iconFeature = new ol.Feature({
     geometry: new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'))
     });

     // add addition geolocation data to the feature so we can recall it later
     iconFeature.set('altitude', altitude);
     iconFeature.set('accuracy', (accuracy === null) ? null : Math.floor(accuracy));
     iconFeature.set('altitudeAccuracy', altitudeAccuracy);
     iconFeature.set('heading', heading);
     iconFeature.set('speed', (speed === null) ? null : Math.floor(speed));

     var vectorSource = new ol.source.Vector({
     features: [iconFeature]
     });

     geolocationLayer.setSource(vectorSource);
     });
     } else {
     // locationOn must be false
     $log.log('toggleLocation is now false');

     // clear geolocation watch
     geolocationWatchId.clearWatch();

     // clear the geolocation marker
     geolocationLayer.setSource(new ol.source.Vector({}));
     }
     };
     */

    vm.goToImageMaps = function () {
      $state.go('app.image-maps');
    };

    /**
     * ACTIONSHEET
     */

    vm.showActionsheet = function () {
      $ionicActionSheet.show({
        'titleText': 'Map Actions',
        'buttons': [{
          'text': '<i class="icon ion-map"></i> Zoom to Extent of Spots'
        }, {
          'text': '<i class="icon ion-grid"></i> Add Features to a New Station'
        }],
        'cancelText': 'Cancel',
        'cancel': function () {
          $log.log('CANCELLED');
        },
        'buttonClicked': function (index) {
          $log.log('BUTTON CLICKED', index);
          switch (index) {
            case 0:
              vm.zoomToSpotsExtent();
              break;
            case 1:
              DrawFactory.groupSpots();
              break;
          }
          return true;
        }
      });
    };
  }
}());
