(function () {
  'use strict';

  angular
    .module('app')
    .factory('ThinSectionFactory', ThinSectionFactory);

  ThinSectionFactory.$inject = ['$log', 'MapSetupFactory', 'SpotFactory'];

  function ThinSectionFactory($log, MapSetupFactory, SpotFactory) {
    var spotsWithThinSections = {};
    var thinSectionSpots = {};
 
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
    
    // Get pixel coordinates from map coordinates
    function getPixel(coord, pixelRatio, mapName) {
      var map = MapSetupFactory.getMap(mapName);
      return {
        'x': map.getPixelFromCoordinate(coord)[0] * pixelRatio,
        'y': map.getPixelFromCoordinate(coord)[1] * pixelRatio
      };
    }

    /**
     * Public Functions
     */

    function drawAxes(ctx, pixelRatio, image, mapName) {
      if (image.width_of_image_view) {
        ctx.font = "30px Arial";

        var widthPixels = image.width;
        var heightPixels = image.height;
        var widthReal = image.width_of_image_view;
        var heightReal = widthReal * heightPixels / widthPixels;
        var units = image.units_of_image_view;
        if (units === '_m') units = 'um';
        else if (!units) units = '';

        // Y Axis
        var yInterval = 20;                                         // Minimum pixel spacing between tick marks
        var yIntervalsNum = Math.floor(heightPixels / 20);           // Num intervals with 20 pixel spacing
        yInterval = Math.floor(heightReal/yIntervalsNum);            // yInterval converted for real height
        var places = Math.floor(Math.log10(yInterval));
        var yIntervalString = '1';
        _.times(places + 1, function () {
          yIntervalString = yIntervalString + '0';
        });
        yInterval = parseInt(yIntervalString);                      // yInterval rounded up to nearest 100, 1000, etc
        yIntervalsNum = heightReal / yInterval;                      // Num intervals with yInterval spacing
        var yRatio = heightReal / yInterval;

        ctx.beginPath();
        ctx.setLineDash([]);
        var p = getPixel([0, 0], pixelRatio, mapName);
        ctx.moveTo(p.x, p.y);
        p = getPixel([0, heightPixels], pixelRatio, mapName);
        ctx.lineTo(p.x, p.y);

        // Tick Marks for Y Axis
        _.times(Math.ceil(yIntervalsNum) + 1, function (i) {
          var y = heightPixels - (i * heightPixels / yRatio);
          var label = i * yInterval;
          if (y < 0) {
            y = 0;
            label = Math.round(heightReal);
          }
          ctx.textAlign = 'right';
          p = getPixel([-10, y], pixelRatio, mapName);
          if (i === 0) ctx.fillText('0' + units, p.x, p.y);
          else ctx.fillText(label.toString(), p.x, p.y);
          p = getPixel([-5, y], pixelRatio, mapName);
          ctx.moveTo(p.x, p.y);
          p = getPixel([0, y], pixelRatio, mapName);
          ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // X Axis
        var xInterval = 20;                                         // Minimum pixel spacing between tick marks
        var xIntervalsNum = Math.floor(widthPixels / 20);           // Num intervals with 20 pixel spacing
        xInterval = Math.floor(widthReal/xIntervalsNum);            // xInterval converted for real height
        places = Math.floor(Math.log10(xInterval));
        var xIntervalString = '1';
        _.times(places + 1, function () {
          xIntervalString = xIntervalString + '0';
        });
        xInterval = parseInt(xIntervalString);                      // xInterval rounded up to nearest 100, 1000, etc
        xIntervalsNum = widthReal / xInterval;                      // Num intervals with xInterval spacing
        var xRatio = widthReal / xInterval;

        ctx.beginPath();
        ctx.setLineDash([]);
        p = getPixel([0, heightPixels], pixelRatio, mapName);
        ctx.moveTo(p.x, p.y);
        p = getPixel([widthPixels, heightPixels], pixelRatio, mapName);
        ctx.lineTo(p.x, p.y);

        // Tick Marks for Y Axis
        _.times(Math.ceil(xIntervalsNum) + 1, function (i) {
          var x = i * widthPixels / xRatio;
          var label = i * xInterval;
          if (x > widthPixels) {
            x = widthPixels;
            label = Math.round(widthReal);
          }
          ctx.textAlign = 'center';
          p = getPixel([x, heightPixels + 10], pixelRatio, mapName);
          ctx.fillText(label.toString(), p.x, p.y);
          p = getPixel([x, heightPixels + 5], pixelRatio, mapName);
          ctx.moveTo(p.x, p.y);
          p = getPixel([x, heightPixels], pixelRatio, mapName);
          ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
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
