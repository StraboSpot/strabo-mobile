(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapFeaturesFactory', MapFeatures);

  MapFeatures.$inject = ['DataModelsFactory', 'HelpersFactory', 'MapLayerFactory', 'MapSetupFactory', 'ProjectFactory',
    'SpotFactory', 'SymbologyFactory'];

  function MapFeatures(DataModelsFactory, HelpersFactory, MapLayerFactory, MapSetupFactory, ProjectFactory, SpotFactory,
                       SymbologyFactory) {
    var mappableSpots = {};

    return {
      'createDatasetsLayer': createDatasetsLayer,
      'createFeatureLayer': createFeatureLayer,
      'geojsonToVectorLayer': geojsonToVectorLayer,
      'getInitialDatasetLayerStates': getInitialDatasetLayerStates,
      'showPopup': showPopup
    };

    /**
     * Private Functions
     */

    function setMappableSpots(map, imageBasemap) {
      var activeSpots = SpotFactory.getActiveSpots();
      if (map.getView().getProjection().getUnits() === 'pixels') {
        mappableSpots = _.filter(activeSpots, function (spot) {
          return spot.properties.image_basemap === imageBasemap.id;
        });
      }
      // Remove spots that don't have a geometry defined or are mapped on an image
      else {
        mappableSpots = _.reject(activeSpots, function (spot) {
          return !_.has(spot, 'geometry') || _.has(spot.properties, 'image_basemap');
        });
      }
    }

    function getVisibleSpots(states) {
      // Get the spot ids of mappable spots in the visible datasets
      var allDatasetIdsToSpotIds = ProjectFactory.getSpotIds();
      var datasetIdsToSpotIds = {};
      var visibleSpotsByDataset = {};

      _.each(states, function (value, key) {
        if (value) datasetIdsToSpotIds[key] = allDatasetIdsToSpotIds[key];
        else datasetIdsToSpotIds[key] = [];
        visibleSpotsByDataset[key] = [];
      });

      _.each(mappableSpots, function (spot) {
        _.each(datasetIdsToSpotIds, function (datasetIdToSpotIds, key) {
          if (_.contains(datasetIdToSpotIds, spot.properties.id)) visibleSpotsByDataset[key].push(spot);
        });
      });
      return visibleSpotsByDataset;
    }

    /**
     * Public Functions
     */

    function createDatasetsLayer(states, map, imageBasemap) {
      var visibleSpotsDatasets = getVisibleSpots(states);
      var datasets = ProjectFactory.getActiveDatasets();
      var datasetsLayer = MapLayerFactory.getDatasetsLayer();
      datasetsLayer.getLayers().clear();

      _.each(visibleSpotsDatasets, function (visibleSpotsDataset, key) {
        var d = _.find(datasets, function (dataset) {
          return dataset.id.toString() === key;
        });
        var titlePart = visibleSpotsDataset.length === 1 ? '(1 Spot)' : '(' + visibleSpotsDataset.length + ' Spots)';
        var datasetLayer = new ol.layer.Tile({
          'id': d.id,
          'title': d.name + ' ' + titlePart,
          'layergroup': 'Datasets'
        });
        datasetsLayer.getLayers().push(datasetLayer);
      });
    }

    function createFeatureLayer(states, map, imageBasemap) {
      // Loop through all spots and create ol vector layers
      setMappableSpots(map, imageBasemap);
      var visibleSpotsDatasets = getVisibleSpots(states);
      var visibleSpots = [];
      _.each(visibleSpotsDatasets, function (visibleSpotsDataset) {
        if (visibleSpotsDataset.length > 0) visibleSpots.push(visibleSpotsDataset);
      });

      mappableSpots = _.flatten(visibleSpots);

      var featureLayer = MapLayerFactory.getFeatureLayer();
      // wipe the array because we want to avoid duplicating the feature in the ol.Collection
      featureLayer.getLayers().clear();


      // Create features to map from the mappable spots.
      // For POINT Spots with orientation data, create a copy of the entire spot
      // for each orienation measurement, add the orientation measurement to a new element called orientation and
      // then delete the orientation_data element
      var mappedFeatures = [];
      _.each(mappableSpots, function (spot) {
        if ((spot.geometry.type === 'Point' || spot.geometry.type === 'MultiPoint') && spot.properties.orientation_data) {
          _.each(spot.properties.orientation_data, function (orientation) {
            var feature = angular.fromJson(angular.toJson(spot));
            delete feature.properties.orientation_data;
            feature.properties.orientation = orientation;
            mappedFeatures.push(feature);
          });
        }
        else mappedFeatures.push(angular.fromJson(angular.toJson(spot)));
      });

      // get distinct groups and aggregate spots by group type
      var featureGroup = _.groupBy(mappedFeatures, function (feature) {
        if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
          if (feature.properties.orientation && feature.properties.orientation.feature_type) {
            return DataModelsFactory.getFeatureTypeLabel(
                feature.properties.orientation.feature_type) || 'no orientation type';
          }
          else return 'no orientation type'
        }
        else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
          if (feature.properties.trace && feature.properties.trace.trace_type) {
            return DataModelsFactory.getTraceTypeLabel(feature.properties.trace.trace_type) || 'no trace type';
          }
          else return 'no trace type';
        }
        else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          if (feature.properties.surface_feature && feature.properties.surface_feature.surface_feature_type) {
            return DataModelsFactory.getSurfaceFeatureTypeLabel(
                feature.properties.surface_feature.surface_feature_type) || 'no surface feature type';
          }
          else return 'no surface feature type';
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

      function getStrokeStyle(feature) {
        var color = '#FFFF00';
        var width = 2;
        var lineDash = [1, 0];

        if (feature.get('trace')) {
          var trace = feature.get('trace');

          // Set line color and weight
          if (trace.trace_type && trace.trace_type === 'geologic_struc') color = '#FF0000';
          else if (trace.trace_type && trace.trace_type === 'contact') color = '#000000';
          else if (trace.trace_type && trace.trace_type === 'geomorphic_fea') {
            width = 4;
            color = '#0000FF';
          }
          else if (trace.trace_type && trace.trace_type === 'anthropenic_fe') {
            width = 4;
            color = '#800080';
          }

          // Set line pattern
          lineDash = [.01, 10];
          if (trace.trace_quality && trace.trace_quality === 'known') lineDash = [1, 0];
          else if (trace.trace_quality && trace.trace_quality === 'approximate'
            || trace.trace_quality === 'questionable') lineDash = [20, 15];
          else if (trace.trace_quality && trace.trace_quality === 'other') lineDash = [20, 15, 0, 15];
        }

        return new ol.style.Stroke({
          'color': color,
          'width': width,
          'lineDash': lineDash
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

      function getPolyFill(feature) {
        var color = 'rgba(0, 0, 255, 0.4)';       // blue
        if (feature.get('surface_feature')) {
          var surfaceFeature = feature.get('surface_feature');
          switch (surfaceFeature.surface_feature_type) {
            case 'rock_unit':
              color = 'rgba(0, 255, 255, 0.4)';   // light blue
              break;
            case 'contiguous_outcrop':
              color = 'rgba(240, 128, 128, 0.4)'; // pink
              break;
            case 'geologic_structure':
              color = 'rgba(0, 255, 255, 0.4)';   // light blue
              break;
            case 'geomorphic_feature':
              color = 'rgba(0, 128, 0, 0.4)';     // green
              break;
            case 'anthropogenic_feature':
              color = 'rgba(128, 0, 128, 0.4)';   // purple
              break;
            case 'extent_of_mapping':
              color = 'rgba(128, 0, 128, 0)';     // no fill
              break;
            case 'extent_of_biological_marker':   // green
              color = 'rgba(0, 128, 0, 0.4)';
              break;
            case 'subjected_to_similar_process':
              color = 'rgba(255, 165, 0,0.4)';    // orange
              break;
            case 'gradients':
              color = 'rgba(255, 165, 0,0.4)';    // orange
              break;
          }
        }
        return new ol.style.Fill({
          'color': color
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
            'stroke': getStrokeStyle(feature),
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
            'fill': getPolyFill(feature),
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

    function getInitialDatasetLayerStates(map, imageBasemap) {
      // Set the default visible states for the datasets
      var datasets = ProjectFactory.getActiveDatasets();
      var datasetsLayerStates = {};
      _.each(datasets, function (dataset) {
        datasetsLayerStates[dataset.id] = true;
      });
      setMappableSpots(map, imageBasemap);
      var states = {};
      var visibleSpotsDatasets = getVisibleSpots(datasetsLayerStates);
      _.each(visibleSpotsDatasets, function (visibleSpotsDataset, key) {
        if (visibleSpotsDataset.length > 0) states[key] = true;
      });
      return states;
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
      if (feature && layer && layer.get('name') !== 'geolocationLayer') {
        // popup content
        var content = '';
        content += '<a href="#/app/spotTab/' + feature.get('id') + '/spot"><b>' + feature.get('name') + '</b></a>';

        var orientation = feature.get('orientation');

        if (orientation) {
          content += '<br>';
          content += '<small>' + orientation.type + '</small>';

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
