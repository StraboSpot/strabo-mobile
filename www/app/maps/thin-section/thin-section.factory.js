(function () {
  'use strict';

  angular
    .module('app')
    .factory('ThinSectionFactory', ThinSectionFactory);

  ThinSectionFactory.$inject = ['$ionicPopup', '$log', '$q', 'DataModelsFactory', 'HelpersFactory', 'MapLayerFactory',
    'MapSetupFactory', 'SpotFactory'];

  function ThinSectionFactory($ionicPopup, $log, $q, DataModelsFactory, HelpersFactory, MapLayerFactory,
                               MapSetupFactory, SpotFactory) {
    var grainSizeOptions = DataModelsFactory.getSedLabelsDictionary();
    var spotsWithThinSections = {};
    var thinSectionSpots = {};
    var xInterval = 10;  // Horizontal spacing between grain sizes/weathering tick marks
    var yMultiplier = 20;  // 1 m interval thickness = 20 pixels

    return {
      'changedColumnProfile': changedColumnProfile,
      'checkForIntervalUpdates': checkForIntervalUpdates,
      //'createInterval': createInterval,
      'drawAxes': drawAxes,
      'gatherSpotsWithThinSections': gatherSpotsWithThinSections,
      'gatherThinSectionSpots': gatherThinSectionSpots,
      'getSpotWithThisThinSection': getSpotWithThisThinSection,
      'getSpotsWithThinSections': getSpotsWithThinSections,
      'getThinSectionIntervals': getThinSectionIntervals,
      'getThinSectionSettings': getThinSectionSettings,
      'getThinSectionSpots': getThinSectionSpots,
      'isInterval': isInterval,
      'orderThinSectionIntervals': orderThinSectionIntervals,
      //'validateNewInterval': validateNewInterval
    };

    /**
     * Private Functions
     */

    // X-Axis
    function drawAxisX(ctx, pixelRatio, yAxisHeight, labels, spacing, color, mapName) {
      var p = getPixel([-10, 0], pixelRatio, mapName);
      ctx.moveTo(p.x, p.y);
      var xAxisLength = (_.size(labels) + 1) * xInterval;
      p = getPixel([xAxisLength, 0], pixelRatio, mapName);
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
        p = getPixel([x, 0], pixelRatio, mapName);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, -5], pixelRatio, mapName);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Label
        ctx.save();
        p = getPixel([x, -5], pixelRatio, mapName);
        ctx.translate(p.x, p.y);
        ctx.rotate(-Math.PI / 2);
        if (color) ctx.fillStyle = color;
        ctx.fillText(label + ' ', 0, 0);
        ctx.restore();

        // Vertical Dashed Line
        ctx.beginPath();
        ctx.setLineDash([5]);
        p = getPixel([x, 0], pixelRatio, mapName);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, yAxisHeight], pixelRatio, mapName);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
    }

    // X Axis Stacked
    function drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, spacing, y, color, profile, mapName) {
      var p = y === 0 ? getPixel([-10, y], pixelRatio, mapName) : getPixel([0, y], pixelRatio, mapName);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      var xAxisLength = (_.size(labels) + 1) * xInterval;
      p = getPixel([xAxisLength, y], pixelRatio, mapName);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = color;
      ctx.stroke();

      // Create Grain Size Labels for X Axis
      ctx.textAlign = 'left';
      ctx.lineWidth = 3;

      // Line and label for x-axis group
      ctx.beginPath();
      p = getPixel([0, y], pixelRatio, mapName);
      ctx.moveTo(p.x, p.y);
      p = getPixel([0, y - 40], pixelRatio, mapName);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.save();
      p = getPixel([-2, y - 2], pixelRatio, mapName);
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
        p = getPixel([x, y], pixelRatio, mapName);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, y - 4], pixelRatio, mapName);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = color;
        ctx.stroke();

        // Label
        ctx.save();
        p = getPixel([x, y - 5], pixelRatio, mapName);
        ctx.translate(p.x, p.y);
        ctx.rotate(30 * Math.PI / 180);     // text at 30 degrees
        ctx.fillStyle = color;
        ctx.fillText(label, 0, 0);
        ctx.restore();

        // Vertical Dashed Line
        ctx.beginPath();
        ctx.setLineDash([5]);
        p = getPixel([x, 0], pixelRatio, mapName);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, yAxisHeight], pixelRatio, mapName);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function getIntervalWidth(lithology, thinSectionId) {
      var defaultWidth = xInterval / 4;
      var i, intervalWidth = defaultWidth;
      // Unexposed/Covered
      if (lithology.is_this_a_bed_or_package === 'unexposed_cove') intervalWidth = (0 + 1) * xInterval; // Same as clay
      else if (lithology.is_this_a_bed_or_package === 'bed' || lithology.is_this_a_bed_or_package === 'interbedded' ||
        lithology.is_this_a_bed_or_package === 'package_succe') {
        // Weathering Column
        var thinSectionSettings = getThinSectionSettings(thinSectionId);
        if (thinSectionSettings.column_profile === 'weathering_pro') {
          i = _.findIndex(grainSizeOptions.weathering, function (weatheringOption) {
            return weatheringOption.value === lithology.relative_resistance_weathering;
          });
          intervalWidth = i === -1 ? defaultWidth : (i + 1) * xInterval;
        }
        // Primary Lithology = siliciclastic
        else if (lithology.mud_silt_principal_grain_size || lithology.sand_principal_grain_size ||
          lithology.congl_principal_grain_size || lithology.breccia_principal_grain_size) {
          i = _.findIndex(grainSizeOptions.clastic, function (grainSizeOption) {
            return grainSizeOption.value === lithology.mud_silt_principal_grain_size ||
              grainSizeOption.value === lithology.sand_principal_grain_size ||
              grainSizeOption.value === lithology.congl_principal_grain_size ||
              grainSizeOption.value === lithology.breccia_principal_grain_size;
          });
          intervalWidth = i === -1 ? defaultWidth : (i + 1) * xInterval;
        }
        // Primary Lithology = limestone or dolomite
        else if (lithology.principal_dunham_class) {
          i = _.findIndex(grainSizeOptions.carbonate, function (grainSizeOption) {
            return grainSizeOption.value === lithology.principal_dunham_class;
          });
          intervalWidth = i === -1 ? defaultWidth : (i + 2) * xInterval;
        }
        // Other Lithologies
        else {
          i = _.findIndex(grainSizeOptions.lithologies, function (grainSizeOption) {
            return grainSizeOption.value === lithology.primary_lithology;
          });
          i = i - 3; // First 3 indexes are siliciclastic, limestone & dolomite which are handled above
          intervalWidth = i === -1 ? defaultWidth : (i + 2) * xInterval;
        }
      }
      else $log.error('Sed data error:', lithology);
      return intervalWidth;
    }

    // Get pixel coordinates from map coordinates
    function getPixel(coord, pixelRatio, mapName) {
      var map = MapSetupFactory.getMap(mapName);
      return {
        'x': map.getPixelFromCoordinate(coord)[0] * pixelRatio,
        'y': map.getPixelFromCoordinate(coord)[1] * pixelRatio
      };
    }

    // Get the height (y) of the whole section
    /*function getSectionHeight() {
      var intervalSpots = getThinIntervalSpots();
      var sectionHeight = 0;
      _.each(intervalSpots, function (intervalSpot) {
        var extent = intervalSpot.getGeometry().getExtent();
        sectionHeight = extent[3] > sectionHeight ? extent[3] : sectionHeight;
      });
      return sectionHeight;
    }*/

    // Get only Spots that are intervals
    /*function getThinIntervalSpots() {
      var intervalSpots = [];
      var featureLayer = MapLayerFactory.getFeatureLayer(mapName);
      _.each(featureLayer.getLayers().getArray(), function (layer) {
        _.each(layer.getSource().getFeatures(), function (feature) {
          if (feature.get('surface_feature') &&
            feature.get('surface_feature')['surface_feature_type'] === 'thin_interval') {
            intervalSpots.push(feature);
          }
        });
      });
      return intervalSpots;
    }*/

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
      }
      catch (e) {
        return false;
      }
    }

    /**
     * Public Functions
     */

    // Column Profile has been changed from Grain Size to Weathering or vice versa so update interval width
    function changedColumnProfile(thinSectionId) {
      var thinSectionIntervals = getThinSectionIntervals(thinSectionId);
      _.each(thinSectionIntervals, function (thinSectionInterval) {
        var intervalWidth = getIntervalWidth(thinSectionInterval.properties.micro.lithologies, thinSectionId);
        var extent = new ol.format.GeoJSON().readFeature(thinSectionInterval).getGeometry().getExtent();
        var minX = 0;
        var maxX = intervalWidth;
        var minY = extent[1];
        var maxY = extent[3];
        thinSectionInterval.geometry.coordinates = [[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]];
        SpotFactory.save(thinSectionInterval);
        $log.log('Recalculated Spot geometry');
      });
    }

    // Check for any changes we need to make to the Sed fields or geometry when a Spot that is a thin interval
    // has fields that are changed
    function checkForIntervalUpdates(state, spot, savedSpot) {
      var i, extent;
      // Current state is spot tab
      if (state === 'app.spotTab.spot') {
        // Calculate interval thickness if Spot has geometry and the surface feature type changed to thin interval
        if (!savedSpot.properties.surface_feature || !savedSpot.properties.surface_feature.surface_feature_type ||
          !savedSpot.properties.surface_feature.surface_feature_type !== 'thin_interval') {
          if (spot.geometry) {
            if (!spot.properties.micro) spot.properties.micro = {};
            if (!spot.properties.micro.lithologies) spot.properties.micro.lithologies = {};
            $log.log('Updating interval thickness ...');
            extent = new ol.format.GeoJSON().readFeature(spot).getGeometry().getExtent();
            var thickness = (extent[3] - extent[1]) / yMultiplier; // 20 is yMultiplier
            thickness = HelpersFactory.roundToDecimalPlaces(thickness, 2);
            spot.properties.micro.lithologies.interval_thickness = thickness;
            var spotWithThisThinSection = getSpotWithThisThinSection(spot.properties.thin_section_id);
            if (spotWithThisThinSection.properties && spotWithThisThinSection.properties.micro &&
              spotWithThisThinSection.properties.micro.thin_section) {
              spot.properties.micro.lithologies.thickness_units =
                spotWithThisThinSection.properties.micro.thin_section.column_y_axis_units;
            }
            if (!spot.properties.micro.lithologies.is_this_a_bed_or_package) {
              spot.properties.micro.lithologies.is_this_a_bed_or_package = 'unexposed_cove';
            }
          }
        }
      }
      // Current state is micro-lithologies tab
      else if (state === 'app.spotTab.micro-lithologies') {
        // Recalculate interval geometry from thickness and width, whether these particular fields changed or not
        if (spot.geometry && spot.properties.micro && spot.properties.micro.lithologies) {
          extent = new ol.format.GeoJSON().readFeature(spot).getGeometry().getExtent();
          var intervalHeight = spot.properties.micro.lithologies.interval_thickness * yMultiplier;
          var intervalWidth = getIntervalWidth(spot.properties.micro.lithologies, spot.properties.thin_section_id);
          var minX = 0;
          var maxX = intervalWidth;
          var minY = extent[1];
          var maxY = minY + intervalHeight;
          spot.geometry.coordinates = [[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]];
          $log.log('Recalculated Spot geometry');
        }
      }
      return spot;
    }

    /*function createInterval(thinSectionId, data) {
      var minX = 0;
      var minY = getSectionHeight();

      var map = MapSetupFactory.getMap();
      var mapHeight = map.getSize()[0];
      var mapWidth = map.getSize()[1];
      var intervalHeight = data.interval_thickness * yMultiplier;
      var intervalWidth = getIntervalWidth(data, thinSectionId);

      var maxY = minY + intervalHeight;
      var maxX = minX + intervalWidth;

      var geojsonObj = {};
      geojsonObj.geometry = {
        'type': 'Polygon',
        'coordinates': [[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]]
      };
      geojsonObj.properties = {
        'thin_section_id': thinSectionId,
        'surface_feature': {'surface_feature_type': 'thin_interval'},
        'micro': {'lithologies': data}
      };
      return geojsonObj;
    }*/

    function drawAxes(ctx, pixelRatio, thinSection, mapName) {
      ctx.font = "30px Arial";

      var map = MapSetupFactory.getMap(mapName);
      var zoom = map.getView().getZoom();

      // Y Axis
      //var currentSectionHeight = getSectionHeight();
      var yAxisHeight = 100 + 40;

      ctx.beginPath();
      ctx.setLineDash([]);
      var p = getPixel([0, 0], pixelRatio, mapName);
      ctx.moveTo(p.x, p.y);
      p = getPixel([0, yAxisHeight], pixelRatio, mapName);
      ctx.lineTo(p.x, p.y);

      // Tick Marks for Y Axis
      _.times(Math.floor(yAxisHeight / yMultiplier) + 1, function (i) {
        var y = i * yMultiplier;
        p = i === 0 ? getPixel([-15, 0], pixelRatio, mapName) : getPixel([-10, y], pixelRatio, mapName);
        if (i === 0 || zoom >= 5 || (zoom < 5 && zoom > 2 && i % 5 === 0) || (zoom <= 2 && i % 10 === 0)) {
          ctx.textAlign = 'right';
          if (i === 0 && thinSection.column_y_axis_units) {
            ctx.fillText('0 ' + thinSection.column_y_axis_units, p.x, p.y);
          }
          else ctx.fillText(i, p.x, p.y);
          p = getPixel([-5, y], pixelRatio, mapName);
          ctx.moveTo(p.x, p.y);
          p = getPixel([0, y], pixelRatio, mapName);
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();

      // Tick Marks for Intervals
      // Only show tick marks if zoom level is 6 or greater
  /*    if (zoom >= 6) {
        var intervalSpots = getThinIntervalSpots();
        _.each(intervalSpots, function (intervalSpot) {
          var extent = intervalSpot.getGeometry().getExtent();
          var y = extent[3];
          var label = HelpersFactory.roundToDecimalPlaces(extent[3] / yMultiplier, 2);
          if (!Number.isInteger(label)) {
            p = getPixel([-3, y], pixelRatio, mapName);
            ctx.textAlign = 'right';
            ctx.fillText(label, p.x, p.y);
            p = getPixel([-2, y], pixelRatio, mapName);
            ctx.moveTo(p.x, p.y);
            p = getPixel([0, y], pixelRatio, mapName);
            ctx.lineTo(p.x, p.y);
          }
        });
        ctx.stroke();
      }*/

      // Setup to draw X Axis
      var labels = {};
      var y = 0;
      var a = 174.5;
      var b = -40.5;
      var c = 2.5;
      var x = zoom;
      if (thinSection.column_profile === 'clastic') {
        labels = _.pluck(grainSizeOptions.clastic, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 1, y, 'black', thinSection.column_profile, mapName);
        y += (a + b * x + c * x * x) * -1
      }
      else if (thinSection.column_profile === 'carbonate') {
        labels = _.pluck(grainSizeOptions.carbonate, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.33);
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 2, y, 'blue', thinSection.column_profile, mapName);
        y += (a + b * x + c * x * x) * -1
      }
      else if (thinSection.column_profile === 'mixed_clastic') {
        labels = _.pluck(grainSizeOptions.clastic, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 1, y, 'black', 'clastic', mapName);
        y += (a + b * x + c * x * x) * -1;
        labels = _.pluck(grainSizeOptions.carbonate, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.33, 'blue');
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 2, y, 'blue', 'carbonate', mapName);
        y += (a + b * x + c * x * x) * -1
      }
      else if (thinSection.column_profile === 'weathering_pro') {
        labels = _.pluck(grainSizeOptions.weathering, 'label');
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 1, y, 'black', 'weathering', mapName);
        y += (a + b * x + c * x * x) * -1
      }
      else $log.error('Incorrect profile type:', thinSection.column_profile);

      if (thinSection.misc_labels === true) {
        labels = _.pluck(grainSizeOptions.lithologies, 'label');
        labels = _.rest(labels, 3);
        //drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.66, 'green');
        drawAxisXStacked(ctx, pixelRatio, yAxisHeight, labels, 2, y, 'green', 'misc.', mapName);
      }
    }

    // Gather all Spots Mapped on this Thin Section
    function gatherThinSectionSpots(thinSectionId) {
      var activeSpots = SpotFactory.getActiveSpots();
      thinSectionSpots = _.filter(activeSpots, function (spot) {
        return spot.properties.thin_section_id == thinSectionId; // Comparing int to string so use only 2 equal signs
      });
      // Remove spots that don't have a geometry defined (this case should never happen)
      thinSectionSpots = _.reject(thinSectionSpots, function (spot) {
        if (!_.has(spot, 'geometry')) $log.error('No Geometry for Spot:', spot);
        return !_.has(spot, 'geometry');
      });
    }

    // Gather all Spots that have Thin Sections
    function gatherSpotsWithThinSections() {
      var activeSpots = SpotFactory.getActiveSpots();
      spotsWithThinSections = _.filter(activeSpots, function (spot) {
        return _.has(spot.properties, 'micro') && _.has(spot.properties.micro, 'thin_section');
      });
    }

    // Get the Spot that Contains a Specific Thin Section Given the Id of the Thin Section
    function getSpotWithThisThinSection(thinSectionId) {
      var activeSpots = SpotFactory.getActiveSpots();
      return _.find(activeSpots, function (spot) {
        return _.has(spot, 'properties') && _.has(spot.properties, 'micro') &&
          _.has(spot.properties.micro, 'thin_section') &&
          spot.properties.micro.thin_section.thin_section_id == thinSectionId;  // Comparing int to string so use only 2 equal signs
      });
    }

    function getThinSectionIntervals(thinSectionId) {
      gatherThinSectionSpots(thinSectionId);
      // Separate the Thin Section Spots into the Interval Spots and other Spots
      var thinSectionSpotsPartitioned = _.partition(thinSectionSpots, function (spot) {
        return spot.properties.surface_feature &&
          spot.properties.surface_feature.surface_feature_type === 'thin_interval';
      });
      return thinSectionSpotsPartitioned[0];
    }

    function getThinSectionSettings(thinSectionId) {
      var spot = getSpotWithThisThinSection(thinSectionId);
      return spot.properties.micro.thin_section;
    }

    function getThinSectionSpots() {
      return thinSectionSpots;
    }

    function getSpotsWithThinSections() {
      return spotsWithThinSections;
    }

    function isInterval(spot) {
      return _.has(spot, 'properties') && _.has(spot.properties, 'thin_section_id') &&
        _.has(spot.properties, 'surface_feature') && _.has(spot.properties.surface_feature, 'surface_feature_type') &&
        spot.properties.surface_feature.surface_feature_type === 'thin_interval';
    }

    function orderThinSectionIntervals(intervals) {
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
   /* function validateNewInterval(data, form) {
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
    }*/
  }
}());
