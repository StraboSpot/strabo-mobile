(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapLayerFactory', MapLayerFactory);

  MapLayerFactory.$inject = ['$log', '$q', '$window', 'HelpersFactory', 'OfflineTilesFactory', 'MapFactory'];

  function MapLayerFactory($log, $q, $window, HelpersFactory, OfflineTilesFactory, MapFactory) {
    var baselayers = {};
    var drawLayer = {};
    var featureLayers = [];
    var datasetsLayer = {};
    var geolocationLayer = {};
    var overlays = {};
    var visibleLayers = {'baselayer': {}, 'overlays': []};

    // Geolocation Layer Styles
    var geolocationCenterIconStyle;
    var geolocationHeadingIconStyle;
    var geolocationAccuracyTextStyle;
    var geolocationSpeedTextStyle;

    return {
      'getBaselayers': getBaselayers,
      'getDatasetsLayer': getDatasetsLayer,
      'getDrawLayer': getDrawLayer,
      'getFeatureLayer': getFeatureLayer,
      'getGeolocationLayer': getGeolocationLayer,
      'getOverlays': getOverlays,
      'getVisibleLayers': getVisibleLayers,
      'initializeLayers': initializeLayers,
      'setVisibleBaselayer': setVisibleBaselayer,
      'switchTileLayers': switchTileLayers
    };

    /**
     * Private Functions
     */

    // Create a map baselayer or overlay
    function createTileLayer(layer, isOnline) {
      $log.log('createTileLayer Layer: ',layer);
      var isVisible = getLayerVisibility(layer);
      var newMapLayer = new ol.layer.Tile();
      newMapLayer.setProperties({
        'title': layer.title,
        'id': layer.id,
        'type': layer.overlay ? 'overlay' : 'base',
        'source': isOnline ? setOnlineSource(layer) : setOfflineSource(layer),
        'opacity': layer.opacity ? layer.opacity : 1,
        'visible': isVisible
      });

      // Update visible baselayer to this layer if this is not an overlay and is visible
      if (!layer.overlay && isVisible) visibleLayers.baselayer = newMapLayer;

      newMapLayer.on('change:visible', function (event) {
        updateLayerVisibility(event, newMapLayer);
      });

      // Set Attribution
      if (layer.attributions) newMapLayer.getSource().setAttributions(layer.attributions);
      else newMapLayer.getSource().setAttributions(' ');

      if (layer.overlay) overlays.getLayers().push(newMapLayer);
      else baselayers.getLayers().push(newMapLayer);
    }

    // Create the map baselayers and overlays
    function createTileLayers(layersProperties, isOnline, map) {
      _.each(layersProperties, function (layerProperties) {
        createTileLayer(layerProperties, isOnline);
      });
      if (overlays.getLayers().getLength() > 0) map.getLayers().insertAt(0, overlays);
      map.getLayers().insertAt(0, baselayers);
    }

    // Get baselayer or overlay visibility
    function getLayerVisibility(layerProperties) {
      var visibleOverlaysIds = _.map(visibleLayers.overlays, function (visibleLayer) {
        return visibleLayer.get('id');
      });

      if (!layerProperties.overlay) {
        if (_.isEmpty(visibleLayers.baselayer)) return true;
        // If there is no set visible baselayer set the first layer to the visible baselayer
        else if (visibleLayers.baselayer.get('id') === layerProperties.id) return true;
      }
      else return layerProperties.overlay && _.contains(visibleOverlaysIds, layerProperties.id);
    }

    //new function for getting next tile up JMA 10/12/2018
    function getNextTileUp(mapProvider, imgElement, x, y, z, numcols, xcol, ycol){
        if(z > 0){

          if(numcols==0) numcols = 1;
          numcols = numcols * 2;
          var newz = z - 1;

          var newx = x;
          var oddx = 0;
          if(newx % 2 == 1){
            oddx = 1;
            newx = newx -1;
          }
          newx = newx / 2;

          var newy = y;
          var oddy = 0;
          if(newy % 2 == 1){
            oddy = 1;
            newy = newy -1;
          }
          newy = newy / 2;

          var newxcol = 0;
          var newycol = 0;

          if(numcols == 1){
            newxcol = oddx;
            newycol = oddy;
          }
          else{
            if(oddx == 1){
              newxcol = (numcols/2) + xcol;
            }
            else{
              newxcol = xcol;
            }
            if(oddy == 1){
              newycol = (numcols/2) + ycol;
            }
            else{
              newycol = ycol;
            }
          }

          var tileId = newz + '/' + newx + '/' + newy;
          getTile(mapProvider, tileId).then(function (blob) {
            loadTile(blob, imgElement).then(function () {
              //the following just limits the image crop
              if(numcols > 256){
                var newcolmult = Math.ceil(numcols / 256);
                numcols = 256;
                newxcol = Math.floor(newxcol/newcolmult);
                newycol = Math.floor(newycol/newcolmult);
              }
              modifyTileImg(imgElement, numcols, newxcol, newycol);
            });
          }, function () {
            getNextTileUp(mapProvider, imgElement, newx, newy, newz, numcols, newxcol, newycol);
          });
        }
    }

    // Get the tile from local storage
    function getTile(mapProvider, tileId) {
      var deferred = $q.defer(); // init promise
      OfflineTilesFactory.read(mapProvider, tileId, function (blob) {
        if (blob !== null) deferred.resolve(blob);  // Tile found in local storage
        else deferred.reject();                     // Tile not found in local storage
      });
      return deferred.promise;
    }

    // Convert tile from blob to base 64 and set as image source
    function loadTile(blob, imgElement) {
      return HelpersFactory.blobToBase64(blob).then(function (base64data) {
        imgElement.src = base64data;
      });
    }

    // Overzoom the tile at row, column
    function modifyTileImg(imgElement, d, row, col) {
      $log.log('modifyTileImg:', imgElement.id, d, row, col);
      var canvas = document.createElement("canvas");
      var context = canvas.getContext('2d');
      canvas.width = canvas.height = 256;
      var image = new Image();
      image.src = imgElement.src;
      image.onload = function () {
        //DrawImage params: img, clip x, clip y, clip width, clip height, canvas x, canvas y, canvas width, canvas height;
        context.drawImage(image, (256 / d) * row, (256 / d) * col, 256 / d, 256 / d, 0, 0, 256, 256);
        imgElement.src = canvas.toDataURL(); //'image/png'
      }
    }

    function setOfflineBaselayers() {
      baselayers = new ol.layer.Group({
        'name': 'baselayers',
        'title': 'Offline Baselayers'
      });
    }

    function setOnlineBaselayers() {
      baselayers = new ol.layer.Group({
        'name': 'baselayers',
        'title': 'Online Baselayers'
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
    function setFeatureLayer(mapName) {
      featureLayers[mapName] = new ol.layer.Group({
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

    function setOfflineOverlays() {
      overlays = new ol.layer.Group({
        'name': 'overlays',
        'title': 'Offline Overlays'
      });
    }

    function setOfflineSource(layer) {
      if (!layer.source) return new ol.source.XYZ({'url': ''});  // No basemap layer
      var maxZoom = 19;
      if(layer.maxZoom) maxZoom = layer.maxZoom;
      return new ol.source.OSM({'tileLoadFunction': tileLoadFunction(layer.mapid),'maxZoom': maxZoom});
    }

    function setOnlineOverlays() {
      overlays = new ol.layer.Group({
        'name': 'overlays',
        'title': 'Online Overlays'
      });
    }

    function setOnlineSource(layer) {
      var url = _.sample(layer.url);
      switch (layer.source) {
        case 'osm':
          return new ol.source.OSM({'layer': 'osm'});
        case 'strabo_spot_mapbox':
        case 'mapbox_classic':
        case 'mapbox_styles':
        case 'macrostrat':
          return new ol.source.XYZ({'url': url + layer.id + layer.tilePath + '?access_token=' + layer.key});
          case 'map_warper':
            return new ol.source.XYZ({'url': url + layer.id + layer.tilePath});
          case 'strabospot_mymaps':
            return new ol.source.XYZ({'url': url + layer.id + layer.tilePath});
        default:
          return new ol.source.XYZ({'url': ''});  // No basemap layer
      }
    }

    // tileLoadFunction is used for offline access mode, required by OL3 for specifying how tiles are retrieved
    function tileLoadFunction(mapProvider) {
      return function (imageTile) {
        var imgElement = imageTile.getImage();        // the tile we will be loading

        var regex = /\/(\d*)\/(\d*)\/(\d*)\.png/g;
        var match = regex.exec(imageTile.src_);
        var z = match[1];
        var x = match[2];
        var y = match[3];

        var tileId = z + '/' + x + '/' + y;
        imgElement.id = tileId;
        getTile(mapProvider, tileId).then(function (blob) {
          loadTile(blob, imgElement);
        }, function () {
          getNextTileUp(mapProvider, imgElement, x, y, z, 0, 0, 0);
        });
      };
    }

    // Update layer visibility after a layer 'change:visible' event
    function updateLayerVisibility(event, layer) {
      var layerProperties = event.target.getProperties();
      //$log.log(layerProperties.id, 'layer visibility changed!', event);
      if (event.target.getVisible()) {
        if (event.target.getProperties().type === 'base') visibleLayers.baselayer = layer;
        if (event.target.getProperties().type === 'overlay') {
          visibleLayers.overlays = _.reject(visibleLayers.overlays, function (overlay) {
            return overlay.getProperties().id === layerProperties.id;
          });
          visibleLayers.overlays.push(layer);
        }
      }
      else {
        if (event.target.getProperties().type === 'overlay') {
          visibleLayers.overlays = _.reject(visibleLayers.overlays, function (overlay) {
            return overlay.getProperties().id === layerProperties.id;
          });
        }
      }
    }

    // Make sure the visible layers are only layers that are offline layers
    function updateVisibleLayersForOffline(mapLayers) {
      var deferred = $q.defer(); // init promise

      $log.log('updateVisibleLayersForOffline: ', mapLayers);

      OfflineTilesFactory.getOfflineMaps().then(function (offlineMaps) {

        $log.log('offlineMaps from updateVisibleLayersForOffline: ', offlineMaps);

        // If the visible baselayer is not an offline layer set visible baselayer to empty
        if (!_.isEmpty(visibleLayers.baselayer) &&
          !_.chain(offlineMaps).pluck('id').compact().contains(visibleLayers.baselayer.get('id')).value()) {
          visibleLayers.baselayer = {};
        }

        // If any of the visible overlays are not offline layers remove those from visible overlays
        if (!_.isEmpty(visibleLayers.overlays)) {
          visibleLayers.overlays = _.filter(visibleLayers.overlays, function (visibleOverlay) {
            return _.chain(offlineMaps).pluck('id').compact().contains(visibleOverlay.get('id')).value();
          });
        }

        var offlineMapLayers = offlineMaps;

        //get mapid to pass to each offline layer
        var returnMaps = [];
        _.each(offlineMapLayers, function(offlineMapLayer){
          _.each(offlineMaps, function(omap){
            if(omap.id == offlineMapLayer.id){
              offlineMapLayer.mapid = omap.mapid;
              returnMaps.push(offlineMapLayer);
            }
          });
        });

        $log.log('returnMaps: ', returnMaps);
        $log.log('update visible offLineMapLayers: ', offlineMapLayers);
        deferred.resolve(offlineMapLayers);
      });
      return deferred.promise;
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

    function getFeatureLayer(mapName) {
      mapName = mapName ? mapName : 'default';
      return featureLayers[mapName];
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

    function initializeLayers(mapName) {
      // Initialize Layers
      setOnlineBaselayers();
      setOnlineOverlays();
      setDrawLayer();
      setFeatureLayer(mapName);
      setDatasetsLayer();
      setGeolocationLayer();

      // Initialize Geolocation Layer Styles
      setGeolocationCenterIconStyle();
      setGeolocationHeadingIconStyle();
      setGeolocationAccuracyTextStyle();
      setGeolocationSpeedTextStyle();
    }

    function setVisibleBaselayer(mapId) {
      baselayers.getLayersArray().forEach(function (baselayer) {
        if (baselayer.get('id') === mapId) visibleLayers.baselayer = baselayer;
      });
    }

    // Switch layers between online and offline
    function switchTileLayers(map, isOnline) {
      $log.log('Switch Tile Layers, isOnline:', isOnline);
      map.removeLayer(baselayers);
      map.removeLayer(overlays);
      if (isOnline) {
        setOnlineBaselayers(); // reset
        setOnlineOverlays(); // reset
        createTileLayers(MapFactory.getMaps(), isOnline, map);
      }
      else {
        setOfflineBaselayers(); // reset
        setOfflineOverlays(); // reset
        updateVisibleLayersForOffline(MapFactory.getMaps()).then(function (offlineLayersProperties) {
          createTileLayers(offlineLayersProperties, isOnline, map);
        });
      }
    }
  }
}());
