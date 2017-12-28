(function () {
  'use strict';

  angular
    .module('app')
    .factory('StratSectionFactory', StratSectionFactory);

  StratSectionFactory.$inject = ['$log', 'DataModelsFactory', 'HelpersFactory', 'MapLayerFactory', 'MapSetupFactory',
    'SpotFactory'];

  function StratSectionFactory($log, DataModelsFactory, HelpersFactory, MapLayerFactory, MapSetupFactory, SpotFactory) {
    var grainSizeOptions = DataModelsFactory.getSedGrainSizeLabelsDictionary();
    var spotsWithStratSections = {};
    var stratSectionSpots = {};
    var xInterval = 10;  // Horizontal spacing between grain sizes tick marks
    var yMultiplier = 20;  // 1 m interval thickness = 20 pixels

    return {
      'createInterval': createInterval,
      'drawAxes': drawAxes,
      'gatherSpotsWithStratSections': gatherSpotsWithStratSections,
      'gatherStratSectionSpots': gatherStratSectionSpots,
      'getGrainSizeOptions': getGrainSizeOptions,
      'getSpotWithThisStratSection': getSpotWithThisStratSection,
      'getSpotsWithStratSections': getSpotsWithStratSections,
      'getStratSectionSpots': getStratSectionSpots,
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

    function createInterval(stratSectionId, data) {
      var minX = 0;
      var minY = getSectionHeight();

      var map = MapSetupFactory.getMap();
      var mapHeight = map.getSize()[0];
      var mapWidth = map.getSize()[1];
      var intervalHeight = data.interval_thickness * yMultiplier;

      var i, intervalWidth = xInterval;
      if (data.interval_type === 'clastic' && data.principal_grain_size_clastic) {
        i = _.findIndex(grainSizeOptions.clastic, function (grainSizeOption) {
          return grainSizeOption.value === data.principal_grain_size_clastic;
        });
        intervalWidth = (i + 1) * xInterval;
      }
      else if (data.interval_type === 'carbonate' && data.principal_dunham_classificatio) {
        i = _.findIndex(grainSizeOptions.carbonate, function (grainSizeOption) {
          return grainSizeOption.value === data.principal_dunham_classificatio;
        });
        intervalWidth = (i + 1.5) * xInterval;
      }
      else if (data.interval_type === 'mixed_clastic' &&
        (data.principal_grain_size_clastic || data.principal_dunham_classificatio)) {
        if (data.principal_grain_size_clastic) {
          i = _.findIndex(grainSizeOptions.clastic, function (grainSizeOption) {
            return grainSizeOption.value === data.principal_grain_size_clastic;
          });
          intervalWidth = (i + 1) * xInterval;
        }
        else {
          i = _.findIndex(grainSizeOptions.carbonate, function (grainSizeOption) {
            return grainSizeOption.value === data.principal_dunham_classificatio;
          });
          intervalWidth = (i + 1.5) * xInterval;
        }
      }
      else if (data.interval_type === 'misc_lithologi' && data.misc_lithologies) {
        if (data.misc_lithologies === 'coal' || data.misc_lithologies === 'evaporites') {
          intervalWidth = (1 + 1) * xInterval;   // Same as mud
        }
        else if (data.misc_lithologies === 'tuff') {
          intervalWidth = (4 + 1) * xInterval;    // Same as sand - fine lower
        }
      }
      else if (data.interval_type === 'weathering_pro' && data.relative_resistance) {
        i = _.findIndex(grainSizeOptions.weathering, function (grainSizeOption) {
          return grainSizeOption.value === data.relative_resistance;
        });
        intervalWidth = (i + 1) * xInterval;
      }
      else if (data.interval_type === 'unexposed') {
        intervalWidth = (0 + 1) * xInterval;    // Same as clay
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
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1.5);
      }
      else if (stratSection.column_profile === 'mixed_clastic') {
        labels = _.pluck(grainSizeOptions.clastic, 'label');
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
        labels = _.pluck(grainSizeOptions.carbonate, 'label');
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1.5, 'blue');
      }
      else if (stratSection.column_profile === 'weathering_pro') {
        labels = _.pluck(grainSizeOptions.weathering, 'label');
        drawAxisX(ctx, pixelRatio, yAxisHeight, labels, 1);
      }
      else drawAxisX(ctx, pixelRatio, yAxisHeight, [], 1);
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

    function getGrainSizeOptions() {
      return grainSizeOptions;
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
