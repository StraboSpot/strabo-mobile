(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapSetupFactory', MapSetupFactory);

  MapSetupFactory.$inject = ['MapDrawFactory', 'MapLayerFactory'];

  function MapSetupFactory(MapDrawFactory, MapLayerFactory) {
    // Map Properties
    var map;
    var extent;
    var imageBasemap;
    var initialMapView;
    var projection;

    // Popup Overlay
    var popup;

    return {
      'getInitialMapView': getInitialMapView,
      'getMap': getMap,
      'getPopupOverlay': getPopupOverlay,

      'setImageBasemap': setImageBasemap,
      'setInitialMapView': setInitialMapView,
      'setLayers': setLayers,
      'setMap': setMap,
      'setMapControls': setMapControls,
      'setPopupOverlay': setPopupOverlay
    };

    function getInitialMapView() {
      return initialMapView;
    }

    function getMap() {
      return map;
    }

    function getPopupOverlay() {
      return popup;
    }

    function setLayers() {
      if (!imageBasemap) {
        map.addLayer(MapLayerFactory.getGeolocationLayer());
      }
      else {
        var imageBasemapLayer = new ol.layer.Image({
          'source': new ol.source.ImageStatic({
            'attributions': [
              new ol.Attribution({
                'html': '&copy; <a href="">Need image source here.</a>'
              })
            ],
            'url': imageBasemap.src,
            'projection': projection,
            'imageExtent': extent
          })
        });
        map.addLayer(imageBasemapLayer);
      }

      map.addLayer(MapLayerFactory.getFeatureLayer());
      map.addLayer(MapLayerFactory.getDrawLayer());
    }

    function setImageBasemap(im) {
      imageBasemap = im;
    }

    function setInitialMapView() {
      var zoom;
      var center;

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
        'drawLayer': MapLayerFactory.getDrawLayer(),
        'imageBasemap': imageBasemap      // null if not using an image basemap
      };

      if (!imageBasemap) {
        map.addControl(new ol.control.ScaleLine());
      }

      ol.inherits(MapDrawFactory.DrawControls, ol.control.Control);
      map.addControl(new MapDrawFactory.DrawControls(drawControlProps));
      map.addControl(new ol.control.LayerSwitcher());
    }

    function setPopupOverlay() {
      popup = new ol.Overlay.Popup();
      map.addOverlay(popup);
    }
  }
}());
