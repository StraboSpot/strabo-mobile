(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapFeaturesFactory', MapFeatures);

  MapFeatures.$inject = ['HelpersFactory', 'ImageBasemapFactory', 'MapLayerFactory', 'MapSetupFactory', 'SpotFactory',
    'SymbologyFactory'];

  function MapFeatures(HelpersFactory, ImageBasemapFactory, MapLayerFactory, MapSetupFactory, SpotFactory,
                       SymbologyFactory) {
    return {
      'createFeatureLayer': createFeatureLayer,
      'geojsonToVectorLayer': geojsonToVectorLayer,
      'showPopup': showPopup
    };

    function createFeatureLayer(map, imageBasemap) {
      // Loop through all spots and create ol vector layers
      var spots = SpotFactory.getSpots();
      var featureLayer = MapLayerFactory.getFeatureLayer();
      // wipe the array because we want to avoid duplicating the feature in the ol.Collection
      featureLayer.getLayers().clear();

      var mappableSpots;
      if (map.getView().getProjection().getUnits() === 'pixels') {
        ImageBasemapFactory.clearCurrentImageBasemap();

        mappableSpots = _.filter(spots, function (spot) {
          return spot.properties.image_basemap === imageBasemap.id;
        });
      }
      else {
        // Remove spots that don't have a geometry defined or
        // are mapped on an image
        mappableSpots = _.reject(spots, function (spot) {
          return !_.has(spot, 'geometry') || _.has(spot.properties, 'image_basemap');
        });
      }

      var spotsLayer = {
        'type': 'FeatureCollection',
        'features': mappableSpots,
        'properties': {
          'name': 'Spots (' + mappableSpots.length + ')'
        }
      };

      featureLayer.getLayers().push(geojsonToVectorLayer(spotsLayer, map.getView().getProjection()));
    }

    // We want to load all the geojson markers from the persistence storage onto the map
    // creates a ol vector layer for supplied geojson object
    function geojsonToVectorLayer(geojson, projection) {
      // textStyle is a function because each point has a different text associated
      function textStyle(text) {
        return new ol.style.Text({
          'font': '12px Calibri,sans-serif',
          'text': text,
          'fill': new ol.style.Fill({
            'color': '#000'
          }),
          'stroke': new ol.style.Stroke({
            'color': '#fff',
            'width': 3
          })
        });
      }

      function textStylePoint(text, rotation) {
        return new ol.style.Text({
          'font': '12px Calibri,sans-serif',
          'text': '          ' + text,  // we pad with spaces due to rotational offset
          'textAlign': 'center',
          'rotation': HelpersFactory.toRadians(rotation) * (-1),
          'fill': new ol.style.Fill({
            'color': '#000'
          }),
          'stroke': new ol.style.Stroke({
            'color': '#fff',
            'width': 3
          })
        });
      }

      function getIconForFeature(feature) {
        var rotation = feature.get('strike') || feature.get('trend') || 0;
        var orientation = feature.get('dip') || feature.get('plunge') || 0;
        var feature_type = feature.get('planar_feature_type') || feature.get('linear_feature_type');

        // Is this a planar or linear feature? If both use planar.
        var pORl = feature.get('planar_feature_type') ? 'planar' : 'linear';
        // If feature_type is undefined use planar as default so get the default planar symbol
        pORl = feature_type ? pORl : 'planar';

        return new ol.style.Icon({
          'anchorXUnits': 'fraction',
          'anchorYUnits': 'fraction',
          'opacity': 1,
          'rotation': HelpersFactory.toRadians(rotation),
          'src': SymbologyFactory.getSymbolPath(feature_type, pORl, orientation),
          'scale': 0.05
        });
      }

      // Set styles for points, lines and polygon and groups
      function styleFunction(feature, resolution) {
        var styles = [];
        var rotation = feature.get('strike') || feature.get('trend') || 0;

        var pointText = angular.isDefined(feature.get('plunge')) ? feature.get('plunge').toString() : feature.get(
          'name');
        pointText = angular.isDefined(feature.get('dip')) ? feature.get('dip').toString() : pointText;
        var pointStyle = [
          new ol.style.Style({
            'image': getIconForFeature(feature),
            'text': textStylePoint(pointText, rotation)
          })
        ];
        var lineStyle = [
          new ol.style.Style({
            'stroke': new ol.style.Stroke({
              'color': 'rgba(204, 0, 0, 0.7)',
              'width': 3
            }),
            'text': textStyle(feature.get('name'))
          })
        ];
        var polyText = feature.get('name');
        var polyStyle = [
          new ol.style.Style({
            'stroke': new ol.style.Stroke({
              'color': '#000000',
              'width': 0.5
            }),
            'fill': new ol.style.Fill({
              'color': 'rgba(102, 0, 204, 0.4)'
            }),
            'text': textStyle(polyText)
          })
        ];
        styles.Point = pointStyle;
        styles.MultiPoint = pointStyle;
        styles.LineString = lineStyle;
        styles.MultiLineString = lineStyle;
        styles.Polygon = polyStyle;
        styles.MultiPolygon = polyStyle;

        return styles[feature.getGeometry().getType()];
      }

      var features;
      if (projection.getUnits() === 'pixels') {
        features = (new ol.format.GeoJSON()).readFeatures(geojson);
      }
      else {
        features = (new ol.format.GeoJSON()).readFeatures(geojson, {
          'featureProjection': projection
        });
      }

      return new ol.layer.Vector({
        'source': new ol.source.Vector({
          'features': features
        }),
        'title': geojson.properties.name,
        'style': styleFunction
      });
    }

    function showPopup(map, evt) {
      var popup = MapSetupFactory.getPopupOverlay();
      popup.hide();  // Clear any existing popovers

      var feature = map.forEachFeatureAtPixel(evt.pixel, function (feat, lyr) {
        return feat;
      }, this, function (lyr) {
        // we only want the layer where the spots are located
        return (lyr instanceof ol.layer.Vector) && lyr.get('name') !== 'drawLayer' && lyr.get(
            'name') !== 'geolocationLayer';
      });

      var layer = map.forEachFeatureAtPixel(evt.pixel, function (feat, lyr) {
        return lyr;
      }, this, function (lyr) {
        // we only want the layer where the spots are located
        return (lyr instanceof ol.layer.Vector) && lyr.get('name') !== 'drawLayer' && lyr.get(
            'name') !== 'geolocationLayer';
      });

      // we need to check that we're not clicking on the geolocation layer
      if (feature && layer.get('name') !== 'geolocationLayer') {
        // popup content
        var content = '';
        content += '<a href="#/spotTab/' + feature.get('id') + '/spot"><b>' + feature.get('name') + '</b></a>';

        if (feature.get('planar_feature_type')) {
          content += '<br>';
          content += '<small>' + feature.get('planar_feature_type') + '</small>';
        }

        if (feature.get('strike') && feature.get('dip')) {
          content += '<br>';
          content += '<small>' + feature.get('strike') + '&deg; strike / ' + feature.get('dip') + '&deg; dip</small>';
        }

        if (feature.get('linear_feature_type')) {
          content += '<br>';
          content += '<small>' + feature.get('linear_feature_type') + '</small>';
        }

        if (feature.get('trend') && feature.get('plunge')) {
          content += '<br>';
          content += '<small>' + feature.get('trend') + '&deg; trend / ' + feature.get(
              'plunge') + '&deg; plunge</small>';
        }

        if (feature.get('group_relationship')) {
          content += '<br>';
          content += '<small>Grouped by: ' + feature.get('group_relationship').join(', ') + '</small>';
        }
        content = content.replace(/_/g, ' ');

        // setup the popup position
        popup.show(evt.coordinate, content);
      }
    }
  }
}());
