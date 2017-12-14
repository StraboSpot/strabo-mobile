(function () {
  'use strict';

  angular
    .module('app')
    .factory('StratSectionFactory', StratSectionFactory);

  StratSectionFactory.$inject = ['$log', 'DataModelsFactory', 'MapLayerFactory', 'MapSetupFactory', 'SpotFactory'];

  function StratSectionFactory($log, DataModelsFactory, MapLayerFactory, MapSetupFactory, SpotFactory) {
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

      var i, intervalWidth;
      var grainSize = data.principal_grain_size_clastic;
      if (grainSize) {
        i = _.findIndex(grainSizeOptions.clastic, function (grainSizeOption) {
          return grainSizeOption.value === grainSize;
        });
        intervalWidth = (i + 1) * xInterval;
      }
      else {
        grainSize = data.principal_dunham_classificatio;
        if (grainSize) {
          i = _.findIndex(grainSizeOptions.carbonate, function (grainSizeOption) {
            return grainSizeOption.value === grainSize;
          });
          intervalWidth = (i + 1.5) * xInterval;
        }
      }

      var maxY = minY + intervalHeight;
      var maxX = minX + intervalWidth;

      var geojsonObj = {};
      geojsonObj.geometry = {
        'type': 'Polygon',
        'coordinates': [[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]]]
      };
      geojsonObj.properties = {
        'strat_section_id': stratSectionId,
        'surface_feature': {'surface_feature_type': 'strat_interval'},
        'sed': {'lithologies': data }
      };
      return geojsonObj;
    }

    function drawAxes(ctx, pixelRatio) {
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
      ctx.fillText("0 m", p.x, p.y);
      _.times(Math.floor(yAxisHeight / yMultiplier), function (i) {
        var y = (i + 1) * yMultiplier;
        p = getPixel([-10, y], pixelRatio);
        ctx.fillText(i + 1, p.x, p.y);
        p = getPixel([-5, y], pixelRatio);
        ctx.moveTo(p.x, p.y);
        p = getPixel([0, y], pixelRatio);
        ctx.lineTo(p.x, p.y);
      });

      // X Axis
      p = getPixel([-10, 0], pixelRatio);
      ctx.moveTo(p.x, p.y);
      var xAxisLength = (_.size(grainSizeOptions.clastic) + 1) * xInterval;
      p = getPixel([xAxisLength, 0], pixelRatio);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Create Grain Size Labels for X Axis
      ctx.textAlign = "right";
      ctx.lineWidth = 3;
      _.each(grainSizeOptions.clastic, function (grainSizeOption, i) {
        var x = (i + 1) * xInterval;

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
        ctx.fillText(grainSizeOption.label + ' ', 0, 0);
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

      _.each(grainSizeOptions.carbonate, function (grainSizeOption, i) {
        var x = (i + 1.5) * xInterval;

        // Tick Mark
        ctx.beginPath();
        ctx.setLineDash([]);
        p = getPixel([x, 0], pixelRatio);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, -3], pixelRatio);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Label
        ctx.save();
        p = getPixel([x, -3], pixelRatio);
        ctx.translate(p.x, p.y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = 'blue';
        ctx.fillText(grainSizeOption.label + ' ', 0, 0);
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
        return _.has(spot.properties, 'sed')&& _.has(spot.properties.sed, 'strat_section');
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
