(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapLayerFactory', MapLayerFactory);

  MapLayerFactory.$inject = ['$window', 'HelpersFactory', 'OfflineTilesFactory', 'MapFactory'];

  function MapLayerFactory($window, HelpersFactory, OfflineTilesFactory, MapFactory) {
    var drawLayer;
    var featureLayer;
    var datasetsLayer;
    var geolocationLayer;
    var offlineLayers;
    var onlineLayers;
    var visibleLayer;

    // Geolocation Layer Styles
    var geolocationCenterIconStyle;
    var geolocationHeadingIconStyle;
    var geolocationAccuracyTextStyle;
    var geolocationSpeedTextStyle;

    activate();

    return {
      'getCurrentVisibleLayer': getCurrentVisibleLayer,
      'getDatasetsLayer': getDatasetsLayer,
      'getDrawLayer': getDrawLayer,
      'getFeatureLayer': getFeatureLayer,
      'getGeolocationLayer': getGeolocationLayer,
      'getOfflineLayers': getOfflineLayers,
      'getOnlineLayers': getOnlineLayers,
      'getVisibleLayer': getVisibleLayer,
      'setOfflineLayers': setOfflineLayers,
      'setOfflineLayersVisible': setOfflineLayersVisible,
      'setOnlineLayers': setOnlineLayers,
      'setOnlineLayersVisible': setOnlineLayersVisible,
      'setVisibleLayer': setVisibleLayer
    };

    /**
     * Private Functions
     */

    function activate() {
      // Initialize Layers
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

    // Create map basemap layers
    function setLayers(layers, isOnline) {
      _.each(layers, function (layer) {
        var newMapLayer = new ol.layer.Tile();
        newMapLayer.setProperties({
          'title': layer.title,
          'id': layer.id,
          'type': 'base'
        });

        // Set Source
        var sourceUrl = '';
        if (!isOnline && layer.source) {
          newMapLayer.setSource(
            new ol.source.OSM({
              'tileLoadFunction': tileLoadFunction(layer.id)
            }));
        }
        else if (layer.source === 'osm') newMapLayer.setSource(new ol.source.OSM({'layer': 'osm'}));
        else if (layer.source === 'mapbox_classic') {
          sourceUrl = layer.basePath + layer.id + '/{z}/{x}/{y}.png?access_token=' + layer.key;
        }
        else if (layer.source === 'mapbox_styles') {
          sourceUrl = layer.basePath + layer.id + '/tiles/256/{z}/{x}/{y}?access_token=' + layer.key;
        }
        else if (layer.source === 'map_warper') {
          sourceUrl = layer.basePath + layer.id + '/{z}/{x}/{y}.png';
        }
        if (!newMapLayer.getSource()) {
          newMapLayer.setSource(
            new ol.source.XYZ({
              'url': sourceUrl
            }));
        }

        // Set Attribution
        if (layer.attributions) {
          newMapLayer.getSource().setAttributions(
            layer.attributions);
        }
        else {
          newMapLayer.getSource().setAttributions([
            new ol.Attribution({'html': ''})
          ]);
        }
        if (isOnline) onlineLayers.getLayers().push(newMapLayer);
        else offlineLayers.getLayers().push(newMapLayer);
      });
    }

    function setVisibleLayerDefault(map) {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'onlineLayer' || layer.get('name') === 'offlineLayer') {
          layer.getLayers().forEach(function (mapLayer) {
            if (mapLayer.get('id') === 'osm') {
              visibleLayer = mapLayer;
              visibleLayer.setVisible(true);
            }
          });
        }
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

    function getCurrentVisibleLayer(map) {
      var visibleMap;
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'onlineLayer' || layer.get('name') === 'offlineLayer') {
          layer.getLayers().forEach(function (mapLayer) {
            if (mapLayer.getVisible()) visibleMap = mapLayer.get('id');
          });
        }
      });
      return visibleMap;
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

    function getOfflineLayers() {
      return offlineLayers;
    }

    function getOnlineLayers() {
      return onlineLayers;
    }

    function getVisibleLayer() {
      return visibleLayer;
    }

    function setOfflineLayers() {
      offlineLayers = new ol.layer.Group({
        'name': 'offlineLayer',
        'title': 'Offline Maps'
      });
      setLayers(MapFactory.getMaps(), false);
    }

    function setOfflineLayersVisible(map) {
      map.removeLayer(onlineLayers);
      map.getLayers().insertAt(0, offlineLayers);
    }

    function setOnlineLayers() {
      onlineLayers = new ol.layer.Group({
        'name': 'onlineLayer',
        'title': 'Online Maps'
      });
      setLayers(MapFactory.getMaps(), true);
    }

    function setOnlineLayersVisible(map) {
      map.removeLayer(offlineLayers);
      map.getLayers().insertAt(0, onlineLayers);
    }

    function setVisibleLayer(map) {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'onlineLayer' || layer.get('name') === 'offlineLayer') {
          layer.getLayers().forEach(function (mapLayer) {
            if (mapLayer.getVisible()) visibleLayer = mapLayer;
          });
        }
      });
      if (!visibleLayer) setVisibleLayerDefault(map);
    }
  }
}());
