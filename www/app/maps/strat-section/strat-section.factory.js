(function () {
  'use strict';

  angular
    .module('app')
    .factory('StratSectionFactory', StratSectionFactory);

  StratSectionFactory.$inject = ['$log', 'MapLayerFactory', 'MapSetupFactory', 'SpotFactory'];

  function StratSectionFactory($log, MapLayerFactory, MapSetupFactory, SpotFactory) {
    var grainSizeOptions = [
      {'value': 'clay', 'label': 'Clay'},
      {'value': 'fine_silt', 'label': 'Fine Silt'},
      {'value': 'med_silt', 'label': 'Med Silt'},
      {'value': 'coarse_silt', 'label': 'Coarse Silt'},
      {'value': 'vfine_sand', 'label': 'VFine Sand'},
      {'value': 'fine_sand', 'label': 'Fine Sand'},
      {'value': 'med_sand', 'label': 'Med Sand'},
      {'value': 'coarse_sand', 'label': 'Coarse Sand'},
      {'value': 'vcoarse_sand', 'label': 'VCoarse Sand'},
      {'value': 'granule_congl', 'label': 'Granuale Congl.'},
      {'value': 'pebble_congl', 'label': 'Pebble Congl.'},
      {'value': 'cobble_congl', 'label': 'Cobble Congl.'},
      {'value': 'boulder_congl', 'label': 'Boulder Congl.'}
    ];
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

    function createInterval(stratSectionId, thickness, grainSize) {
      var minX = 0;
      var minY = getSectionHeight();

      var map = MapSetupFactory.getMap();
      var mapHeight = map.getSize()[0];
      var mapWidth = map.getSize()[1];
      var intervalHeight = thickness * yMultiplier;

      var i = _.findIndex(grainSizeOptions, function (grainSizeOption) {
        return grainSizeOption.value === grainSize;
      });
      var intervalWidth = (i + 1) * xInterval;

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
        'grain_size': grainSize,
        'thickness': thickness
      };
      return geojsonObj;
    }

    function drawAxes(ctx, pixelRatio) {
     // ctx.globalCompositeOperation="source-out";
     // ctx.globalCompositeOperation="destination-over";

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
      var xAxisLength = (_.size(grainSizeOptions) + 1) * xInterval;
      p = getPixel([xAxisLength, 0], pixelRatio);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Create Grain Size Labels for X Axis
      ctx.textAlign = "right";
      ctx.lineWidth = 3;
      _.each(grainSizeOptions, function (grainSizeOption, i) {
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
        ctx.rotate(-Math.PI/2);
        ctx.fillText(grainSizeOption.label + ' ', 0, 0);
        ctx.restore();

      // ctx.save();
     //   ctx.globalCompositeOperation="destination-over";
        // Vertical Dashed Line
        ctx.beginPath();
        ctx.setLineDash([5]);
        p = getPixel([x, 0], pixelRatio);
        ctx.moveTo(p.x, p.y);
        p = getPixel([x, yAxisHeight], pixelRatio);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
   //    ctx.restore();
      });
   // ctx.globalCompositeOperation="source-over";
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
        return _.has(spot.properties, 'strat_section');
      });
    }

    function getGrainSizeOptions() {
      return grainSizeOptions;
    }


    // Get the Spot that Contains a Specific Strat Section Given the Id of the Strat Section
    function getSpotWithThisStratSection(stratSectionId) {
      var activeSpots = SpotFactory.getActiveSpots();
      return _.find(activeSpots, function (spot) {
        return spot.properties.strat_section && spot.properties.strat_section.strat_section_id == stratSectionId;  // Comparing int to string so use only 2 equal signs
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
