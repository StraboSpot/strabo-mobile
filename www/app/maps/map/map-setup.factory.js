(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapSetupFactory', MapSetupFactory);

  MapSetupFactory.$inject = ['$log', '$q', 'ImageFactory', 'MapDrawFactory', 'MapFactory', 'MapLayerFactory',
    'MapViewFactory', 'ProjectFactory', 'SpotFactory', 'IS_WEB'];

  function MapSetupFactory($log, $q, ImageFactory, MapDrawFactory, MapFactory, MapLayerFactory, MapViewFactory,
                           ProjectFactory, SpotFactory, IS_WEB) {
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
      'setOtherLayers': setOtherLayers,
      'setMap': setMap,
      'setMapControls': setMapControls,
      'setPopupOverlay': setPopupOverlay
    };

    /**
     * Private Functions
     */

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


    function setImageBasemapLayers(im) {
      imageBasemap = im;
      var imageBasemaps = [im];
      var linkedImagesIds = ProjectFactory.getLinkedImages(im.id);
      if (!linkedImagesIds) $log.log('No linked images.');
      else {
        _.each(linkedImagesIds, function (linkedImageId) {
          if (linkedImageId !== im.id) {
            var linkedImage = SpotFactory.getImagePropertiesById(linkedImageId);
            if (linkedImage.annotated && linkedImage.annotated === true) imageBasemaps.push(linkedImage);
          }
        });
        $log.log('Found linked images:', imageBasemaps);
      }

      var imageBasemapLayers = new ol.layer.Group({
        'name': 'imageBasemapLayer',
        'title': 'Image Basemaps'
      });

      var promises = [];
      _.each(imageBasemaps, function (imageBasemap) {
        var promise = ImageFactory.getImageById(imageBasemap.id).then(function (src) {
          if (IS_WEB) src = 'https://strabospot.org/pi/' + imageBasemap.id;
          else if (!src) src = 'img/image-not-found.png';
          if (!imageBasemap.height || !imageBasemap.width) {
            var tempIm = new Image();
            tempIm.src = src;
            imageBasemap.height = tempIm.height;
            imageBasemap.width = tempIm.width;
          }
          var extent = [0, 0, imageBasemap.width, imageBasemap.height];
          var imageBasemapLayer = new ol.layer.Image({
            'title': imageBasemap.title || 'Untitled',
            'id': imageBasemap.id,
            'type': 'base',
            'visible': imageBasemap.id === im.id,
            'source': new ol.source.ImageStatic({
              'attributions': [
                new ol.Attribution({
                  'html': imageBasemap.image_source || 'Unknown Source'
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
          imageBasemapLayers.getLayers().push(imageBasemapLayer);
        });
        promises.push(promise);
      });
      return $q.all(promises).then(function () {
        map.getLayers().insertAt(0, imageBasemapLayers);
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

    function setOtherLayers() {
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
