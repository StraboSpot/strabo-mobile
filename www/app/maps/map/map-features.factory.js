(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapFeaturesFactory', MapFeatures);

  MapFeatures.$inject = ['$document', '$log', '$state', '$q', 'DataModelsFactory', 'HelpersFactory', 'ImageFactory',
    'MapEmogeosFactory', 'MapLayerFactory', 'MapSetupFactory', 'ProjectFactory', 'SpotFactory',
    'SymbologyFactory', 'IS_WEB'];

  function MapFeatures($document, $log, $state, $q, DataModelsFactory, HelpersFactory, ImageFactory, MapEmogeosFactory,
                       MapLayerFactory, MapSetupFactory, ProjectFactory, SpotFactory, SymbologyFactory, IS_WEB) {
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
      'removeSelectedSymbol': removeSelectedSymbol
    };

    /**
     * Private Functions
     */

    // Finish creating and display the popup
    function continuePopup(feature, evt, imageSource) {
      var popup = MapSetupFactory.getPopupOverlay();
      popup.hide();  // Clear any existing popovers

      // popup title
      var el = document.createElement('div');
      var title = document.createElement('h5');
      title.className = 'popup-title';
      title.innerHTML = feature.get('name') + '<hr>';
      el.appendChild(title);

      // Camera and Tags Icons
      var iconsHTML = '<div class="padding-top">';
      iconsHTML += typeof Camera !== 'undefined' ? '<a href="#" data-action="takePicture" class="button-icon icon button-small button-text-small ion-camera"></a>' : '';
      iconsHTML += '</div>';

      // popup main content
      var content = document.createElement('div');
      var text = getPopupText(feature.getProperties());
      var detailHTML = text.join('<br>');
      detailHTML += iconsHTML;
      if (imageSource) {
        el.style.width = 250;
        var numOfImages = _.size(feature.getProperties().images);
        var firstImageHTML = "<a><img src=" + imageSource + " width='100' height='100'></a><br>1/" + numOfImages + " image(s)";
        content.innerHTML = '<div class="row"> <div class="col">' + firstImageHTML + '</div> <div class="col">' +
          detailHTML + '</div></div>';
      }
      else content.innerHTML = detailHTML;
      el.appendChild(content);

      // popup more detail button
      var moreButton = document.createElement('div');
      moreButton.innerHTML = '<a href="#" data-action="more" class="popup-more-button">See More</a>';
      el.appendChild(moreButton);

      // setup the popup position
      popup.show(evt.coordinate, el);

      // Set event on popup close (Emogeos only used on strat section page currently)
      if ($state.current.name === 'app.strat-section') {
        var closer = $document[0].getElementsByClassName('ol-popup-closer')[0];
        closer.addEventListener('click', function (evt) {
          MapEmogeosFactory.resetAllEmogeoButtons();
        });
      }
    }

    // Get the first image in a Spot for display in the popup
    function getFirstImageSource(image) {
      var deferred = $q.defer(); // init promise
      var firstImageSource;
      ImageFactory.getImageById(image.id).then(function (src) {
        /*if (IS_WEB) firstImageSource = "https://strabospot.org/pi/" + images[0].id;   // Popups aren't used on WEB
        else */
        if (src) firstImageSource = src;
        else firstImageSource = 'img/image-not-found.png';
        deferred.resolve(firstImageSource);
      }, function () {
        deferred.resolve(null);
      });
      return deferred.promise;
    }

    // Build the text to be displayed in the popup
    function getPopupText(props) {
      var text = [];
      // Orientation Detail
      if (props.orientation) {
        if ((props.orientation.strike || props.orientation.dip_direction) && props.orientation.dip) {
          if (props.orientation.strike) {
            text.push(props.orientation.strike + '&deg; strike / ' + props.orientation.dip + '&deg; dip');
          }
          else {
            text.push(props.orientation.dip_direction + '&deg; dip direction / ' + props.orientation.dip + '&deg; dip');
          }
        }
        if (props.orientation.trend && props.orientation.plunge) {
          text.push(props.orientation.trend + '&deg; trend / ' + props.orientation.plunge + '&deg; plunge');
        }
        if (props.orientation.feature_type) text.push(props.orientation.feature_type);
      }

      // Interval Detail
      if (props.surface_feature && props.surface_feature.surface_feature_type &&
        props.surface_feature.surface_feature_type === 'strat_interval') {
        if (props.sed && props.sed.lithologies) {
          if (props.sed.lithologies.interval_thickness) text.push('Thickness: ' +
            props.sed.lithologies.interval_thickness + ' ' + props.sed.lithologies.thickness_units);
          if (props.sed.lithologies.primary_lithology) {
            text.push('Primary Lithology: ' + DataModelsFactory.getSedLabel(props.sed.lithologies.primary_lithology));
          }
          if (props.sed.lithologies.mud_silt_principal_grain_size || props.sed.lithologies.sand_principal_grain_size ||
            props.sed.lithologies.congl_principal_grain_size || props.sed.lithologies.breccia_principal_grain_size) {
            var grainSize = props.sed.lithologies.mud_silt_principal_grain_size ||
              props.sed.lithologies.sand_principal_grain_size || props.sed.lithologies.congl_principal_grain_size ||
              props.sed.lithologies.breccia_principal_grain_size;
            text.push('Principal Grain Size: ' + DataModelsFactory.getSedLabel(grainSize));
          }
          if (props.sed.lithologies.principal_dunham_class) {
            text.push('Principal Dunham Classification: ' +
              DataModelsFactory.getSedLabel(props.sed.lithologies.principal_dunham_class));
          }
        }
      }
      return text;
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
        var datasetLayer = new ol.layer.Vector({
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
        var labelText;
        if ((rotation >= 60 && rotation <= 120) || (rotation >= 240 && rotation <= 300)) {
          labelText = '         ' + text  // we pad with spaces due to rotational offset
        }
        else labelText = '     ' + text;
        return new ol.style.Text({
          'font': '12px Calibri,sans-serif',
          'text': labelText,
          'textAlign': 'left',
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
            'fill': SymbologyFactory.getPolyFill(feature, resolution),
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
      if (projection.getUnits() === 'pixels') features = (new ol.format.GeoJSON()).readFeatures(geojson);
      else {
        features = (new ol.format.GeoJSON()).readFeatures(geojson, {
          'featureProjection': projection
        });
      }
      SymbologyFactory.setFeatureLayer(MapLayerFactory.getFeatureLayer());
      SymbologyFactory.setFillPatterns(features);

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

    // Start creating the map popup
    function showMapPopup(feature, evt) {
      var props = feature.getProperties();
      if (props.images) {
        getFirstImageSource(props.images[0]).then(function (imageSource) {
          continuePopup(feature, evt, imageSource);
        }, function () {
          continuePopup(feature, evt);
        });
      }
      else continuePopup(feature, evt);
    }

    // Remove feature showing highlighted Spot
    function removeSelectedSymbol(map) {
      map.removeLayer(selectedHighlightLayer);
    }
  }
}());
