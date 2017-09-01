(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapLayerFactory', MapLayerFactory);

  MapLayerFactory.$inject = ['$log', '$q', '$window', 'HelpersFactory', 'OfflineTilesFactory', 'MapFactory'];

  function MapLayerFactory($log, $q, $window, HelpersFactory, OfflineTilesFactory, MapFactory) {
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

    // Check for parent tile to use to make overzoomed child tile
    function checkNextTile(mapProvider, imgElement, x, y, z, d, row, col) {
      var newX = (x - row) / d;
      var newY = (y - col) / d;
      var tileId = z + '/' + newX + '/' + newY;
      if (Number.isInteger(newX) && Number.isInteger(newY)) {
        getTile(mapProvider, tileId).then(function (blob) {
          //$log.log('Found tile:', tileId, 'to overzoom at', row, col, ' Loading ...');
          loadTile(blob, imgElement).then(function () {
            modifyTileImg(imgElement, d, row, col);
          });
        }, function () {
          handleTileNotFound(mapProvider, imgElement, x, y, z, d, row, col)
        });
      }
      else handleTileNotFound(mapProvider, imgElement, x, y, z, d, row, col);
    }

    // Check if there's a parent tile to use to make overzoomed child tile
    function getSubstituteTile(mapProvider, imgElement, x, y, z, d) {
      var row = 0;
      var col = 0;
      checkNextTile(mapProvider, imgElement, x, y, z, d, row, col);
    }

    // Get the tile from local storage
    function getTile(mapProvider, tileId) {
      var deferred = $q.defer(); // init promise
      //$log.log('Looking for tile:', tileId);
      OfflineTilesFactory.read(mapProvider, tileId, function (blob) {
        if (blob !== null) deferred.resolve(blob);  // Tile found in local storage
        else deferred.reject();                     // Tile not found in local storage
      });
      return deferred.promise;
    }

    // Tile to overzoom not found so either check the next tile in the matrix, go out a zoom level or stop
    function handleTileNotFound(mapProvider, imgElement, x, y, z, d, row, col) {
      // If checked all parent tiles for a tile to overzoom and no match go out another zoom level
      if (row === col && row === d - 1) {
        if (d < 32) getSubstituteTile(mapProvider, imgElement, x, y, z - 1, d * 2);
        // Image to overzoom not found within 5 zoom levels (d = 32 = 5 zoom levels)
        //else imgElement.src = 'img/offlineTiles/zoom' + (z + Math.log2(d)) + '.png';
      }
      else {
        if (col < d - 1) col++; // Next column
        else {
          row++;                // Next row
          col = 0;              // Start columns over
        }
        checkNextTile(mapProvider, imgElement, x, y, z, d, row, col);
      }
    }

    // Convert tile from blob to base 64 and set as image source
    function loadTile(blob, imgElement) {
      return HelpersFactory.blobToBase64(blob).then(function (base64data) {
        imgElement.src = base64data;
      });
    }

    // Overzoom the tile at row, column
    function modifyTileImg(imgElement, d, row, col) {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext('2d');
      canvas.width = canvas.height = 256;
      var image = new Image();
      image.src = imgElement.src;
      //DrawImage params: img, clip x, clip y, clip width, clip height, canvas x, canvas y, canvas width, canvas height;
      context.drawImage(image, (256 / d) * row, (256 / d) * col, 256 / d, 256 / d, 0, 0, 256, 256);
      var dataUrl = canvas.toDataURL('image/jpeg');
      imgElement.src = dataUrl;
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
        var imgElement = imageTile.getImage();        // the tile we will be loading

        /* ToDo: What is going on with get the image coords? x is returning a negative number for low zooms (0-2)
        /*var imageCoords = imageTile.getTileCoord();   // the tile coordinates (x,y,z)
        var y = (imageCoords[2] * -1) - 1;            // y needs to be corrected using (-y - 1)
        var z = imageCoords[0];
        var x = imageCoords[1];*/

        // Switched to this method to get x, y, z since above method having trouble at low zooms
        var regex = /\/(\d*)\/(\d*)\/(\d*)\.png/g;
        var match = regex.exec(imageTile.src_);
        var z = match[1];
        var x = match[2];
        var y = match[3];

        var tileId = z + '/' + x + '/' + y;
        imgElement.id = tileId;
        getTile(mapProvider, tileId).then(function (blob) {
          //$log.log('Found original tile:', tileId, 'Loading ...');
          loadTile(blob, imgElement);
        }, function () {
          getSubstituteTile(mapProvider, imgElement, x, y, z - 1, 2);
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
