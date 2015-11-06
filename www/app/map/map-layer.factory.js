(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapLayerFactory', MapLayerFactory);

  MapLayerFactory.$inject = ['OfflineTilesFactory', '$window'];

  function MapLayerFactory(OfflineTilesFactory, $window) {
    var drawLayer;
    var featureLayer;
    var geolocationLayer;
    var offlineLayer;
    var offlineOverlayLayer;
    var onlineLayer;
    var onlineOverlayLayer;

    // Geolocation Layer Styles
    var geolocationCenterIconStyle;
    var geolocationHeadingIconStyle;
    var geolocationAccuracyTextStyle;
    var geolocationSpeedTextStyle;

    activate();

    return {
      'getCurrentVisibleLayer': getCurrentVisibleLayer,
      'getDrawLayer': getDrawLayer,
      'getFeatureLayer': getFeatureLayer,
      'getGeolocationLayer': getGeolocationLayer,
      'getOfflineLayer': getOfflineLayer,
      'getOfflineOverlayLayer': getOfflineOverlayLayer,
      'getOnlineLayer': getOnlineLayer,
      'getOnlineOverlayLayer': getOnlineOverlayLayer
    };

    /**
     * Private Functions
     */
    function activate() {
      // Initialize Layers
      setDrawLayer();
      setFeatureLayer();
      setGeolocationLayer();
      setOfflineLayer();
      setOfflineOverlayLayer();
      setOnlineLayer();
      setOnlineOverlayLayer();

      // Initialize Geolocation Layer Styles
      setGeolocationCenterIconStyle();
      setGeolocationHeadingIconStyle();
      setGeolocationAccuracyTextStyle();
      setGeolocationSpeedTextStyle();
    }

    // vector layer where we house all the geojson spot objects
    function setFeatureLayer() {
      featureLayer = new ol.layer.Group({
        'name': 'featureLayer',
        'title': 'Spot Types',
        'layers': []
      });
    }

    function setDrawLayer() {
      drawLayer = new ol.layer.Vector({
        'name': 'drawLayer',
        'source': new ol.source.Vector(),
        'style': new ol.style.Style({
          'fill': new ol.style.Fill({
            'color': 'rgba(255, 255, 255, 0.2)'
          }),
          'stroke': new ol.style.Stroke({
            'color': '#ffcc33',
            'width': 2
          }),
          'image': new ol.style.Circle({
            'radius': 7,
            'fill': new ol.style.Fill({
              'color': '#ffcc33'
            })
          })
        })
      });
    }

    function setGeolocationLayer() {
      geolocationLayer = new ol.layer.Vector({
        'name': 'geolocationLayer',
        'style': function (feature, resolution) {
          return [
            geolocationCenterIconStyle,
            geolocationHeadingIconStyle(feature.get('heading')),
            geolocationAccuracyTextStyle(feature.get('accuracy')),
            geolocationSpeedTextStyle(feature.get('speed'))
          ];
        }
      });
    }

    // offline layer using tileLoadFunction source
    function setOfflineLayer() {
      offlineLayer = new ol.layer.Group({
        'name': 'offlineLayer',
        'title': 'Offline Maps',
        'layers': [
          new ol.layer.Tile({
            'title': 'Satellite',
            'id': 'mqSat',
            'type': 'base',
            'visible': false,
            'source': new ol.source.OSM({
              'tileLoadFunction': tileLoadFunction('mqSat', false)
            }) // ,
            // 'extent': mapExtent
          }),
          new ol.layer.Tile({
            'title': 'Streets',
            'id': 'mqOsm',
            'type': 'base',
            'visible': true, // default visible layer
            'source': new ol.source.OSM({
              'tileLoadFunction': tileLoadFunction('mqOsm', false)
            }) // ,
            // 'extent': mapExtent
          })
        ]
      });
    }

    function setOfflineOverlayLayer() {
      offlineOverlayLayer = new ol.layer.Group({
        'name': 'offlineOverlayLayer',
        'title': 'Overlays (offline)',
        'layers': [
          new ol.layer.Tile({
            'title': 'Geologic (z4-12)',
            'id': 'macrostratGeologic',
            'type': 'overlay',
            'opacity': 0.5,
            'visible': false,
            'source': new ol.source.OSM({
              'tileLoadFunction': tileLoadFunction('macrostratGeologic', true)
            })
          })
        ]
      });
    }

    // online map layer of all possible online map providers
    function setOnlineLayer() {
      onlineLayer = new ol.layer.Group({
        'name': 'onlineLayer',
        'title': 'Online Maps',
        'layers': [
          new ol.layer.Tile({
            'title': 'Satellite',
            'id': 'mqSat',
            'type': 'base',
            'visible': false,
            'source': new ol.source.MapQuest({
              'layer': 'sat'
            }) // ,
            // 'extent': mapExtent
          }),
          new ol.layer.Tile({
            'title': 'Streets',
            'id': 'mqOsm',
            'type': 'base',
            'visible': true, // default visible layer
            'source': new ol.source.MapQuest({
              'layer': 'osm'
            })
            // ,
            // extent: mapExtent
          })
        ]
      });
    }

    function setOnlineOverlayLayer() {
      onlineOverlayLayer = new ol.layer.Group({
        'name': 'onlineOverlayLayer',
        'title': 'Overlays (online)',
        'layers': [
          new ol.layer.Tile({
            'title': 'Geologic (z4-12)',
            'id': 'macrostratGeologic',
            'type': 'overlay',
            'opacity': 0.5,
            'visible': false,
            'source': new ol.source.XYZ({
              'url': 'http://macrostrat.org/tiles/geologic/{z}/{x}/{y}.png'
            })
          })
        ]
      });
    }

    function setGeolocationCenterIconStyle() {
      geolocationCenterIconStyle = new ol.style.Style({
        'image': new ol.style.Icon({
          'anchor': [0.5, 0.5],
          'anchorOrigin': 'top-left',
          'anchorXUnits': 'fraction',
          'anchorYUnits': 'fraction',
          'opacity': 0.75,
          'src': 'img/geolocate-center.png',
          'scale': 0.25
        })
      });
    }

    function setGeolocationHeadingIconStyle() {
      geolocationHeadingIconStyle = function (heading) {
        return new ol.style.Style({
          'image': new ol.style.Icon({
            'anchor': [0.5, 2.1],
            'anchorOrigin': 'top-left',
            'anchorXUnits': 'fraction',
            'anchorYUnits': 'fraction',
            'opacity': 0.75,
            'src': 'img/geolocate-heading.png',
            'rotation': Math.radians(heading),
            'scale': (heading === null) ? 0 : 0.1
          })
        });
      };
    }

    function setGeolocationAccuracyTextStyle() {
      geolocationAccuracyTextStyle = function (text) {
        return new ol.style.Style({
          'text': new ol.style.Text({
            'font': '10px Calibri,sans-serif',
            'text': (text === null) ? '?' : text + 'm',
            'fill': new ol.style.Fill({
              'color': '#000'
            }),
            'stroke': new ol.style.Stroke({
              'color': '#fff',
              'width': 3
            })
          })
        });
      };
    }

    function setGeolocationSpeedTextStyle() {
      geolocationSpeedTextStyle = function (speed) {
        return new ol.style.Style({
          'text': new ol.style.Text({
            'font': '10px Calibri,sans-serif',
            'offsetY': 30,
            'text': (speed === null) ? '' : speed + 'm/s',
            'fill': new ol.style.Fill({
              'color': '#000'
            }),
            'stroke': new ol.style.Stroke({
              'color': '#fff',
              'width': 3
            })
          })
        });
      };
    }

    // tileLoadFunction is used for offline access mode, required by OL3 for specifying how tiles are retrieved
    function tileLoadFunction(mapProvider, isOverlay) {
      return function (imageTile, src) {
        // console.log(mapProvider, isOverlay);
        // console.log(imageTile);
        // console.log(src);

        // the tile we will be loading
        var imgElement = imageTile.getImage();

        // the tile coordinates (x,y,z)
        var imageCoords = imageTile.getTileCoord();

        // y needs to be corrected using (-y - 1)
        var y = (imageCoords[2] * -1) - 1;

        var z = imageCoords[0];
        var x = imageCoords[1];

        var tileId = z + '/' + x + '/' + y;

        // check to see if we have the tile in our offline storage
        OfflineTilesFactory.read(mapProvider, tileId, function (blob) {
          // do we have the image already?
          if (blob !== null) {
            // converts blobs to base64
            var blobToBase64 = function (blob, callback) {
              var reader = new $window.FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function () {
                var base64data = reader.result;
                callback(base64data);
              };
            };

            // yes, lets load the tile into the map
            blobToBase64(blob, function (base64data) {
              imgElement.src = base64data;
            });
          }
          else {
            // no, there is no such image in cache

            // is this a non-overlay tile?  we only show the unavailable tile image for non overlay tiles
            if (!isOverlay) {
              // not an overlay so show the user that the tile is unavailable
              imgElement.src = 'img/offlineTiles/zoom' + z + '.png';
            }
          }
        });
      };
    }

    /**
     * Public Functions
     */
    function getCurrentVisibleLayer(map) {
      // the first element in the layers array is our ol.layer.group that contains all the map tile layers
      var mapTileLayers = map.getLayers().getArray()[0].getLayers().getArray();

      // loop through and get the first layer that is visible
      var mapTileId = _.find(mapTileLayers, function (layer) {
        return layer.getVisible();
      });

      return mapTileId.get('id');
    }

    function getFeatureLayer() {
      return featureLayer;
    }

    function getDrawLayer() {
      return drawLayer;
    }

    function getGeolocationLayer() {
      return geolocationLayer;
    }

    function getOfflineLayer() {
      return offlineLayer;
    }

    function getOfflineOverlayLayer() {
      return offlineOverlayLayer;
    }

    function getOnlineLayer() {
      return onlineLayer;
    }

    function getOnlineOverlayLayer() {
      return onlineOverlayLayer;
    }
  }
}());
