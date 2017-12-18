(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapFeaturesFactory', MapFeatures);

  MapFeatures.$inject = ['$log', 'DataModelsFactory', 'HelpersFactory', 'MapLayerFactory', 'MapSetupFactory',
    'ProjectFactory', 'SpotFactory', 'SymbologyFactory'];

  function MapFeatures($log, DataModelsFactory, HelpersFactory, MapLayerFactory, MapSetupFactory, ProjectFactory,
                       SpotFactory, SymbologyFactory) {
    var mappableSpots = {};
    var selectedHighlightLayer = {};
    var typeVisibility = {};

    return {
      'createDatasetsLayer': createDatasetsLayer,
      'createFeatureLayer': createFeatureLayer,
      'geojsonToVectorLayer': geojsonToVectorLayer,
      'getClickedFeature': getClickedFeature,
      'getClickedLayer': getClickedLayer,
      'getInitialDatasetLayerStates': getInitialDatasetLayerStates,
      'getFeatureById': getFeatureById,
      'getVisibleLassoedSpots': getVisibleLassoedSpots,
      'setMappableSpots': setMappableSpots,
      'setSelectedSymbol': setSelectedSymbol,
      'showMapPopup': showMapPopup,
      'showPopup': showPopup,
      'removeSelectedSymbol': removeSelectedSymbol
    };

    /**
     * Private Functions
     */

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

    // Save the current visibility for each feature type in the Spots Feature Layer
    function setCurrentTypeVisibility(map) {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'featureLayer') {
          layer.getLayers().forEach(function (typeLayer) {
            var type = typeLayer.get('title').split(' (')[0];
            typeVisibility[type] = typeLayer.get('visible');
          });
        }
      });
    }

    /**
     * Public Functions
     */

    function createDatasetsLayer(states, map) {
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
          'datasetId': d.id,
          'title': d.name + ' ' + titlePart,
          'layergroup': 'Datasets'
        });
        datasetsLayer.getLayers().push(datasetLayer);
      });
    }

    //returns spots that are lassoed and appear on the map
    function getVisibleLassoedSpots(lassoedSpots, map) {

      var visibleSpotIds = [];
      var writer = new ol.format.GeoJSON();
      var layers = map.getLayers();

      //gather all visible features from map
      layers.forEach(function (layer) {
        if (layer.get('name') === 'featureLayer') {
          var sublayers = layer.getLayers();
          sublayers.forEach(function (sublayer) {
            if (sublayer.getVisible()) {
              var source = sublayer.getSource();
              var features = source.getFeatures();
              var geojsonStr = writer.writeFeatures(features,
                {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
              var collection = angular.fromJson(geojsonStr);
              _.each(collection.features, function (feature) {
                visibleSpotIds.push(feature.properties.id);
              })
            }
          })
        }
      });

      //return all spots from lassoedSpots whose ids are in visibleSpotIds
      return _.filter(lassoedSpots, function (spot) {
        return _.contains(visibleSpotIds, spot.properties.id);
      });
    }

    function createFeatureLayer(states, map) {

      setCurrentTypeVisibility(map);

      // Loop through all spots and create ol vector layers
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
      // for each orientation measurement, add the orientation measurement to a new element called orientation and
      // then delete the orientation_data element
      var mappedFeatures = [];
      _.each(mappableSpots, function (spot) {
        if ((spot.geometry.type === 'Point' || spot.geometry.type === 'MultiPoint') && spot.properties.orientation_data) {
          _.each(spot.properties.orientation_data, function (orientation) {
            var feature = angular.fromJson(angular.toJson(spot));
            delete feature.properties.orientation_data;
            _.each(orientation.associated_orientation, function (associatedOrientation) {
              feature.properties.orientation = associatedOrientation;
              mappedFeatures.push(angular.fromJson(angular.toJson(feature)));
            });
            feature.properties.orientation = orientation;
            mappedFeatures.push(angular.fromJson(angular.toJson(feature)));
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
        var color = '#663300';
        var width = 2;
        var lineDash = [1, 0];

        if (feature.get('trace')) {
          var trace = feature.get('trace');

          // Set line color and weight
          if (trace.trace_type && trace.trace_type === 'geologic_struc') {
            color = '#FF0000';
            if (trace.geologic_structure_type
              && (trace.geologic_structure_type === 'fault' || trace.geologic_structure_type === 'shear_zone')) {
              width = 4;
            }
          }
          else if (trace.trace_type && trace.trace_type === 'contact') {
            color = '#000000';
            if (trace.contact_type && trace.contact_type === 'intrusive'
              && trace.intrusive_contact_type && trace.intrusive_contact_type === 'dike') {
              width = 4;
            }
          }
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
        var facing = undefined;
        var orientation_type = 'none';
        var orientation = feature.get('orientation');
        if (orientation) {
          rotation = orientation.strike || (orientation.dip_direction - 90) % 360 || orientation.trend || rotation;
          symbol_orientation = orientation.dip || orientation.plunge || symbol_orientation;
          feature_type = orientation.feature_type || feature_type;
          orientation_type = orientation.type || orientation_type;
          facing = orientation.facing;
        }

        return new ol.style.Icon({
          'anchorXUnits': 'fraction',
          'anchorYUnits': 'fraction',
          'opacity': 1,
          'rotation': HelpersFactory.toRadians(rotation),
          'src': SymbologyFactory.getSymbolPath(feature_type, symbol_orientation, orientation_type, facing),
          'scale': 0.05
        });
      }

      function getPolyFill(feature) {
        var color;
        // Set colors for strat section
        var featureProperties = feature.getProperties();
        try {
          var grainSize = featureProperties.sed.lithologies.principal_grain_size_clastic ||
            featureProperties.sed.lithologies.principal_dunham_classificatio ||
            featureProperties.sed.lithologies.misc_lithologies;
          if (grainSize === 'clay') color = 'rgba(128, 222, 77, 1)';                // CMYK 50,13,70,0 USGS Color 682
          else if (grainSize === 'mud') color = 'rgba(77, 255, 0, 1)';              // CMYK 70,0,100,0 USGS Color 890
          else if (grainSize === 'silt') color = 'rgba(153, 255, 102, 1)';          // CMYK 40,0,60,0 USGS Color 570
          else if (grainSize === 'sand_v_fine') color = 'rgba(255, 255, 179, 1)';   // CMYK 0,0,30,0 USGS Color 40
          else if (grainSize === 'sand_fine_lwr') color = 'rgba(255, 255, 153, 1)'; // CMYK 0,0,40,0 USGS Color 50
          else if (grainSize === 'sand_fine_upr') color = 'rgba(255, 255, 128, 1)'; // CMYK 0,0,50,0 USGS Color 60
          else if (grainSize === 'sand_med_lwr') color = 'rgba(255, 255, 102, 1)';  // CMYK 0,0,60,0 USGS Color 70
          else if (grainSize === 'sand_med_upr') color = 'rgba(255, 255, 77, 1)';   // CMYK 0,0,70,0 USGS Color 80
          else if (grainSize === 'sand_coar_lwr') color = 'rgba(255, 255, 0, 1)';   // CMYK 0,0,100,0 USGS Color 90
          else if (grainSize === 'sand_coar_upr') color = 'rgba(255, 235, 0, 1)';   // CMYK 0,8,100,0 USGS Color 91
          else if (grainSize === 'sand_v_coar') color = 'rgba(255, 222, 0, 1)';     // CMYK 0,13,100,0 USGS Color 92
          else if (grainSize === 'granule') color = 'rgba(255, 153, 0, 1)';         // CMYK 0,40,100,0 USGS Color 95
          else if (grainSize === 'pebble') color = 'rgba(255, 128, 0, 1)';          // CMYK 0,50,100,0 USGS Color 96
          else if (grainSize === 'cobble') color = 'rgba(255, 102, 0, 1)';          // CMYK 0,60,100,0 USGS Color 97
          else if (grainSize === 'boulder') color = 'rgba(255, 77, 0, 1)';          // CMYK 0,70,100,0 USGS Color 98
          else if (grainSize === 'mudstone') color = 'rgba(77, 255, 128, 1)';       // CMYK 70,0,50,0 USGS Color 860
          else if (grainSize === 'wackestone') color = 'rgba(77, 255, 179, 1)';     // CMYK 70,0,30,0 USGS Color 840
          else if (grainSize === 'packstone') color = 'rgba(77, 255, 222, 1)';      // CMYK 70,0,13,0 USGS Color 820
          else if (grainSize === 'grainstone') color = 'rgba(179, 255, 255, 1)';    // CMYK 30,0,0,0 USGS Color 400
          else if (grainSize === 'boundstone') color = 'rgba(77, 128, 255, 1)';     // CMYK 70,50,0,0 USGS Color 806
          else if (grainSize === 'cementstone') color = 'rgba(0, 179, 179, 1)';     // CMYK 100,30,30,0 USGS Color 944
          else if (grainSize === 'recrystallized') color = 'rgba(0, 102, 222, 1)';  // CMYK 100,60,13,0 USGS Color 927
          else if (grainSize === 'floatstone') color = 'rgba(77, 255, 255, 1)';     // CMYK 70,0,0,0 USGS Color 800
          else if (grainSize === 'rudstone') color = 'rgba(77, 204, 255, 1)';       // CMYK 70,20,0,0 USGS Color 803
          else if (grainSize === 'framestone') color = 'rgba(77, 128, 255, 1)';     // CMYK 70,50,0,0 USGS Color 806
          else if (grainSize === 'bafflestone') color = 'rgba(77, 128, 255, 1)';    // CMYK 70,50,0,0 USGS Color 806
          else if (grainSize === 'bindstone') color = 'rgba(77, 128, 255, 1)';      // CMYK 70,50,0,0 USGS Color 806
          else if (grainSize === 'coal') color = 'rgba(0, 0, 0, 1)';                // CMYK 100,100,100,0 USGS Color 999
          else if (grainSize === 'evaporites') color = 'rgba(153, 77, 0, 1)';       // CMYK 40,70,0,0 USGS Color 508
          else if (grainSize === 'tuff') color = 'rgba(255, 128, 255, 1)';          // CMYK 0,50,0,0 USGS Color 6
          else color = 'rgba(255, 255, 255, 1)';                                    // default white

          // Apply patterns
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          var pattern = (function () {
            canvas.width = 10;
            canvas.height = 10;
            // white background
            context.fillStyle = 'white';
            context.fillRect(0, 0, 5, 5);
            context.fill();
            // outer circle
            context.fillStyle = 'red';
            context.fillRect(5, 5, 5, 5);
            context.fill();

            return context.createPattern(canvas, 'repeat');
          }());

          var fill = new ol.style.Fill();
          fill.setColor(pattern);
          fill.setColor(color);
          return fill;
        }
        // Set colors for not strat section polys
        catch (e) {
          color = 'rgba(0, 0, 255, 0.4)';       // blue
          var colorApplied = false;
          var tags = ProjectFactory.getTagsBySpotId(feature.get('id'));
          if (tags.length > 0) {
            _.each(tags, function (tag) {
              if (tag.type === 'geologic_unit' && tag.color && !_.isEmpty(tag.color) && !colorApplied) {
                var rgbColor = HelpersFactory.hexToRgb(tag.color);
                color = 'rgba(' + rgbColor.r + ', ' + rgbColor.g + ', ' + rgbColor.b + ', 0.4)';
                colorApplied = true;
              }
            });
          }
          if (feature.get('surface_feature') && !colorApplied) {
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
        'style': styleFunction,
        'visible': typeVisibility[geojson.properties.name.split(' (')[0]]
      });
    }

    function getClickedFeature(map, evt) {
      return map.forEachFeatureAtPixel(evt.pixel, function (feat, lyr) {
        return feat;
      }, this, function (lyr) {
        // we only want the layer where the spots are located
        return (lyr instanceof ol.layer.Vector) && lyr.get('name') !== 'drawLayer' &&
          lyr.get('name') !== 'geolocationLayer' && lyr.get('name') !== 'selectedHighlightLayer';
      });
    }

    function getClickedLayer(map, evt) {
      return map.forEachFeatureAtPixel(evt.pixel, function (feat, lyr) {
        return lyr;
      }, this, function (lyr) {
        // we only want the layer where the spots are located
        return (lyr instanceof ol.layer.Vector) && lyr.get('name') !== 'drawLayer' &&
          lyr.get('name') !== 'geolocationLayer' && lyr.get('name') !== 'selectedHighlightLayer';
      });
    }

    function getFeatureById(spotId) {
      var foundFeature = {};
      var featureLayer = MapLayerFactory.getFeatureLayer();
      _.each(featureLayer.getLayers().getArray(), function (layer) {
        _.each(layer.getSource().getFeatures(), function (feature) {
          if (_.isEmpty(foundFeature) && feature.get('id') === spotId) foundFeature = feature;
        });
      });
      return foundFeature;
    }

    function getInitialDatasetLayerStates(map) {
      // Set the default visible states for the datasets
      var datasets = ProjectFactory.getActiveDatasets();
      var datasetsLayerStates = {};
      _.each(datasets, function (dataset) {
        datasetsLayerStates[dataset.id] = true;
      });

      var states = {};
      var visibleSpotsDatasets = getVisibleSpots(datasetsLayerStates);
      _.each(visibleSpotsDatasets, function (visibleSpotsDataset, key) {
        if (visibleSpotsDataset.length > 0) states[key] = true;
      });
      return states;
    }

    function setMappableSpots(spots) {
      mappableSpots = spots;
    }

    // Add a feature to highlight selected Spot
    // Encompassing orange circle for a point, orange stroke for a line, and orange fill for a polygon
    function setSelectedSymbol(map, geometry) {
      var selected = new ol.Feature({
        geometry: geometry
      });

      var style = {};
      if (geometry.getType() === 'Point') {
        style = new ol.style.Style({
          image: new ol.style.Circle({
            radius: 40,
            stroke: new ol.style.Stroke({
              color: 'white',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: [245, 121, 0, 0.6]
            })
          })
        });
      }
      else if (geometry.getType() === 'LineString' || geometry.getType() === 'MultiLineString') {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: [245, 121, 0, 0.6],
            width: 4
          })
        })
      }
      else {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'white',
            width: 2
          }),
          fill: new ol.style.Fill({
            color: [245, 121, 0, 0.6]
          })
        })
      }

      var selectedHighlightSource = new ol.source.Vector({
        features: [selected]
      });

      selectedHighlightLayer = new ol.layer.Vector({
        name: 'selectedHighlightLayer',
        source: selectedHighlightSource,
        style: style
      });

      map.addLayer(selectedHighlightLayer);
    }

    function showMapPopup(feature, evt) {
      var popup = MapSetupFactory.getPopupOverlay();
      popup.hide();  // Clear any existing popovers

      // popup content
      var content = '';
      content += '<a href="#/app/spotTab/' + feature.get('id') + '/spot"><b>' + feature.get('name') + '</b></a>';

      var orientation = feature.get('orientation');

      if (orientation) {
        content += '<br>';
        content += '<small>' + orientation.type + '</small>';

        if ((orientation.strike || orientation.dip_direction) && orientation.dip) {
          content += '<br>';
          if (orientation.strike) {
            content += '<small>' + orientation.strike + '&deg; strike / ' + orientation.dip + '&deg; dip</small>';
          }
          else {
            content += '<small>' + orientation.dip_direction + '&deg; dip direction / ' + orientation.dip + '&deg; dip</small>';
          }
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

    /* ToDo: Delete this when use showMapPopup with image basemap */
    function showPopup(map, evt) {
      var popup = MapSetupFactory.getPopupOverlay();
      popup.hide();  // Clear any existing popovers

      var feature = map.forEachFeatureAtPixel(evt.pixel, function (feat, lyr) {
        return feat;
      }, this, function (lyr) {
        // we only want the layer where the spots are located
        return (lyr instanceof ol.layer.Vector) &&
          lyr.get('name') !== 'drawLayer' &&
          lyr.get('name') !== 'geolocationLayer';
      });

      var layer = map.forEachFeatureAtPixel(evt.pixel, function (feat, lyr) {
        return lyr;
      }, this, function (lyr) {
        // we only want the layer where the spots are located
        return (lyr instanceof ol.layer.Vector) &&
          lyr.get('name') !== 'drawLayer' &&
          lyr.get('name') !== 'geolocationLayer';
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

    // Remove feature showing highlighted Spot
    function removeSelectedSymbol(map) {
      map.removeLayer(selectedHighlightLayer);
    }
  }
}());
