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

      // Create features to map from the mappable spots.
      // Create a deep clone of each mappable spot. For spots with orientation data, create a clone of the entire spot
      // for each orienation measurement, add the orientation measurement to a new element called orientation and
      // then delete the orientation_data element
      var mappedFeatures = [];
      _.each(mappableSpots, function (spot) {
        if (spot.properties.orientation_data) {
          _.each(spot.properties.orientation_data, function (orientation) {
            var feature = angular.fromJson(angular.toJson(spot));
            delete feature.properties.orientation_data;
            feature.properties.orientation = orientation;
            mappedFeatures.push(feature);
          });
        }
        else {
          mappedFeatures.push(angular.fromJson(angular.toJson(spot)));
        }
      });

      // get distinct groups and aggregate spots by group type
      var featureGroup = _.groupBy(mappedFeatures, function (feature) {
        if (feature.properties.orientation) {
          return feature.properties.orientation.feature_type || 'no type';
        }
        return 'no type';
      });

      // Go through each group and assign all the aggregates to the geojson feature
      for (var key in featureGroup) {
        if (featureGroup.hasOwnProperty(key)) {
          // Create a geojson to hold all the spots that fit the same spot type
          var spotTypeLayer = {
            'type': 'FeatureCollection',
            'features': featureGroup[key],
            'properties': {
              'name': key + ' (' + featureGroup[key].length + ')'
            }
          };

          // Add the feature collection layer to the map
          featureLayer.getLayers().push(geojsonToVectorLayer(spotTypeLayer, map.getView().getProjection()));
        }
      }
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
          'rotation': HelpersFactory.toRadians(rotation),
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
        var feature_type = 'none';
        var rotation = 0;
        var symbol_orientation = 0;
        var orientation_type = 'none';
        var orientation = feature.get('orientation');
        if (orientation) {
          rotation = orientation.strike || orientation.trend || rotation;
          symbol_orientation = orientation.dip || orientation.plunge || symbol_orientation;
          feature_type = orientation.feature_type || feature_type;
          orientation_type = orientation.orientation_type || orientation_type;
        }

        return new ol.style.Icon({
          'anchorXUnits': 'fraction',
          'anchorYUnits': 'fraction',
          'opacity': 1,
          'rotation': HelpersFactory.toRadians(rotation),
          'src': SymbologyFactory.getSymbolPath(feature_type, symbol_orientation, orientation_type),
          'scale': 0.05
        });
      }

      // Set styles for points, lines and polygon and groups
      function styleFunction(feature, resolution) {
        var rotation = 0;
        var pointText = feature.get('name');
        var orientation = feature.get('orientation');
        if (orientation) {
          rotation = orientation.strike || orientation.trend || rotation;
          pointText = orientation.dip || orientation.plunge || pointText;
        }

        var pointStyle = [
          new ol.style.Style({
            'image': getIconForFeature(feature),
            'text': textStylePoint(pointText.toString(), rotation)
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
        var styles = [];
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
        content += '<a href="#/app/spotTab/' + feature.get('id') + '/spot"><b>' + feature.get('name') + '</b></a>';

        var orientation = feature.get('orientation');

        if (orientation) {
          content += '<br>';
          content += '<small>' + orientation.orientation_type + '</small>';

          if (orientation.strike && orientation.dip) {
            content += '<br>';
            content += '<small>' + orientation.strike + '&deg; strike / ' + orientation.dip + '&deg; dip</small>';
          }

          if (orientation.trend && orientation.plunge) {
            content += '<br>';
            content += '<small>' + orientation.trend + '&deg; trend / ' + orientation.plunge + '&deg; plunge</small>';
          }

          if (orientation.feature_type) {
            content += '<br>';
            content += '<small>' + orientation.feature_type + '</small>';
          }
        }
        content = content.replace(/_/g, ' ');

        // setup the popup position
        popup.show(evt.coordinate, content);
      }
    }
  }
}());
