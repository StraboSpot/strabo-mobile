(function () {
  'use strict';

  angular
    .module('app')
    .factory('ThinSectionFactory', ThinSectionFactory);

  ThinSectionFactory.$inject = ['$log', 'DataModelsFactory', 'MapSetupFactory', 'SpotFactory'];

  function ThinSectionFactory($log, DataModelsFactory, MapSetupFactory, SpotFactory) {
    var grainSizeOptions = DataModelsFactory.getSedLabelsDictionary();
    var spotsWithThinSections = {};
    var thinSectionSpots = {};
    var xInterval = 10;  // Horizontal spacing between grain sizes/weathering tick marks
    var yMultiplier = 20;  // 1 m interval thickness = 20 pixels

    return {
      'drawAxes': drawAxes,
      'gatherSpotsWithThinSections': gatherSpotsWithThinSections,
      'gatherThinSectionSpots': gatherThinSectionSpots,
      'getSpotWithThisThinSection': getSpotWithThisThinSection,
      'getSpotsWithThinSections': getSpotsWithThinSections,
      'getThinSectionSettings': getThinSectionSettings,
      'getThinSectionSpots': getThinSectionSpots
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

    /**
     * Public Functions
     */

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
  }
}());
