(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapSetupFactory', MapSetupFactory);

  MapSetupFactory.$inject = ['ImageFactory', 'MapDrawFactory', 'MapFactory', 'MapLayerFactory', 'MapViewFactory', 'IS_WEB'];

  function MapSetupFactory(ImageFactory, MapDrawFactory, MapFactory, MapLayerFactory, MapViewFactory, IS_WEB) {
    var map;
    var imageBasemap;
    var initialMapView;
    var popup;

    return {
      'getInitialMapView': getInitialMapView,
      'getMap': getMap,
      'getPopupOverlay': getPopupOverlay,
      'setImageBasemapLayers': setImageBasemapLayers,
      'setLayers': setLayers,
      'setMap': setMap,
      'setMapControls': setMapControls,
      'setPopupOverlay': setPopupOverlay
    };

    /**
     * Public Functions
     */

    function getInitialMapView() {
      return initialMapView;
    }

    function getMap() {
      return map;
    }

    function getPopupOverlay() {
      return popup;
    }

    function setVisibleLayer(layers) {
      var visibleLayer = MapLayerFactory.getVisibleLayer();
      var visibleMapId;
      if (!visibleLayer) visibleMapId = 'osm';
      else visibleMapId = visibleLayer.get('id');

      layers.getLayers().forEach(function (layer) {
        if (layer.get('id') === visibleMapId) layer.set('visible', true);
        else layer.set('visible', false);
      });
    }

    function setImageBasemapLayers(im) {
      imageBasemap = im;
      return ImageFactory.getImageById(imageBasemap.id).then(function (src) {
        if(IS_WEB){
          src = 'https://strabospot.org/pi/' + imageBasemap.id;
        }else if(!src) {
          src = 'img/image-not-found.png';
        }
        var extent = [0, 0, imageBasemap.width, imageBasemap.height];
        var imageBasemapLayer = new ol.layer.Image({
          'source': new ol.source.ImageStatic({
            'attributions': [
              new ol.Attribution({
                'html': '&copy; <a href="">Need image source here.</a>'
              })
            ],
            'url': src,
            'projection': new ol.proj.Projection({
              'code': 'map-image',
              'units': 'pixels',
              'extent': extent
            }),
            'imageExtent': extent
          })
        });
        map.addLayer(imageBasemapLayer);
        map.addLayer(MapLayerFactory.getDatasetsLayer());
        map.addLayer(MapLayerFactory.getFeatureLayer());
        map.addLayer(MapLayerFactory.getDrawLayer());
      });
    }

    function setLayers() {
      imageBasemap = undefined;
      MapFactory.setMaps();
      MapLayerFactory.setOnlineLayers();
      MapLayerFactory.setOfflineLayers();
      setVisibleLayer(MapLayerFactory.getOnlineLayers());
      setVisibleLayer(MapLayerFactory.getOfflineLayers());

      map.addLayer(MapLayerFactory.getGeolocationLayer());
      map.addLayer(MapLayerFactory.getDatasetsLayer());
      map.addLayer(MapLayerFactory.getFeatureLayer());
      map.addLayer(MapLayerFactory.getDrawLayer());
    }

    function setMap() {
      map = new ol.Map({
        'target': 'mapdiv',
        'view': MapViewFactory.getInitialMapView(),
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

    function setMapControls(switcher) {
      var drawControlProps = {
        'map': map,
        'drawLayer': MapLayerFactory.getDrawLayer(),
        'imageBasemap': imageBasemap      // null if not using an image basemap
      };

      if (!imageBasemap) map.addControl(new ol.control.ScaleLine());

      ol.inherits(MapDrawFactory.DrawControls, ol.control.Control);
      map.addControl(new MapDrawFactory.DrawControls(drawControlProps));
      map.addControl(switcher);
    }

    function setPopupOverlay() {
      popup = new ol.Overlay.Popup();
      map.addOverlay(popup);
    }
  }
}());
