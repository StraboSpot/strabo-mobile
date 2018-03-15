(function () {
  'use strict';

  angular
    .module('app')
    .factory('SymbologyFactory', SymbologyFactory);

  SymbologyFactory.$inject = ['$log', 'ProjectFactory'];

  function SymbologyFactory($log, ProjectFactory) {
    var symbols;

    activate();

    return {
      'getPolyFill': getPolyFill,
      'getSymbolPath': getSymbolPath
    };

    /**
     *  Private Functions
     */

    function activate() {
      setSymbols();
    }

    function getStratIntervalFill(featureProperties, resolution) {
      var fill;
      var color;
      if (featureProperties.sed && featureProperties.sed.lithologies) {
        //$log.log(props.sed.lithologies);

        if (featureProperties.sed.lithologies.interval_type === 'unexposed_cov') {
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');

          var extent = featureProperties.geometry.getExtent();
          var width = 10 / resolution * 2;
          var height = (extent[3] - extent[1]) / resolution * 2;
          canvas.width = width;
          canvas.height = height;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(width, height);
          ctx.moveTo(0, height);
          ctx.lineTo(width, 0);
          ctx.stroke();

          var pattern = ctx.createPattern(canvas, 'no-repeat');
          fill = new ol.style.Fill();
          fill.setColor(pattern);
        }
        else {
          var lithology = featureProperties.sed.lithologies.mud_silt_principal_grain_size ||
            featureProperties.sed.lithologies.sand_principal_grain_size ||
            featureProperties.sed.lithologies.congl_breccia_principal_grain_size ||
            featureProperties.sed.lithologies.principal_dunham_class ||
            featureProperties.sed.lithologies.primary_lithology;
          if (lithology === 'clay') color = 'rgba(128, 222, 77, 1)';                // CMYK 50,13,70,0 USGS Color 682
          else if (lithology === 'mud') color = 'rgba(77, 255, 0, 1)';              // CMYK 70,0,100,0 USGS Color 890
          else if (lithology === 'silt') color = 'rgba(153, 255, 102, 1)';          // CMYK 40,0,60,0 USGS Color 570
          else if (lithology === 'sand__very_fin') color = 'rgba(255, 255, 179, 1)';   // CMYK 0,0,30,0 USGS Color 40
          else if (lithology === 'sand__fine_low') color = 'rgba(255, 255, 153, 1)'; // CMYK 0,0,40,0 USGS Color 50
          else if (lithology === 'sand__fine_upp') color = 'rgba(255, 255, 128, 1)'; // CMYK 0,0,50,0 USGS Color 60
          else if (lithology === 'sand__medium_l') color = 'rgba(255, 255, 102, 1)';  // CMYK 0,0,60,0 USGS Color 70
          else if (lithology === 'sand__medium_u') color = 'rgba(255, 255, 77, 1)';   // CMYK 0,0,70,0 USGS Color 80
          else if (lithology === 'sand__coarse_l') color = 'rgba(255, 255, 0, 1)';   // CMYK 0,0,100,0 USGS Color 90
          else if (lithology === 'sand__coarse_u') color = 'rgba(255, 235, 0, 1)';   // CMYK 0,8,100,0 USGS Color 91
          else if (lithology === 'sand__very_coa') color = 'rgba(255, 222, 0, 1)';     // CMYK 0,13,100,0 USGS Color 92
          else if (lithology === 'granule') color = 'rgba(255, 153, 0, 1)';         // CMYK 0,40,100,0 USGS Color 95
          else if (lithology === 'pebble') color = 'rgba(255, 128, 0, 1)';          // CMYK 0,50,100,0 USGS Color 96
          else if (lithology === 'cobble') color = 'rgba(255, 102, 0, 1)';          // CMYK 0,60,100,0 USGS Color 97
          else if (lithology === 'boulder') color = 'rgba(255, 77, 0, 1)';          // CMYK 0,70,100,0 USGS Color 98
          else if (lithology === 'mudstone') color = 'rgba(77, 255, 128, 1)';       // CMYK 70,0,50,0 USGS Color 860
          else if (lithology === 'wackestone') color = 'rgba(77, 255, 179, 1)';     // CMYK 70,0,30,0 USGS Color 840
          else if (lithology === 'packstone') color = 'rgba(77, 255, 222, 1)';      // CMYK 70,0,13,0 USGS Color 820
          else if (lithology === 'grainstone') color = 'rgba(179, 255, 255, 1)';    // CMYK 30,0,0,0 USGS Color 400
          else if (lithology === 'boundstone') color = 'rgba(77, 128, 255, 1)';     // CMYK 70,50,0,0 USGS Color 806
          else if (lithology === 'cementstone') color = 'rgba(0, 179, 179, 1)';     // CMYK 100,30,30,0 USGS Color 944
          else if (lithology === 'recrystallized') color = 'rgba(0, 102, 222, 1)';  // CMYK 100,60,13,0 USGS Color 927
          else if (lithology === 'floatstone') color = 'rgba(77, 255, 255, 1)';     // CMYK 70,0,0,0 USGS Color 800
          else if (lithology === 'rudstone') color = 'rgba(77, 204, 255, 1)';       // CMYK 70,20,0,0 USGS Color 803
          else if (lithology === 'framestone') color = 'rgba(77, 128, 255, 1)';     // CMYK 70,50,0,0 USGS Color 806
          else if (lithology === 'bafflestone') color = 'rgba(77, 128, 255, 1)';    // CMYK 70,50,0,0 USGS Color 806
          else if (lithology === 'bindstone') color = 'rgba(77, 128, 255, 1)';      // CMYK 70,50,0,0 USGS Color 806
          else if (lithology === 'evaporite') color = 'rgba(153, 77, 255, 1)';      // CMYK 40,70,0,0 USGS Color 508
          else if (lithology === 'chert') color = 'rgba(102, 77, 77, 1)';           // CMYK 40,70,0,0 USGS Color 508
          else if (lithology === 'ironstone') color = 'rgba(153, 0, 0, 1)';         // CMYK 40,70,0,0 USGS Color 508
          else if (lithology === 'phosphatic') color = 'rgba(153, 255, 179, 1)';    // CMYK 40,70,0,0 USGS Color 508
          else if (lithology === 'volcaniclastic') color = 'rgba(255, 128, 255, 1)';// CMYK 40,70,0,0 USGS Color 508
          else if (lithology === 'organic_coal') color = 'rgba(0, 0, 0, 1)';        // CMYK 100,100,100,0 USGS Color 999
          else color = 'rgba(255, 255, 255, 1)';                                    // default white

          fill = new ol.style.Fill();
          fill.setColor(color);
        }
      }
      else $log.error('Strat Interval indicated but no lithology for', featureProperties);
      return fill;
    }

    function setSymbols() {
      symbols = {
        'default_point': 'img/geology/point.png',

        // Planar Feature Symbols
        'bedding_horizontal': 'img/geology/bedding_horizontal.png',
        'bedding_inclined': 'img/geology/bedding_inclined.png',
        'bedding_overturned': 'img/geology/bedding_overturned.png',
        'bedding_vertical': 'img/geology/bedding_vertical.png',
        'contact_inclined': 'img/geology/contact_inclined.png',
        'contact_vertical': 'img/geology/contact_vertical.png',
        'fault': 'img/geology/fault.png',
        'foliation_horizontal': 'img/geology/foliation_horizontal.png',
        'foliation_inclined': 'img/geology/foliation_general_inclined.png',
        'foliation_vertical': 'img/geology/foliation_general_vertical.png',
        'fracture': 'img/geology/fracture.png',
        'shear_zone_inclined': 'img/geology/shear_zone_inclined.png',
        'shear_zone_vertical': 'img/geology/shear_zone_vertical.png',
        'vein': 'img/geology/vein.png',

        // Old
        // 'axial_planar_inclined': 'img/geology/cleavage_inclined.png',
        // 'axial_planar_vertical': 'img/geology/cleavage_vertical.png',
        // 'joint_inclined': 'img/geology/joint_surface_inclined.png',
        // 'joint_vertical': 'img/geology/joint_surface_vertical.png',
        // 'shear_fracture': 'img/geology/shear_fracture.png',

        // Linear Feature Symbols
        // 'fault': 'img/geology/fault_striation.png',
        // 'flow': 'img/geology/flow.png',
        // 'fold_hinge': 'img/geology/fold_axis.png',
        // 'intersection': 'img/geology/intersection.png',
        'lineation_general': 'img/geology/lineation_general.png'
        // 'solid_state': 'img/geology/solid_state.png',
        // 'vector': 'img/geology/vector.png'
      };
    }

    /**
     * Public Functions
     */

    function getPolyFill(feature, resolution) {
      var featureProperties = feature.getProperties();
      //$log.log(featureProperties);

      // If a Strat Interval
      var fill;
      if (featureProperties.surface_feature &&
        featureProperties.surface_feature.surface_feature_type === 'strat_interval') {
        fill = getStratIntervalFill(featureProperties, resolution);
      }
      else {
        var color;
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
        fill = new ol.style.Fill({
          'color': color
        });
      }
      return fill;
    }

    function getSymbolPath(feature_type, orientation, orientation_type, facing) {
      // Set a default symbol by whether feature is planar or linear
      var default_symbol = symbols.default_point;
      if (orientation_type === 'linear_orientation') default_symbol = symbols.lineation_general;

      if (facing && facing === 'overturned' && symbols[feature_type + '_overturned']) {
        return symbols[feature_type + '_overturned'];
      }

      switch (true) {
        case (orientation === 0):
          return symbols[feature_type + '_horizontal'] || symbols[feature_type + '_inclined'] || symbols[feature_type] || default_symbol;
        case ((orientation > 0) && (orientation < 90)):
          return symbols[feature_type + '_inclined'] || symbols[feature_type] || default_symbol;
        case (orientation === 90):
          return symbols[feature_type + '_vertical'] || symbols[feature_type] || default_symbol;
        default:
          return default_symbol;
      }
    }
  }
}());
