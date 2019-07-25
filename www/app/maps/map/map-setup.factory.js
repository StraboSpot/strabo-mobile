(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapSetupFactory', MapSetupFactory);

  MapSetupFactory.$inject = ['$log', '$q', 'ImageFactory', 'MapDrawFactory', 'MapEmogeosFactory', 'MapFactory',
    'MapLayerFactory', 'MapViewFactory', 'ProjectFactory', 'SpotFactory', 'IS_WEB'];

  function MapSetupFactory($log, $q, ImageFactory, MapDrawFactory, MapEmogeosFactory, MapFactory, MapLayerFactory,
                           MapViewFactory, ProjectFactory, SpotFactory, IS_WEB) {
    var imageBasemap;
    var initialMapView;
    var maps = {};
    var popup;
    var stratSectionId;

    return {
      'getInitialMapView': getInitialMapView,
      'getMap': getMap,
      'getPopupOverlay': getPopupOverlay,
      'setImageBasemapLayers': setImageBasemapLayers,
      'setImageOverlays': setImageOverlays,
      'setLayers': setLayers,
      'setOtherLayers': setOtherLayers,
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

    function getMap(mapName) {
      return mapName ? maps[mapName] : maps['default'];
    }

    function getPopupOverlay() {
      return popup;
    }

    function setImageBasemapLayers(im, mapName) {
      var map = mapName ? maps[mapName] : maps['default'];
      imageBasemap = im;
      stratSectionId = null;
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
              'attributions': imageBasemap.image_source || 'Unknown Source',
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

    function setImageOverlays(spot) {
      var map = maps['default'];
      stratSectionId = spot.properties.sed.strat_section.strat_section_id;
      imageBasemap = null;
      if (_.isEmpty(spot.properties.sed.strat_section.images)) return $q.when(null);

      var imageOverlayLayers = new ol.layer.Group({
        'name': 'imageOverlaysLayer',
        'title': 'Image Overlays'
      });

      var promises = [];
      _.each(spot.properties.sed.strat_section.images, function (imageOverlay) {
        var promise = ImageFactory.getImageById(imageOverlay.id).then(function (src) {
          if (IS_WEB) src = 'https://strabospot.org/pi/' + imageOverlay.id;
          else if (!src) src = 'img/image-not-found.png';
          var image = _.find(spot.properties.images, function (image) {
            return image.id === imageOverlay.id;
          });
          if (!image.height || !image.width) {
            var tempIm = new Image();
            tempIm.src = src;
            image.height = tempIm.height;
            image.width = tempIm.width;
          }

          var x = imageOverlay.image_origin_x || 0;
          var y = imageOverlay.image_origin_y || 0;
          var width = imageOverlay.image_width || image.width;
          var height = imageOverlay.image_height || image.height;
          var extent = [x, y, width + x, height + y];
          var imageOverlayLayer = new ol.layer.Image({
            'title': image.title || 'Untitled',
            'id': imageOverlay.id,
            'type': 'overlay',
            'opacity': imageOverlay.image_opacity || 1,
            'zIndex': imageOverlay.z_index || 0,
            'source': new ol.source.ImageStatic({
              'attributions': imageOverlay.image_source || 'Unknown Source',
              'url': src,
              'projection': new ol.proj.Projection({
                'code': 'map-image',
                'units': 'pixels',
                'extent': extent
              }),
              'imageExtent': extent
            })
          });
          imageOverlayLayers.getLayers().push(imageOverlayLayer);
        });
        promises.push(promise);
      });
      return $q.all(promises).then(function () {
        map.getLayers().insertAt(0, imageOverlayLayers);
      });
    }

    function setLayers() {
      var mapName = 'default';
      var map = maps[mapName];
      stratSectionId = null;
      imageBasemap = null;
      MapFactory.setMaps();
      MapLayerFactory.initializeLayers(mapName);
      map.addLayer(MapLayerFactory.getBaselayers());
      map.addLayer(MapLayerFactory.getOverlays());
      map.addLayer(MapLayerFactory.getGeolocationLayer());
      map.addLayer(MapLayerFactory.getDatasetsLayer());
      map.addLayer(MapLayerFactory.getFeatureLayer(mapName));
      map.addLayer(MapLayerFactory.getDrawLayer());
    }

    function setOtherLayers(mapName) {
      mapName = mapName ? mapName : 'default';
      var map = maps[mapName];
      MapLayerFactory.initializeLayers(mapName);
      map.addLayer(MapLayerFactory.getDatasetsLayer());
      map.addLayer(MapLayerFactory.getFeatureLayer(mapName));
      map.addLayer(MapLayerFactory.getEmogeoLayer());
      map.addLayer(MapLayerFactory.getDrawLayer());
    }

    function setMap(mapName) {
      var map = new ol.Map({
        'target': mapName ? mapName : 'mapdiv',
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
      mapName = mapName ? mapName : 'default';
      maps[mapName] = map;
    }

    function setMapControls(switcher, mapName) {
      var map = mapName ? maps[mapName] : maps['default'];
      var drawControlProps = {
        'map': map,
        'drawLayer': MapLayerFactory.getDrawLayer()
      };

      if (map.getView().getProjection().getUnits() !== 'pixels') map.addControl(new ol.control.ScaleLine());

      ol.inherits(MapDrawFactory.DrawControls, ol.control.Control);
      map.addControl(new MapDrawFactory.DrawControls(drawControlProps));
      if (stratSectionId) {
        ol.inherits(MapEmogeosFactory.EmogeoControls, ol.control.Control);
        map.addControl(new MapEmogeosFactory.EmogeoControls('strat-section'));
      }
      map.addControl(switcher);
    }

    function setPopupOverlay(mapName) {
      var map = mapName ? maps[mapName] : maps['default'];
      popup = new ol.Overlay.Popup();
      map.addOverlay(popup);
    }
  }
}());
