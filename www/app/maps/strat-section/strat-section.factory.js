(function () {
  'use strict';

  angular
    .module('app')
    .factory('StratSectionFactory', StratSectionFactory);

  StratSectionFactory.$inject = ['$log', 'DataModelsFactory', 'HelpersFactory', 'MapLayerFactory', 'MapSetupFactory',
    'SpotFactory'];

  function StratSectionFactory($log, DataModelsFactory, HelpersFactory, MapLayerFactory, MapSetupFactory, SpotFactory) {
    var grainSizeOptions = DataModelsFactory.getSedLabelsDictionary();
    var spotsWithStratSections = {};
    var stratSectionSpots = {};
    var xInterval = 10;  // Horizontal spacing between grain sizes tick marks
    var yMultiplier = 20;  // 1 m interval thickness = 20 pixels

    return {
      'checkForIntervalUpdates': checkForIntervalUpdates,
      'createInterval': createInterval,
      'drawAxes': drawAxes,
      'gatherSpotsWithStratSections': gatherSpotsWithStratSections,
      'gatherStratSectionSpots': gatherStratSectionSpots,
      'getSpotWithThisStratSection': getSpotWithThisStratSection,
      'getSpotsWithStratSections': getSpotsWithStratSections,
      'getStratSectionSpots': getStratSectionSpots,
      'isInterval': isInterval,
      'orderStratSectionIntervals': orderStratSectionIntervals
    };

    /**
     * Private Functions
     */

    // X Axis
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

    /**
     * Public Functions
     */

    function checkForIntervalUpdates(state, spot, savedSpot) {
      // Current state is spot tab
      if (state === 'app.spotTab.spot') {
        // If Spot is an interval with geometry and and the surface feature type has been changed update interval thickness
        if (!savedSpot.properties.surface_feature || !savedSpot.properties.surface_feature.surface_feature_type ||
        !savedSpot.properties.surface_feature.surface_feature_type  !== 'strat_interval') {
          if (spot.geometry) {
            if (!spot.properties.sed) spot.properties.sed = {};
            if (!spot.properties.sed.lithologies) spot.properties.sed.lithologies = {};
            $log.log('Updating interval thickness ...');
            var extent = new ol.format.GeoJSON().readFeature(spot).getGeometry().getExtent();
            var thickness = (extent[3] - extent[1]) / yMultiplier; // 20 is yMultiplier
            thickness = HelpersFactory.roundToDecimalPlaces(thickness, 2);
            spot.properties.sed.lithologies.interval_thickness = thickness;
          }
        }
      }
      // Current state is sed-lithologies tab
      else if (state === 'app.spotTab.sed-lithologies') {
        // If Spot is an interval with geometry and the interval thickness has changed update the geometry
        if (spot.properties.sed && spot.properties.sed.lithologies &&
          spot.properties.sed.lithologies.interval_thickness && savedSpot.properties.sed &&
          savedSpot.properties.sed.lithologies && savedSpot.properties.sed.lithologies.interval_thickness &&
          spot.properties.sed.lithologies.interval_thickness !==
          savedSpot.properties.sed.lithologies.interval_thickness) {
          $log.log('Interval thickness changed. Updating geometry ...');
          var extent = new ol.format.GeoJSON().readFeature(spot).getGeometry().getExtent();
          var intervalHeight = spot.properties.sed.lithologies.interval_thickness * yMultiplier;
          var minX = extent[0];
          var maxX = extent[2];
          var minY = extent[1];
          var maxY = minY + intervalHeight;
          spot.geometry.coordinates =  [[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]];
        }
      }
      return spot;
    }

    function createInterval(stratSectionId, data) {
      var minX = 0;
      var minY = getSectionHeight();

      var map = MapSetupFactory.getMap();
      var mapHeight = map.getSize()[0];
      var mapWidth = map.getSize()[1];
      var intervalHeight = data.interval_thickness * yMultiplier;

      var i, intervalWidth = xInterval;
      // Weathering Profile
      if (data.interval_type === 'weathering_proile' && data.relative_resistance_weathering) {
        i = _.findIndex(grainSizeOptions.weathering, function (grainSizeOption) {
          return grainSizeOption.value === data.relative_resistance;
        });
        intervalWidth = (i + 1) * xInterval;
      }
      // Unexposed/Covered
      else if (data.interval_type === 'unexposed_covered') intervalWidth = (0 + 1) * xInterval;    // Same as clay
      // Lithology = siliclastic
      else if (data.principal_grain_size_clastic) {
        i = _.findIndex(grainSizeOptions.clastic, function (grainSizeOption) {
          return grainSizeOption.value === data.principal_grain_size_clastic;
        });
        intervalWidth = (i + 1) * xInterval;
      }
      // Lithology = limestone or dolomite
      else if (data.principal_dunham_classificatio) {
        i = _.findIndex(grainSizeOptions.carbonate, function (grainSizeOption) {
          return grainSizeOption.value === data.principal_dunham_classificatio;
        });
        intervalWidth = (i + 2.33) * xInterval;
      }
      // Other Lithologies
      else {
        i = _.findIndex(grainSizeOptions.lithologies, function (grainSizeOption) {
          return grainSizeOption.value === data.lithologies;
        });
        i = i - 3; // First 3 indexes are siliclastic, limestone & dolomite which are handled above
        intervalWidth = (i + 2.66) * xInterval;
      }

      var maxY = minY + intervalHeight;
      var maxX = minX + intervalWidth;

      var geojsonObj = {};
      geojsonObj.geometry = {
        'type': 'Polygon',
        'coordinates': [[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]]
      };
      geojsonObj.properties = {
        'strat_section_id': stratSectionId,
        'surface_feature': {'surface_feature_type': 'strat_interval'},
        'sed': {'lithologies': data}
      };
      return geojsonObj;
    }

    function drawAxes(ctx, pixelRatio, stratSection) {
      ctx.font = "30px Arial";

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
      p = getPixel([-15, 0], pixelRatio);
      if (stratSection.column_y_axis_units) ctx.fillText('0 ' + stratSection.column_y_axis_units, p.x, p.y);
      else ctx.fillText('0', p.x, p.y);
      _.times(Math.floor(yAxisHeight / yMultiplier), function (i) {
        var y = (i + 1) * yMultiplier;
        p = getPixel([-10, y], pixelRatio);
        ctx.fillText(i + 1, p.x, p.y);
        p = getPixel([-5, y], pixelRatio);
        ctx.moveTo(p.x, p.y);
        p = getPixel([0, y], pixelRatio);
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Tick Marks for Intervals
      var intervalSpots = getStratIntervalSpots();
      _.each(intervalSpots, function (intervalSpot) {
        var extent = intervalSpot.getGeometry().getExtent();
        var y = extent[3];
        var label = HelpersFactory.roundToDecimalPlaces(extent[3] / yMultiplier, 2);
        if (!Number.isInteger(label)) {
          p = getPixel([-3, y], pixelRatio);
          ctx.fillText(label, p.x, p.y);
          p = getPixel([-2, y], pixelRatio);
          ctx.moveTo(p.x, p.y);
          p = getPixel([0, y], pixelRatio);
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();

      // Setup to draw X Axis
      var labels = {};
      if (stratSection.column_profile === 'clastic') {
        labels = _.pluck(grainSizeOptions.clastic, 'label');
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
      }
      else if (stratSection.column_profile === 'carbonate') {
        labels = _.pluck(grainSizeOptions.carbonate, 'label');
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.33);
      }
      else if (stratSection.column_profile === 'mixed_clastic') {
        labels = _.pluck(grainSizeOptions.clastic, 'label');
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
        labels = _.pluck(grainSizeOptions.carbonate, 'label');
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.33, 'blue');
      }
      else if (stratSection.column_profile === 'weathering_pro') {
        labels = _.pluck(grainSizeOptions.weathering, 'label');
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
      }
      else drawAxisX(ctx, pixelRatio, yAxisHeight, [], 1);

      if (stratSection.misc_labels === true) {
        labels = _.pluck(grainSizeOptions.lithologies, 'label');
        labels = _.rest(labels, 3);
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 2.66, 'green');
      }
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
        return spot.properties.sed && spot.properties.sed.strat_section &&
          spot.properties.sed.strat_section.strat_section_id == stratSectionId;  // Comparing int to string so use only 2 equal signs
      });
    }

    function getStratSectionSpots() {
      return stratSectionSpots;
    }

    function getSpotsWithStratSections() {
      return spotsWithStratSections;
    }

    function isInterval(spot) {
      return spot.properties && spot.properties.surface_feature &&
        spot.properties.surface_feature.surface_feature_type &&
        spot.properties.surface_feature.surface_feature_type === 'strat_interval';
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
  }
}());
