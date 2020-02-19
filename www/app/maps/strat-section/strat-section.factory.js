(function () {
  'use strict';

  angular
    .module('app')
    .factory('StratSectionFactory', StratSectionFactory);

  StratSectionFactory.$inject = ['$ionicPopup', '$log', '$q', 'DataModelsFactory', 'HelpersFactory', 'MapLayerFactory',
    'MapSetupFactory', 'SpotFactory'];

  function StratSectionFactory($ionicPopup, $log, $q, DataModelsFactory, HelpersFactory, MapLayerFactory,
                               MapSetupFactory, SpotFactory) {
    var basicLitholigiesLabels = ['other', 'coal', 'mudstone', 'sandstone', 'conglomerate/breccia', 'limestone/dolostone'];
    var grainSizeOptions = DataModelsFactory.getSedLabelsDictionary();
    var spotsWithStratSections = {};
    var stratSectionSpots = {};
    var xInterval = 10;  // Horizontal spacing between grain sizes/weathering tick marks
    var yMultiplier = 20;  // 1 m interval thickness = 20 pixels

    return {
      'changedColumnProfile': changedColumnProfile,
      'checkForIntervalUpdates': checkForIntervalUpdates,
      'createInterval': createInterval,
      'deleteInterval': deleteInterval,
      'drawAxes': drawAxes,
      'extractAddIntervalData': extractAddIntervalData,
      'gatherSpotsWithStratSections': gatherSpotsWithStratSections,
      'gatherStratSectionSpots': gatherStratSectionSpots,
      'getSpotWithThisStratSection': getSpotWithThisStratSection,
      'getSpotsWithStratSections': getSpotsWithStratSections,
      'getStratSectionIntervals': getStratSectionIntervals,
      'getStratSectionSettings': getStratSectionSettings,
      'getStratSectionSpots': getStratSectionSpots,
      'isMappedInterval': isMappedInterval,
      'isInterval': isInterval,
      'moveIntervalToAfter': moveIntervalToAfter,
      'orderStratSectionIntervals': orderStratSectionIntervals,
      'validateNewInterval': validateNewInterval
    };

    /**
     * Private Functions
     */

    // Calculate the geometry for an interval (single bed or interbedded)
    function calculateIntervalGeometry(stratSectionId, sedData, minY) {
      var character = sedData.character;
      var interval = sedData.interval;
      var bedding = sedData.bedding;

      var intervalHeight = interval.interval_thickness * yMultiplier;
      var intervalWidth = getIntervalWidth(sedData, stratSectionId);
      var minX = 0;
      var maxX = minX + intervalWidth;
      var maxY = minY + intervalHeight;

      var geometry = {};
      geometry = {
        'type': 'Polygon',
        'coordinates': [[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]]
      };

      // If interbedded need to create a geometry collection with polygons for each bed
      if ((character === 'interbedded' || character === 'bed_mixed_lit') && bedding && bedding.beds &&
        bedding.beds[1] && (bedding.beds[1].avg_thickness && bedding.beds[1].avg_thickness > 0 ||
          (bedding.beds[1].max_thickness && bedding.beds[1].max_thickness > 0 && bedding.beds[1].min_thickness &&
            bedding.beds[1].min_thickness > 0)) && bedding.interbed_proportion > 0) {
        var thickness = bedding.beds[1].avg_thickness ? bedding.beds[1].avg_thickness : (bedding.beds[1].max_thickness + bedding.beds[1].min_thickness) / 2;

        // Per Casey: Don't use the data from Lithology 1 interbed thickness for plotting since it, along with interval
        // thickness, proportion and Lithology 2 interbed thickness are too many data numbers to plot all faithfully
        //var y2 = 0.0066 * thickness * thickness + 0.0637 * thickness + 0.1385;
        var y2 = thickness * yMultiplier < intervalHeight ? thickness * yMultiplier : intervalHeight;
        var interbedHeight2 = intervalHeight * (bedding.interbed_proportion / 100 || .5);  // secondary interbed
        interbedHeight2 = interbedHeight2 > y2 ? interbedHeight2 : y2;
        var interbedHeight1 = intervalHeight - interbedHeight2;                             // primary interbed

        var numInterbeds2 = interbedHeight2 / y2;
        var y1 = interbedHeight1 / numInterbeds2;

        var interbedIntervalWidth = getIntervalWidth(sedData, stratSectionId, true);
        var maxXBed = intervalWidth;
        var minYBed = angular.copy(minY);
        var maxYBed = angular.copy(minY);
        var currentBedHeight = y1;
        var polyCoords = [];
        while (maxYBed < minY + intervalHeight) {
          maxYBed = minYBed + currentBedHeight <= minY + intervalHeight ? minYBed + currentBedHeight : minY + intervalHeight;
          var coords = [[minX, minYBed], [minX, maxYBed], [maxXBed, maxYBed], [maxXBed, minYBed], [minX, minYBed]];
          polyCoords.push(coords);
          currentBedHeight = currentBedHeight === y1 ? y2 : y1;
          maxXBed = maxXBed === intervalWidth ? interbedIntervalWidth : intervalWidth;
          minYBed = angular.copy(maxYBed);
        }

        var geometries = [];
        _.each(polyCoords, function (polyCoord) {
          geometries.push({
            'type': 'Polygon',
            'coordinates': [polyCoord]
          });
        });

        geometry = {
          'type': 'GeometryCollection',
          'geometries': geometries
        };
      }
      else if (character === 'interbedded' || character === 'bed_mixed_lit') {
        $log.log('Not enough data to properly draw interval', sedData);
        $ionicPopup.alert({
          'title': 'Data Error!',
          'template': 'Not enough data to properly draw this interval.'
        });
      }
      return geometry;
    }

    // X-Axis
    function drawAxisX(ctx, pixelRatio, yAxisHeight, labels, spacing, color) {
      var p = getPixel([-10, 0], pixelRatio);
      ctx.moveTo(p.x, p.y);
      var xAxisLength = (_.size(labels) + 1) * xInterval;
      p = getPixel([xAxisLength, 0], pixelRatio);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Create Grain Size Labels for X Axis
      ctx.textAlign = "right";
      ctx.lineWidth = 3;

      _.each(labels, function (label, i) {
        var x = (i + spacing) * xInterval;

        // Tick Mark
        ctx.beginPath();
        ctx.setLineDash([]);
        p = getPixel([x, 0], pixelRatio);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, -5], pixelRatio);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Label
        ctx.save();
        p = getPixel([x, -5], pixelRatio);
        ctx.translate(p.x, p.y);
        ctx.rotate(-Math.PI / 2);
        if (color) ctx.fillStyle = color;
        ctx.fillText(label + ' ', 0, 0);
        ctx.restore();

        // Vertical Dashed Line
        ctx.beginPath();
        ctx.setLineDash([5]);
        p = getPixel([x, 0], pixelRatio);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, yAxisHeight], pixelRatio);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
    }

    // X Axis Stacked
    function drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, spacing, y, color, profile) {
      var p = y === 0 ? getPixel([-10, y], pixelRatio) : getPixel([0, y], pixelRatio);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      var xAxisLength = (_.size(labels) + spacing) * xInterval;
      p = getPixel([xAxisLength, y], pixelRatio);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = color;
      ctx.stroke();

      // Create Grain Size Labels for X Axis
      ctx.textAlign = 'left';
      ctx.lineWidth = 3;

      // Line and label for x-axis group
      ctx.beginPath();
      p = getPixel([0, y], pixelRatio);
      ctx.moveTo(p.x, p.y);
      p = getPixel([0, y - 40], pixelRatio);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.save();
      p = getPixel([-2, y - 2], pixelRatio);
      ctx.translate(p.x, p.y);
      ctx.rotate(270 * Math.PI / 180);     // text at 270 degrees
      ctx.fillStyle = color;
      ctx.textAlign = 'right';
      ctx.fillText(profile, 0, 0);
      ctx.restore();

      _.each(labels, function (label, i) {
        var x = (i + spacing) * xInterval;

        // Tick Mark
        ctx.beginPath();
        ctx.setLineDash([]);
        p = getPixel([x, y], pixelRatio);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, y - 4], pixelRatio);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = color;
        ctx.stroke();

        // Label
        ctx.save();
        p = getPixel([x, y - 5], pixelRatio);
        ctx.translate(p.x, p.y);
        ctx.rotate(30 * Math.PI / 180);     // text at 30 degrees
        ctx.fillStyle = color;
        ctx.fillText(label, 0, 0);
        ctx.restore();

        // Vertical Dashed Line
        ctx.beginPath();
        ctx.setLineDash([5]);
        p = getPixel([x, 0], pixelRatio);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, yAxisHeight], pixelRatio);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'color';
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function getIntervalWidth(sedData, stratSectionId, interbed) {
      var character = sedData.character;
      var interval = sedData.interval;
      var lithologies = sedData.lithologies;
      var n = interbed ? 1 : 0;

      var defaultWidth = xInterval / 4;
      var i, intervalWidth = defaultWidth;
      // Unexposed/Covered
      if (character === 'unexposed_cove' || character === 'not_measured') intervalWidth = (0 + 1) * xInterval; // Same as clay
      else if (lithologies[n] && (character === 'bed' || character === 'bed_mixed_lit' || character === 'interbedded' ||
        character === 'package_succe')) {
        var stratSectionSettings = getStratSectionSettings(stratSectionId);
        // Weathering Column
        if (stratSectionSettings.column_profile === 'weathering_pro') {
          i = _.findIndex(grainSizeOptions.weathering, function (weatheringOption) {
            return weatheringOption.value === lithologies[n].relative_resistance_weather;
          });
          intervalWidth = i === -1 ? defaultWidth : (i + 1) * xInterval;
        }
        // Basic Lithologies Column Profile
        else if (stratSectionSettings.column_profile === 'basic_lithologies') {
          if (lithologies[n].primary_lithology === 'organic_coal') i = 1;
          else if (lithologies[n].mud_silt_grain_size) i = 2;
          else if (lithologies[n].sand_grain_size) i = 3;
          else if (lithologies[n].congl_grain_size || lithologies[n].breccia_grain_size) i = 4;
          else if (lithologies[n].dunham_classification) i = 5;
          else i = 0;
          intervalWidth = i === -1 ? defaultWidth : (i + 2) * xInterval;
        }
        // Primary Lithology = siliciclastic
        else if (lithologies[n].primary_lithology === 'siliciclastic' && (lithologies[n].mud_silt_grain_size ||
          lithologies[n].sand_grain_size || lithologies[n].congl_grain_size || lithologies[n].breccia_grain_size)) {
          i = _.findIndex(grainSizeOptions.clastic, function (grainSizeOption) {
            return grainSizeOption.value === lithologies[n].mud_silt_grain_size ||
              grainSizeOption.value === lithologies[n].sand_grain_size ||
              grainSizeOption.value === lithologies[n].congl_grain_size ||
              grainSizeOption.value === lithologies[n].breccia_grain_size;
          });
          intervalWidth = i === -1 ? defaultWidth : (i + 1) * xInterval;
        }
        // Primary Lithology = limestone or dolostone
        else if ((lithologies[n].primary_lithology === 'limestone' || lithologies[n].primary_lithology === 'dolostone')
          && lithologies[n].dunham_classification) {
          i = _.findIndex(grainSizeOptions.carbonate, function (grainSizeOption) {
            return grainSizeOption.value === lithologies[n].dunham_classification;
          });
          intervalWidth = i === -1 ? defaultWidth : (i + 2.33) * xInterval;
        }
        // Other Lithologies
        else {
          i = _.findIndex(grainSizeOptions.lithologies, function (grainSizeOption) {
            return grainSizeOption.value === lithologies[n].primary_lithology;
          });
          i = i - 3; // First 3 indexes are siliciclastic, limestone & dolostone which are handled above
          intervalWidth = i === -1 ? defaultWidth : (i + 2.66) * xInterval;
        }
      }
      else $log.error('Sed data error:', lithologies[n]);
      return intervalWidth;
    }

    // Get pixel coordinates from map coordinates
    function getPixel(coord, pixelRatio) {
      var map = MapSetupFactory.getMap();
      return {
        'x': map.getPixelFromCoordinate(coord)[0] * pixelRatio,
        'y': map.getPixelFromCoordinate(coord)[1] * pixelRatio
      };
    }

    // Get the height (y) of the whole section
    function getSectionHeight() {
      var intervalSpots = getStratIntervalSpots();
      var sectionHeight = 0;
      _.each(intervalSpots, function (intervalSpot) {
        var extent = intervalSpot.getGeometry().getExtent();
        sectionHeight = extent[3] > sectionHeight ? extent[3] : sectionHeight;
      });
      return sectionHeight;
    }

    // Get only Spots that are intervals
    function getStratIntervalSpots() {
      var intervalSpots = [];
      var featureLayer = MapLayerFactory.getFeatureLayer();
      _.each(featureLayer.getLayers().getArray(), function (layer) {
        _.each(layer.getSource().getFeatures(), function (feature) {
          if (feature.get('surface_feature') &&
            feature.get('surface_feature')['surface_feature_type'] === 'strat_interval') {
            intervalSpots.push(feature);
          }
        });
      });
      return intervalSpots;
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    // The 2nd param, data, is used in the eval method
    // This copied from Form Factory and modified to use data instead of properties
    function isRelevant(relevant, data) {
      if (!relevant) return true;

      relevant = relevant.replace(/selected\(\$/g, '_.contains(');
      relevant = relevant.replace(/\$/g, '');
      relevant = relevant.replace(/{/g, 'data.');
      relevant = relevant.replace(/}/g, '');
      relevant = relevant.replace(/''/g, 'undefined');
      relevant = relevant.replace(/ = /g, ' == ');
      relevant = relevant.replace(/ or /g, ' || ');
      relevant = relevant.replace(/ and /g, ' && ');

      try {
        return eval(relevant);
      } catch (e) {
        return false;
      }
    }

    // Move Spot up or down by a given number of pixels (a positive number for pixels to move up or negative for down)
    function moveSpotByPixels(spot, pixels) {
      if (spot.geometry.type === 'Point') spot.geometry.coordinates[1] = spot.geometry.coordinates[1] + pixels;
      else if (spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiPoint') {
        _.each(spot.geometry.coordinates, function (pointCoords, i) {
          spot.geometry.coordinates[i][1] = pointCoords[1] + pixels;
        });
      }
      else if (spot.geometry.type === 'Polygon' || spot.geometry.type === 'MultiLineString') {
        _.each(spot.geometry.coordinates, function (lineCoords, l) {
          _.each(lineCoords, function (pointCoords, i) {
            spot.geometry.coordinates[l][i][1] = pointCoords[1] + pixels;
          });
        });
      }
      else if (spot.geometry.type === 'MultiPolygon') {
        _.each(spot.geometry.coordinates, function (polygonCoords, p) {
          _.each(polygonCoords, function (lineCoords, l) {
            _.each(lineCoords, function (pointCoords, i) {
              spot.geometry.coordinates[p][l][i][1] = pointCoords[1] + pixels;
            });
          });
        });
      }
      // Interbedded (Geometry Collections)
      else if (spot.geometry.type === 'GeometryCollection') {
        _.each(spot.geometry.geometries, function (geometry, g) {
          _.each(geometry.coordinates, function (lineCoords, l) {
            _.each(lineCoords, function (pointCoords, i) {
              spot.geometry.geometries[g].coordinates[l][i][1] = pointCoords[1] + pixels;
            });
          });
        });
      }
      return spot;
    }

    // Move all Spots (except excluded Spot, if given) in a specified Strat Section
    // up after cutoff (if pixels is positive) or down after cutoff (if pixels is negative)
    function moveSpotsUpOrDownByPixels(stratSectionId, cutoff, pixels, excludedSpotId) {
      var promises = [];
      var intervals = getStratSectionIntervals(stratSectionId);
      var otherSpots = getStratSectionNonIntervals(stratSectionId);
      var spots = _.union(intervals, otherSpots);
      spots = _.reject(spots, function (spot) {
        return excludedSpotId && spot.properties.id === excludedSpotId;
      });
      _.each(spots, function (spot, h) {
        var extent = new ol.format.GeoJSON().readFeature(spot).getGeometry().getExtent();
        if (extent[1] >= cutoff) {
          spots[h] = moveSpotByPixels(spot, pixels);
          promises.push(SpotFactory.save(spots[h]));
        }
      });
      return $q.all(promises);
    }


    // Recalculate the geometry of an interval using spot properties
    function recalculateIntervalGeometry(spot) {
      try {
        var extent = new ol.format.GeoJSON().readFeature(spot).getGeometry().getExtent();
        spot.geometry = calculateIntervalGeometry(spot.properties.strat_section_id, spot.properties.sed, extent[1]);
        $log.log('Recalculated Spot geometry');
      }
      catch(e) {
        $log.log('Error reading Spot geometry', spot, e);
      }
      return spot;
    }

    /**
     * Public Functions
     */

    // Column Profile has been changed from Grain Size to Weathering or vice versa so update interval width
    function changedColumnProfile(stratSectionId) {
      var stratSectionIntervals = getStratSectionIntervals(stratSectionId);
      _.each(stratSectionIntervals, function (stratSectionInterval) {
        var extent = new ol.format.GeoJSON().readFeature(stratSectionInterval).getGeometry().getExtent();
        stratSectionInterval.geometry = calculateIntervalGeometry(stratSectionId, stratSectionInterval.properties.sed,
          extent[1]);
        SpotFactory.save(stratSectionInterval);
        $log.log('Recalculated Spot geometry');
      });
    }

    // Check for any changes we need to make to the Sed fields or geometry when a Spot that is a strat interval
    // has fields that are changed
    function checkForIntervalUpdates(state, spot, savedSpot) {
      var i, extent;
      var needToRecalculateIntervalGeometry = false;      // Do we need to recalculate the geometry for the interval?
      if (spot.geometry && spot.properties.sed && savedSpot.properties.sed) {
        var sedData = spot.properties.sed;
        var sedDataSaved = savedSpot.properties.sed;

        // Current state is spot tab
        if (state === 'app.spotTab.spot') {
          // Calculate interval thickness if Spot has geometry and the surface feature type changed to strat interval
          if (!savedSpot.properties.surface_feature || !savedSpot.properties.surface_feature.surface_feature_type ||
            savedSpot.properties.surface_feature.surface_feature_type !== 'strat_interval') {
            if (spot.geometry) {
              if (!spot.properties.sed) spot.properties.sed = {};
              if (!spot.properties.sed.interval) spot.properties.sed.interval = {};
              $log.log('Updating interval thickness ...');
              extent = new ol.format.GeoJSON().readFeature(spot).getGeometry().getExtent();
              var thickness = (extent[3] - extent[1]) / yMultiplier; // 20 is yMultiplier
              thickness = HelpersFactory.roundToDecimalPlaces(thickness, 2);
              spot.properties.sed.interval.interval_thickness = thickness;
              var spotWithThisStratSection = getSpotWithThisStratSection(spot.properties.strat_section_id);
              if (spotWithThisStratSection.properties && spotWithThisStratSection.properties.sed &&
                spotWithThisStratSection.properties.sed.strat_section) {
                spot.properties.sed.interval.thickness_units =
                  spotWithThisStratSection.properties.sed.strat_section.column_y_axis_units;
              }
              if (!spot.properties.sed.character) spot.properties.sed.character = 'unexposed_cove';
            }
          }
        }

          // Check for changes to certain fields which would require recalculation of the interval geometry
        // If current state is sed-interval tab
        else if (state === 'app.spotTab.sed-interval') {
          var intervalFields = ['character', 'interval_thickness', 'thickness_units'];
          needToRecalculateIntervalGeometry = _.find(intervalFields, function (field) {
            if (field === 'character' && sedData[field] && sedDataSaved[field]) {
              return ((sedData[field] === 'bed' || sedData[field] === 'package_succe') &&
                !(sedDataSaved[field] === 'bed' || sedDataSaved[field] === 'package_succe')) ||
                ((sedData[field] === 'unexposed_cove' || sedData[field] === 'not_measured') &&
                  !(sedDataSaved[field] === 'unexposed_cove' || sedDataSaved[field] === 'not_measured')) ||
                ((sedData[field] === 'interbedded' || sedData[field] === 'bed_mixed_lit') &&
                  !(sedDataSaved[field] === 'interbedded' || sedDataSaved[field] === 'bed_mixed_lit'));
            }
            else return sedData.interval[field] && sedDataSaved.interval[field] &&
              sedData.interval[field] !== sedDataSaved.interval[field];
          });
        }
        // If current state is sed-lithologies tab
        else if (state === 'app.spotTab.sed-lithologies') {
          var lithologiesFields = ['primary_lithology', 'siliciclastic_type', 'mud_silt_grain_size', 'sand_grain_size',
            'congl_grain_size', 'breccia_grain_size', 'dunham_classification', 'relative_resistance_weather'];
          needToRecalculateIntervalGeometry = _.find(lithologiesFields, function (field) {
            var isEqualLithologyField = sedData.lithologies && sedDataSaved.lithologies &&
              (sedData.lithologies[0] && sedData.lithologies[0][field] && sedDataSaved.lithologies[0] &&
                sedDataSaved.lithologies[0][field] &&
                sedData.lithologies[0][field] === sedDataSaved.lithologies[0][field]) &&
              (sedData.lithologies[1] && sedData.lithologies[1][field] && sedDataSaved.lithologies[1] &&
                sedDataSaved.lithologies[1][field] &&
                sedData.lithologies[1][field] === sedDataSaved.lithologies[0][field]);
            return !(_.isUndefined(isEqualLithologyField) || isEqualLithologyField);
          });
        }
        // If current state is sed-bedding tab
        else if (state === 'app.spotTab.sed-bedding') {
          var beddingFields = ['interbed_proportion_change', 'interbed_proportion', 'lithology_at_bottom_contact',
            'lithology_at_top_contact', 'thickness_of_individual_beds', 'avg_thickness', 'max_thickness',
            'min_thickness'];
          needToRecalculateIntervalGeometry = _.find(beddingFields, function (field) {
            var isEqualBeddingField;
            if (field !== 'avg_thickness' && field !== 'max_thickness' && field !== 'min_thickness') {
              isEqualBeddingField = sedData.bedding && sedData.bedding[field] && sedDataSaved.bedding &&
                sedDataSaved.bedding[field] && sedData.bedding[field] === sedDataSaved.bedding[field];
            }
            else {
              isEqualBeddingField = sedData.bedding && sedDataSaved.bedding && sedData.bedding.beds &&
                sedDataSaved.bedding.beds &&
                ((sedData.bedding.beds[0] && sedData.bedding.beds[0][field] && sedDataSaved.bedding.beds[0] &&
                  sedDataSaved.bedding.beds[0][field] &&
                  sedData.bedding.beds[0][field] === sedDataSaved.bedding.beds[0][field]) &&
                  (sedData.bedding.beds[1] && sedData.bedding.beds[1][field] && sedDataSaved.bedding.beds[1] &&
                    sedDataSaved.bedding.beds[1][field] &&
                    sedData.bedding.beds[1][field] === sedDataSaved.bedding.beds[1][field]))
            }
            return !(_.isUndefined(isEqualBeddingField) || isEqualBeddingField);
          });
        }
        if (needToRecalculateIntervalGeometry) {
          spot = recalculateIntervalGeometry(spot);
          // Move above intervals up or down if interval thickness changed
          if (sedData.interval && sedData.interval.interval_thickness && sedDataSaved.interval &&
            sedDataSaved.interval.interval_thickness) {
            var targetIntervalExtent = new ol.format.GeoJSON().readFeature(spot).getGeometry().getExtent();
            var savedSpotIntervalExtent = new ol.format.GeoJSON().readFeature(savedSpot).getGeometry().getExtent();
            var diff = targetIntervalExtent[3] - savedSpotIntervalExtent[3];
            if (sedData.interval.interval_thickness > sedDataSaved.interval.interval_thickness) {
              // Move above spots up
              moveSpotsUpOrDownByPixels(spot.properties.strat_section_id, savedSpotIntervalExtent[3], diff,
                spot.properties.id);
            }
            else if (sedData.interval.interval_thickness < sedDataSaved.interval.interval_thickness) {
              // Move above spots down
              moveSpotsUpOrDownByPixels(spot.properties.strat_section_id, targetIntervalExtent[3], diff,
                spot.properties.id);
            }
          }
        }
      }
      return spot;
    }

    // Create a new strat section interval, separating the fields to their respective objects
    function createInterval(stratSectionId, data) {
      var geojsonObj = {};
      geojsonObj.properties = {
        'strat_section_id': stratSectionId,
        'surface_feature': {'surface_feature_type': 'strat_interval'},
        'sed': {}
      };
      if (data.interval_type) geojsonObj.properties.sed.character = data.interval_type;

      // Interval fields in Add Interval
      var intervalSurvey = DataModelsFactory.getDataModel('sed')['interval'].survey;
      var intervalFieldNames = _.pluck(intervalSurvey, 'name');
      var intervalFields = _.pick(data, _.without(intervalFieldNames, 'interval_type'));
      if (!_.isEmpty(intervalFields)) geojsonObj.properties.sed.interval = intervalFields;

      // Bedding fields in Add Interval
      var beddingSurvey = DataModelsFactory.getDataModel('sed')['bedding'].survey;
      var beddingFieldNames = _.pluck(beddingSurvey, 'name');
      var beddingFields = [];
      _.map(data, function (value, key) {
        if (key.slice(-2) !== '_1' && _.contains(beddingFieldNames, key)) {
          if (!beddingFields[0]) beddingFields.push({});
          beddingFields[0][key] = value;
        }
        else if (key.slice(-2) === '_1' && _.contains(beddingFieldNames, key.slice(0, -2))) {
          if (!beddingFields[0]) beddingFields.push({});
          if (!beddingFields[1]) beddingFields.push({});
          beddingFields[1][key.slice(0, -2)] = value;
        }
      });
      if (!_.isEmpty(beddingFields)) geojsonObj.properties.sed.bedding = {'beds': beddingFields};

      var beddingSharedSurvey = DataModelsFactory.getDataModel('sed')['bedding_shared'].survey;
      var beddingSharedFieldNames = _.pluck(beddingSharedSurvey, 'name');
      var beddingSharedFields = _.pick(data, beddingSharedFieldNames);
      if (!_.isEmpty(beddingSharedFields)) _.extend(geojsonObj.properties.sed.bedding, beddingSharedFields);

      // Lithologies fields in Add Interval (only fields from Lithology & Texture needed)
      var lithologiesLithologySurvey = DataModelsFactory.getDataModel('sed')['lithologies_lithology'].survey;
      var lithologiesTextureSurvey = DataModelsFactory.getDataModel('sed')['lithologies_texture'].survey;
      var lithologiesLithologyFieldNames = _.pluck(lithologiesLithologySurvey, 'name');
      var lithologiesTextureFieldNames = _.pluck(lithologiesTextureSurvey, 'name');
      var lithologiesFieldNames = _.union(lithologiesLithologyFieldNames, lithologiesTextureFieldNames);
      var lithologiesFields = [];
      _.map(data, function (value, key) {
        if (key.slice(-2) !== '_1' && _.contains(lithologiesFieldNames, key)) {
          if (!lithologiesFields[0]) lithologiesFields.push({});
          lithologiesFields[0][key] = value;
        }
        else if (key.slice(-2) === '_1' && _.contains(lithologiesFieldNames, key.slice(0, -2))) {
          if (!lithologiesFields[0]) lithologiesFields.push({});
          if (!lithologiesFields[1]) lithologiesFields.push({});
          lithologiesFields[1][key.slice(0, -2)] = value;
        }
      });
      if (!_.isEmpty(lithologiesFields)) geojsonObj.properties.sed.lithologies = lithologiesFields;

      geojsonObj.geometry = calculateIntervalGeometry(stratSectionId, geojsonObj.properties.sed, getSectionHeight());
      return geojsonObj;
    }

    // Move intervals and Spots in column down to close gap after target interval deleted
    function deleteInterval(targetInterval) {
      try {
        var targetIntervalExtent = new ol.format.GeoJSON().readFeature(targetInterval).getGeometry().getExtent();
        var targetIntervalHeight = targetIntervalExtent[3] - targetIntervalExtent[1];
        return moveSpotsUpOrDownByPixels(targetInterval.properties.strat_section_id, targetIntervalExtent[3],
          -targetIntervalHeight).then(function () {
          return SpotFactory.destroy(targetInterval.properties.id);
        });
      } catch (e) {
        // Unable to move other interval up or down to close gap
        return SpotFactory.destroy(targetInterval.properties.id);
      }
    }

    function drawAxes(ctx, pixelRatio, stratSection) {
      ctx.font = "30px Arial";

      var map = MapSetupFactory.getMap();
      var zoom = map.getView().getZoom();

      // Y Axis
      var currentSectionHeight = getSectionHeight();
      var yAxisHeight = currentSectionHeight + 40;

      ctx.beginPath();
      ctx.setLineDash([]);
      var p = getPixel([0, 0], pixelRatio);
      ctx.moveTo(p.x, p.y);
      p = getPixel([0, yAxisHeight], pixelRatio);
      ctx.lineTo(p.x, p.y);

      // Tick Marks for Y Axis
      _.times(Math.floor(yAxisHeight / yMultiplier) + 1, function (i) {
        var y = i * yMultiplier;
        p = i === 0 ? getPixel([-15, 0], pixelRatio) : getPixel([-10, y], pixelRatio);
        if (i === 0 || zoom >= 5 || (zoom < 5 && zoom > 2 && i % 5 === 0) || (zoom <= 2 && i % 10 === 0)) {
          ctx.textAlign = 'right';
          if (i === 0 && stratSection.column_y_axis_units) {
            ctx.fillText('0 ' + stratSection.column_y_axis_units, p.x, p.y);
          }
          else ctx.fillText(i, p.x, p.y);
          p = getPixel([-5, y], pixelRatio);
          ctx.moveTo(p.x, p.y);
          p = getPixel([0, y], pixelRatio);
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();

      // Tick Marks for Intervals
      // Only show tick marks if zoom level is 6 or greater
      if (zoom >= 6) {
        var intervalSpots = getStratIntervalSpots();
        _.each(intervalSpots, function (intervalSpot) {
          var extent = intervalSpot.getGeometry().getExtent();
          var y = extent[3];
          var label = HelpersFactory.roundToDecimalPlaces(extent[3] / yMultiplier, 2);
          if (!Number.isInteger(label)) {
            p = getPixel([-3, y], pixelRatio);
            ctx.textAlign = 'right';
            ctx.fillText(label, p.x, p.y);
            p = getPixel([-2, y], pixelRatio);
            ctx.moveTo(p.x, p.y);
            p = getPixel([0, y], pixelRatio);
            ctx.lineTo(p.x, p.y);
          }
        });
        ctx.stroke();
      }

      // Setup to draw X Axis
      var labels = {};
      var y = 0;
      var a = 174.5;
      var b = -40.5;
      var c = 2.5;
      var x = zoom;
      if (stratSection.column_profile === 'clastic') {
        labels = _.pluck(grainSizeOptions.clastic, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 1, y, 'black', stratSection.column_profile);
        y += (a + b * x + c * x * x) * -1
      }
      else if (stratSection.column_profile === 'carbonate') {
        labels = _.pluck(grainSizeOptions.carbonate, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.33);
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 2.33, y, 'blue', stratSection.column_profile);
        y += (a + b * x + c * x * x) * -1
      }
      else if (stratSection.column_profile === 'mixed_clastic') {
        labels = _.pluck(grainSizeOptions.clastic, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 1, y, 'black', 'clastic');
        y += (a + b * x + c * x * x) * -1;
        labels = _.pluck(grainSizeOptions.carbonate, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.33, 'blue');
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 2.33, y, 'blue', 'carbonate');
        y += (a + b * x + c * x * x) * -1
      }
      else if (stratSection.column_profile === 'basic_lithologies') {
        labels = basicLitholigiesLabels;
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 2, y, 'black', stratSection.column_profile);
        y += (a + b * x + c * x * x) * -1
      }
      else if (stratSection.column_profile === 'weathering_pro') {
        labels = _.pluck(grainSizeOptions.weathering, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 1, y, 'black', 'weathering');
        y += (a + b * x + c * x * x) * -1
      }
      else $log.error('Incorrect profile type:', stratSection.column_profile);

      if (stratSection.misc_labels === true) {
        labels = _.pluck(grainSizeOptions.lithologies, 'label');
        labels = _.rest(labels, 3);
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.66, 'green');
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 2.66, y, 'green', 'misc.');
      }
    }

    // Extract the data from the Spot object in the format needed for the Add Interval modal
    function extractAddIntervalData(sedData) {
      var addIntervalSurvey = DataModelsFactory.getDataModel('sed')['add_interval'].survey;
      var addIntervalFieldNames = _.pluck(addIntervalSurvey, 'name');

      // Interval
      var data = _.pick(sedData.interval, addIntervalFieldNames);

      // Lithologies
      if (sedData.lithologies && sedData.lithologies[0]) _.extend(data,
        _.pick(sedData.lithologies[0], addIntervalFieldNames));
      if (sedData.lithologies && sedData.lithologies[1]) {
        var tempLith2 = _.pick(sedData.lithologies[1], addIntervalFieldNames);
        var tempLith2Renamed = {};
        _.each(tempLith2, function (value, key) {
          tempLith2Renamed[key + '_1'] = value;
        });
        if (!_.isEmpty(tempLith2Renamed)) _.extend(data, tempLith2Renamed);
      }

      // Bedding
      if (sedData.bedding) _.extend(data, _.pick(sedData.bedding, addIntervalFieldNames));
      if (sedData.bedding && sedData.bedding.beds && sedData.bedding.beds[0]) {
        _.extend(data, _.pick(sedData.bedding.beds[0], addIntervalFieldNames));
      }
      if (sedData.bedding && sedData.bedding.beds && sedData.bedding.beds[0]) {
        var tempBed2 = _.pick(sedData.bedding.beds[0], addIntervalFieldNames);
        var tempBed2Renamed = {};
        _.each(tempBed2, function (value, key) {
          tempBed2Renamed[key + '_1'] = value;
        });
        if (!_.isEmpty(tempBed2Renamed)) _.extend(data, tempBed2Renamed);
      }

      // Character
      if (sedData.character) data['interval_type'] = sedData.character;
      return data;
    }

    // Gather all Spots Mapped on this Strat Section
    function gatherStratSectionSpots(stratSectionId) {
      var activeSpots = SpotFactory.getActiveSpots();
      stratSectionSpots = _.filter(activeSpots, function (spot) {
        return spot.properties.strat_section_id == stratSectionId; // Comparing int to string so use only 2 equal signs
      });
      // Remove spots that don't have a geometry defined (this case should never happen)
      stratSectionSpots = _.reject(stratSectionSpots, function (spot) {
        if (!_.has(spot, 'geometry')) $log.error('No Geometry for Spot:', spot);
        return !_.has(spot, 'geometry');
      });
    }

    // Gather all Spots that have Strat Sections
    function gatherSpotsWithStratSections() {
      var activeSpots = SpotFactory.getActiveSpots();
      spotsWithStratSections = _.filter(activeSpots, function (spot) {
        return _.has(spot.properties, 'sed') && _.has(spot.properties.sed, 'strat_section');
      });
    }

    // Get the Spot that Contains a Specific Strat Section Given the Id of the Strat Section
    function getSpotWithThisStratSection(stratSectionId) {
      var activeSpots = SpotFactory.getActiveSpots();
      return _.find(activeSpots, function (spot) {
        return _.has(spot, 'properties') && _.has(spot.properties, 'sed') &&
          _.has(spot.properties.sed, 'strat_section') &&
          spot.properties.sed.strat_section.strat_section_id == stratSectionId;  // Comparing int to string so use only 2 equal signs
      });
    }

    function getStratSectionIntervals(stratSectionId) {
      gatherStratSectionSpots(stratSectionId);
      // Separate the Strat Section Spots into the Interval Spots and other Spots
      var stratSectionSpotsPartitioned = _.partition(stratSectionSpots, function (spot) {
        return spot.properties.surface_feature &&
          spot.properties.surface_feature.surface_feature_type === 'strat_interval';
      });
      return stratSectionSpotsPartitioned[0];
    }

    function getStratSectionNonIntervals(stratSectionId) {
      gatherStratSectionSpots(stratSectionId);
      // Separate the Strat Section Spots into the Interval Spots and other Spots
      var stratSectionSpotsPartitioned = _.partition(stratSectionSpots, function (spot) {
        return spot.properties.surface_feature &&
          spot.properties.surface_feature.surface_feature_type === 'strat_interval';
      });
      return stratSectionSpotsPartitioned[1];
    }

    function getStratSectionSettings(stratSectionId) {
      var spot = getSpotWithThisStratSection(stratSectionId);
      return spot && spot.properties && spot.properties.sed && spot.properties.sed.strat_section ? spot.properties.sed.strat_section : undefined;
    }

    function getStratSectionSpots() {
      return stratSectionSpots;
    }

    function getSpotsWithStratSections() {
      return spotsWithStratSections;
    }

    function isInterval(spot) {
      return _.has(spot, 'properties') && _.has(spot.properties, 'surface_feature') &&
        _.has(spot.properties.surface_feature, 'surface_feature_type') &&
        spot.properties.surface_feature.surface_feature_type === 'strat_interval';
    }

    function isMappedInterval(spot) {
      return _.has(spot, 'properties') && _.has(spot.properties, 'strat_section_id') &&
        _.has(spot.properties, 'surface_feature') && _.has(spot.properties.surface_feature, 'surface_feature_type') &&
        spot.properties.surface_feature.surface_feature_type === 'strat_interval';
    }

    // Move target interval to after given interval (the preceding interval)
    function moveIntervalToAfter(targetInterval, precedingInterval) {
      var targetIntervalExtent = new ol.format.GeoJSON().readFeature(targetInterval).getGeometry().getExtent();
      var targetIntervalHeight = targetIntervalExtent[3] - targetIntervalExtent[1];
      $log.log('interval to move:', targetInterval, 'height:', targetIntervalHeight);

      // Move new interval (to bottom if id of precedingInterval is 0)
      var minY = 0;
      if (precedingInterval.properties.id !== 0) {
        var precedingIntervalExtent = new ol.format.GeoJSON().readFeature(precedingInterval).getGeometry().getExtent();
        minY = precedingIntervalExtent[3];
      }
      var maxY = minY + targetIntervalHeight;
      // Regular interval (polygon geometry)
      if (targetInterval.geometry.type !== 'GeometryCollection') {
        var targetIntervalCoords = targetInterval.geometry.coordinates;
        targetIntervalCoords[0][0][1] = targetIntervalCoords[0][3][1] = targetIntervalCoords[0][4][1] = minY;
        targetIntervalCoords[0][1][1] = targetIntervalCoords[0][2][1] = maxY;
      }
      // Interbedded interval (geometry collection)
      else {
        _.each(targetInterval.geometry.geometries, function (geometry, g) {
          var interbedExtent = new ol.format.GeoJSON().readFeature(
            targetInterval.geometry.geometries[g]).getGeometry().getExtent();
          var newInterbedHeight = interbedExtent[3] - interbedExtent[1];
          maxY = minY + newInterbedHeight;
          targetInterval.geometry.geometries[g].coordinates[0][0][1] = minY;
          targetInterval.geometry.geometries[g].coordinates[0][1][1] = maxY;
          targetInterval.geometry.geometries[g].coordinates[0][2][1] = maxY;
          targetInterval.geometry.geometries[g].coordinates[0][3][1] = minY;
          targetInterval.geometry.geometries[g].coordinates[0][4][1] = minY;
          minY = maxY;
        });
      }
      $log.log('interval w new geom:', targetInterval);
      targetIntervalExtent = new ol.format.GeoJSON().readFeature(targetInterval).getGeometry().getExtent();
      return SpotFactory.save(targetInterval).then(function () {
        return moveSpotsUpOrDownByPixels(targetInterval.properties.strat_section_id, targetIntervalExtent[1],
          targetIntervalHeight, targetInterval.properties.id);
      });
    }

    function orderStratSectionIntervals(intervals) {
      var orderedIntervals = [];
      _.each(intervals, function (interval) {
        var i = 0;
        while (i <= orderedIntervals.length) {
          if (i === orderedIntervals.length) {
            orderedIntervals.push(interval);
            break;
          }
          else {
            var newExtent = new ol.format.GeoJSON().readFeature(interval).getGeometry().getExtent();
            var curExtent = new ol.format.GeoJSON().readFeature(orderedIntervals[i]).getGeometry().getExtent();
            if (newExtent[3] >= curExtent[3]) {
              orderedIntervals.splice(i, 0, interval);
              break;
            }
            var nextExtent = new ol.format.GeoJSON().readFeature(orderedIntervals[i]).getGeometry().getExtent();
            if (newExtent[3] < curExtent[3] && newExtent[3] >= nextExtent[3]) {
              orderedIntervals.splice(i, 0, interval);
              break;
            }
          }
          i++;
        }
      });
      return orderedIntervals;
    }

    // We can't use validation in Form Factory for the Add Interval Modal because of the sidepanel in the Web
    // version. With the side panel and the open modal there are multiple form elements with the same ID
    // - bad HTML but this is how it is now - so we can't easily grab the proper element for validation.
    // Below code copied from Form Factory and modified.
    function validateNewInterval(data, form) {
      if (_.isEmpty(data)) return true;
      $log.log('Validating new interval with data:', data);
      var errorMessages = [];
      // If a field is visible and required but empty give the user an error message and return to the form
      _.each(form.survey, function (field) {
        if (field.name && isRelevant(field.relevant, data)) {
          if (field.required === 'true' && !data[field.name]) {
            errorMessages.push('<b>' + field.label + '</b>: Required!');
          }
        }
        else delete data[field.name];
      });

      if (_.isEmpty(errorMessages)) return true;
      else {
        $ionicPopup.alert({
          'title': 'Validation Error!',
          'template': 'Fix the following errors before continuing:<br>' + errorMessages.join('<br>')
        });
        return false;
      }
    }
  }
}());
