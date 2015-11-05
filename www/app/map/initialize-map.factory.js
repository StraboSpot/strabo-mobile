(function () {
  'use strict';

  angular
    .module('app')
    .factory('InitializeMapFactory', InitializeMapFactory);

  InitializeMapFactory.$inject = ['DrawFactory', 'MapLayerFactory'];

  function InitializeMapFactory(DrawFactory, MapLayerFactory) {
    // Map Properties
    var map;
    var extent;
    var imageMap;
    var initialMapView;
    var projection;

    // Map Layers
    var drawLayer;
    var featureLayer;
    var geolocationLayer;
    var offlineLayer;
    var offlineOverlayLayer;
    var onlineLayer;
    var onlineOverlayLayer;

    // Popup Overlay
    var popup;

    return {
      'getInitialMapView': getInitialMapView,
      'getLayers': getLayers,
      'getMap': getMap,
      'getPopupOverlay': getPopupOverlay,

      'setImageMap': setImageMap,
      'setInitialMapView': setInitialMapView,
      'setLayers': setLayers,
      'setMap': setMap,
      'setMapControls': setMapControls,
      'setPopupOverlay': setPopupOverlay
    };

    function getInitialMapView() {
      return initialMapView;
    }

    function getLayers() {
      return {
        'featureLayer': featureLayer,
        'drawLayer': drawLayer,
        'geolocationLayer': geolocationLayer,
        'offlineLayer': offlineLayer,
        'offlineOverlayLayer': offlineOverlayLayer,
        'onlineLayer': onlineLayer,
        'onlineOverlayLayer': onlineOverlayLayer
      };
    }

    function getMap() {
      return map;
    }

    function getPopupOverlay() {
      return popup;
    }

    function setLayers() {
      if (!imageMap) {
        geolocationLayer = MapLayerFactory.getGeolocationLayer();
        map.addLayer(geolocationLayer);

        offlineLayer = MapLayerFactory.getOfflineLayer();
        offlineOverlayLayer = MapLayerFactory.getOfflineOverlayLayer();
        onlineLayer = MapLayerFactory.getOnlineLayer();
        onlineOverlayLayer = MapLayerFactory.getOnlineOverlayLayer();
      }
      else {
        var imageMapLayer = new ol.layer.Image({
          'source': new ol.source.ImageStatic({
            'attributions': [
              new ol.Attribution({
                'html': '&copy; <a href="">Need image source here.</a>'
              })
            ],
            'url': imageMap.src,
            'projection': projection,
            'imageExtent': extent
          })
        });
        map.addLayer(imageMapLayer);
      }

      featureLayer = MapLayerFactory.getFeatureLayer();
      drawLayer = MapLayerFactory.getDrawLayer();

      map.addLayer(featureLayer);
      map.addLayer(drawLayer);
    }

    function setImageMap(im) {
      imageMap = im;
    }

    function setInitialMapView() {
      var zoom;
      var center;

      if (!imageMap) {
        projection = 'EPSG:3857';
        center = [-11000000, 4600000];
        zoom = 4;
      }
      else {
        extent = [0, 0, imageMap.width, imageMap.height];
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

    function setMap() {
      map = new ol.Map({
        'target': 'mapdiv',
        'view': initialMapView,
        // turn off ability to rotate map via keyboard+mouse and using fingers on a mobile device
        'controls': ol.control.defaults({
          'rotate': false
        }),
        'interactions': ol.interaction.defaults({
          'altShiftDragRotate': false,
          'pinchRotate': false
        })
      });
    }

    function setMapControls() {
      var drawControlProps = {
        'map': map,
        'drawLayer': drawLayer,
        'imageMap': imageMap      // null if not using an image map
      };

      if (!imageMap) {
        map.addControl(new ol.control.ScaleLine());
      }

      ol.inherits(DrawFactory.DrawControls, ol.control.Control);
      map.addControl(new DrawFactory.DrawControls(drawControlProps));
      map.addControl(new ol.control.LayerSwitcher());
    }

    function setPopupOverlay() {
      popup = new ol.Overlay.Popup();
      map.addOverlay(popup);
    }
  }
}());
