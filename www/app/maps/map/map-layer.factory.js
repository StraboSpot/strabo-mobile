(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapLayerFactory', MapLayerFactory);

  MapLayerFactory.$inject = ['$log', '$window', 'HelpersFactory', 'OfflineTilesFactory', 'MapFactory'];

  function MapLayerFactory($log, $window, HelpersFactory, OfflineTilesFactory, MapFactory) {
    var baselayers = {};
    var drawLayer = {};
    var featureLayer = {};
    var datasetsLayer = {};
    var geolocationLayer = {};
    var overlays = {};
    var visibleLayers = {};

    // Geolocation Layer Styles
    var geolocationCenterIconStyle;
    var geolocationHeadingIconStyle;
    var geolocationAccuracyTextStyle;
    var geolocationSpeedTextStyle;

    activate();

    return {
      'getBaselayers': getBaselayers,
      'getDatasetsLayer': getDatasetsLayer,
      'getDrawLayer': getDrawLayer,
      'getFeatureLayer': getFeatureLayer,
      'getGeolocationLayer': getGeolocationLayer,
      'getOverlays': getOverlays,
      'getVisibleLayers': getVisibleLayers,
      'setVisibleBaselayer': setVisibleBaselayer,
      'saveVisibleLayers': saveVisibleLayers,
      'setVisibleLayers': setVisibleLayers,
      'switchTileLayers': switchTileLayers
    };

    /**
     * Private Functions
     */

    function activate() {
      // Initialize Layers
      setBaselayers();
      setOverlays();
      setDrawLayer();
      setFeatureLayer();
      setDatasetsLayer();
      setGeolocationLayer();

      // Initialize Geolocation Layer Styles
      setGeolocationCenterIconStyle();
      setGeolocationHeadingIconStyle();
      setGeolocationAccuracyTextStyle();
      setGeolocationSpeedTextStyle();
    }

    function setBaselayers() {
      baselayers = new ol.layer.Group({
        'name': 'baselayers',
        'title': 'Baselayers'
      });
    }

    function setDatasetsLayer() {
      datasetsLayer = new ol.layer.Group({
        'name': 'datasetsLayer',
        'title': 'Datasets',
        'layers': []
      });
    }

    // vector layer where we house all the geojson spot objects
    function setFeatureLayer() {
      featureLayer = new ol.layer.Group({
        'name': 'featureLayer',
        'title': 'Spots',
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
            'rotation': HelpersFactory.toRadians(heading),
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

    function setOfflineSource(layer) {
      if (!layer.source) return new ol.source.XYZ({'url': ''});  // No basemap layer
      return new ol.source.OSM({'tileLoadFunction': tileLoadFunction(layer.id)});
    }

    function setOnlineSource(layer) {
      switch (layer.source) {
        case 'osm':
          return new ol.source.OSM({'layer': 'osm'});
          break;
        case 'mapbox_classic':
        case 'mapbox_styles':
          return new ol.source.XYZ({'url': layer.basePath + layer.id + layer.tilePath + '?access_token=' + layer.key});
          break;
        case 'map_warper':
          return new ol.source.XYZ({'url': layer.basePath + layer.id + layer.tilePath});
          break;
        default:
          return new ol.source.XYZ({'url': ''});  // No basemap layer
      }
    }

    function setOverlays() {
      overlays = new ol.layer.Group({
        'name': 'overlays',
        'title': 'Overlays'
      });
    }

    function setTileLayers(layers, isOnline) {
      _.each(layers, function (layer) {
        var newMapLayer = new ol.layer.Tile();
        newMapLayer.setProperties({
          'title': layer.title,
          'id': layer.id,
          'type': layer.overlay ? 'overlay' : 'base',
          'source': isOnline ? setOnlineSource(layer) : setOfflineSource(layer),
          'opacity': layer.opacity ? layer.opacity : 1
        });

        // Set Attribution
        if (layer.attributions) newMapLayer.getSource().setAttributions(layer.attributions);
        else newMapLayer.getSource().setAttributions([new ol.Attribution({'html': ''})]);

        if (layer.overlay) overlays.getLayers().push(newMapLayer);
        else baselayers.getLayers().push(newMapLayer);
      });
    }

    // tileLoadFunction is used for offline access mode, required by OL3 for specifying how tiles are retrieved
    function tileLoadFunction(mapProvider) {
      return function (imageTile) {
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
            imgElement.src = 'img/offlineTiles/zoom' + z + '.png';
          }
        });
      };
    }

    /**
     * Public Functions
     */

    function getBaselayers() {
      return baselayers;
    }

    function getDatasetsLayer() {
      return datasetsLayer;
    }

    function getDrawLayer() {
      return drawLayer;
    }

    function getFeatureLayer() {
      return featureLayer;
    }

    function getGeolocationLayer() {
      return geolocationLayer;
    }

    function getOverlays() {
      return overlays;
    }

    function getVisibleLayers() {
      return visibleLayers;
    }

    function saveVisibleLayers(map) {
      visibleLayers = {};
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'baselayers') {
          layer.getLayers().forEach(function (sublayer) {
            if (sublayer.getVisible()) visibleLayers['baselayer'] = sublayer;
          });
        }
        else if (layer.get('name') === 'overlays') {
          layer.getLayers().forEach(function (sublayer) {
            if (sublayer.getVisible()) {
              if (!visibleLayers['overlays']) visibleLayers['overlays'] = [];
              visibleLayers['overlays'].push(sublayer);
            }
          });
        }
      });
    }

    function setVisibleBaselayer(mapId) {
      baselayers.getLayersArray().forEach(function (baselayer) {
        if (baselayer.get('id') === mapId) visibleLayers['baselayer'] = baselayer;
      });
    }

    function setVisibleLayers(map) {
      var defaultBaselayerId = 'osm';
      var isVisibleBaselayerSet = false;
      var visibleBaselayerId = visibleLayers['baselayer'] ? visibleLayers['baselayer'].get('id') : defaultBaselayerId;
      var visibleOverlaysIds = _.map(visibleLayers['overlays'], function (visibleLayer) {
        return visibleLayer.get('id');
      });

      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'baselayers') {
          layer.getLayers().forEach(function (sublayer) {
            if (sublayer.get('id') === defaultBaselayerId && !isVisibleBaselayerSet) sublayer.set('visible', true);
            else if (sublayer.get('id') === visibleBaselayerId) {
              sublayer.set('visible', true);
              isVisibleBaselayerSet = true;
            }
            else sublayer.set('visible', false);
          });
        }
        else if (layer.get('name') === 'overlays') {
          layer.getLayers().forEach(function (sublayer) {
            if (_.contains(visibleOverlaysIds, sublayer.get('id'))) sublayer.set('visible', true);
            else sublayer.set('visible', false);
          });
        }
      });
    }

    function switchTileLayers(map, isOnline) {
      map.removeLayer(baselayers);
      map.removeLayer(overlays);
      setBaselayers(); // reset
      setOverlays(); // reset

      setTileLayers(MapFactory.getMaps(), isOnline);
      if (overlays.getLayers().getLength() > 0) map.getLayers().insertAt(0, overlays);
      map.getLayers().insertAt(0, baselayers);
    }
  }
}());
