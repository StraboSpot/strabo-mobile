(function () {
  'use strict';

  angular
    .module('app')
    .factory('SymbologyFactory', SymbologyFactory);

  SymbologyFactory.$inject = ['$log', 'HelpersFactory', 'ProjectFactory', 'StratSectionFactory'];

  function SymbologyFactory($log, HelpersFactory, ProjectFactory, StratSectionFactory) {
    var featureLayer = {};
    var symbols;
    var patterns = {};

    activate();

    return {
      'getPolyFill': getPolyFill,
      'getSymbolPath': getSymbolPath,
      'setFeatureLayer': setFeatureLayer,
      'setFillPatterns': setFillPatterns
    };

    /**
     *  Private Functions
     */

    function activate() {
      setSymbols();
      setFillPatterns();
    }

    function getInterbeddedGrainSize(lithology) {
      return lithology.mud_silt_interbed_grain_size || lithology.sand_interbed_grain_size ||
        lithology.congl_interbed_grain_size || lithology.breccia_interbed_grain_size ||
        lithology.interbed_dunham_class || lithology.interbed_lithology
    }

    function getPrimaryGrainSize(lithology) {
      return lithology.mud_silt_principal_grain_size || lithology.sand_principal_grain_size ||
        lithology.congl_principal_grain_size || lithology.breccia_principal_grain_size ||
        lithology.principal_dunham_class || lithology.primary_lithology;
    }

    function getStratIntervalFill(featureProperties, resolution, isInterbed) {
      var fill;
      var color;
      if (featureProperties.sed && featureProperties.sed.lithologies) {
        //$log.log(props.sed.lithologies);
        var lithology = featureProperties.sed.lithologies;
        var lithologyField = isInterbed ? lithology.interbed_lithology : lithology.primary_lithology;
        var grainSize = isInterbed ? getInterbeddedGrainSize(lithology) : getPrimaryGrainSize(lithology);
        var stratSectionSettings = StratSectionFactory.getStratSectionSettings(featureProperties.strat_section_id);
        if (stratSectionSettings.display_lithology_patterns) {
          if (stratSectionSettings.column_profile === 'basic_lithologies') {
            // Limestone / Dolomite / Misc. Lithologies
            if (lithologyField === 'limestone') fill = patterns['limestone'];
            else if (lithologyField === 'dolomite') fill = patterns['dolomite'];
            //else if (lithologyField === 'organic_coal') patterns[grainSize] = loadPattern('misc/SiltBasic');
            else if (lithologyField === 'evaporite') fill = patterns['evaporite'];
            else if (lithologyField === 'chert') fill = patterns['chert'];
            //else if (lithologyField === 'ironstone') patterns[grainSize] = loadPattern('misc/SiltBasic');
            else if (lithologyField === 'phosphatic') fill = patterns['phosphatic'];
            else if (lithologyField === 'volcaniclastic') fill = patterns['volcaniclastic'];

            // Siliciclastic (Mudstone/Shale, Sandstone, Conglomerate, Breccia)
            else if (!isInterbed && lithology.mud_silt_principal_grain_size) fill = patterns['mud_silt'];
            else if (!isInterbed && lithology.sand_principal_grain_size) fill = patterns['sandstone'];
            else if (!isInterbed && lithology.congl_principal_grain_size) fill = patterns['conglomerate'];
            else if (!isInterbed && lithology.breccia_principal_grain_size) fill = patterns['breccia'];
            else if (isInterbed && lithology.mud_silt_interbed_grain_size) fill = patterns['mud_silt'];
            else if (isInterbed && lithology.sand_interbed_grain_size) fill = patterns['sandstone'];
            else if (isInterbed && lithology.congl_interbed_grain_size) fill = patterns['conglomerate'];
            else if (isInterbed && lithology.breccia_interbed_grain_size) fill = patterns['breccia'];
          }
          else {
            if (lithologyField === 'limestone') fill = patterns['li_' + grainSize];
            else if (lithologyField === 'dolomite') fill = patterns['do_' + grainSize];
            else if (!isInterbed && lithologyField === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'conglomerate') {
              fill = patterns['congl_' + grainSize];
            }
            else if (!isInterbed && lithologyField === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'breccia') {
              fill = patterns['brec_' + grainSize];
            }
            else if (isInterbed && lithologyField === 'siliciclastic' &&
              featureProperties.sed.lithologies.interbed_siliciclastic_type === 'conglomerate') {
              fill = patterns['congl_' + grainSize];
            }
            else if (isInterbed && lithologyField === 'siliciclastic' &&
              featureProperties.sed.lithologies.interbed_siliciclastic_type === 'breccia') {
              fill = patterns['brec_' + grainSize];
            }
            else fill = patterns[grainSize];
          }
        }
        if (!fill) {
          if (featureProperties.sed.lithologies.is_this_a_bed_or_package === 'unexposed_cove') {
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
          // Basic Lithologies Column Profile
          else if (stratSectionSettings.column_profile === 'basic_lithologies') {
            // Limestone / Dolomite / Misc. Lithologies
            if (lithologyField === 'limestone') color = 'rgba(77, 255, 222, 1)';           // CMYK 70,0,13,0 USGS Color 820
            else if (lithologyField === 'dolomite') color = 'rgba(77, 255, 179, 1)';       // CMYK 70,0,30,0 USGS Color 840
            else if (lithologyField === 'organic_coal') color = 'rgba(0, 0, 0, 1)';        // CMYK 100,100,100,0 USGS Color 999
            else if (lithologyField === 'evaporite') color = 'rgba(153, 77, 255, 1)';      // CMYK 40,70,0,0 USGS Color 508;
            else if (lithologyField === 'chert') color = 'rgba(102, 77, 77, 1)';           // CMYK 60,70,70,0
            else if (lithologyField === 'ironstone') color = 'rgba(153, 0, 0, 1)';         // CMYK 40,100,100,0
            else if (lithologyField === 'phosphatic') color = 'rgba(153, 255, 179, 1)';    // CMYK 40,0,30,0
            else if (lithologyField === 'volcaniclastic') color = 'rgba(255, 128, 255, 1)';// CMYK 0,50,0,0

            // Siliciclastic (Mudstone/Shale, Sandstone, Conglomerate, Breccia)
            else if (!isInterbed && lithology.mud_silt_principal_grain_size) color = 'rgba(128, 222, 77, 1)';          // CMYK 50,13,70,0 USGS Color 682
            else if (!isInterbed && lithology.sand_principal_grain_size) color = 'rgba(255, 255, 77, 1)';              // CMYK 0,0,70,0 USGS Color 80
            else if (!isInterbed && lithology.congl_principal_grain_size) color = 'rgba(255, 102, 0, 1)';              // CMYK 0,60,100,0 USGS Color 97
            else if (!isInterbed && lithology.breccia_principal_grain_size) color = 'rgba(213, 0, 0, 1)';              // CMYK 13,100,100,4
            else if (isInterbed && lithology.mud_silt_interbed_grain_size) color = 'rgba(128, 222, 77, 1)';          // CMYK 50,13,70,0 USGS Color 682
            else if (isInterbed && lithology.sand_interbed_grain_size) color = 'rgba(255, 255, 77, 1)';              // CMYK 0,0,70,0 USGS Color 80
            else if (isInterbed && lithology.congl_interbed_grain_size) color = 'rgba(255, 102, 0, 1)';              // CMYK 0,60,100,0 USGS Color 97
            else if (isInterbed && lithology.breccia_interbed_grain_size) color = 'rgba(213, 0, 0, 1)';              // CMYK 13,100,100,4

            else color = 'rgba(255, 255, 255, 1)';                                                      // default white

            fill = new ol.style.Fill();
            fill.setColor(color);
          }
          else {
            // Mudstone/Shale
            if (grainSize === 'clay') color = 'rgba(128, 222, 77, 1)';                // CMYK 50,13,70,0 USGS Color 682
            else if (grainSize === 'mud') color = 'rgba(77, 255, 0, 1)';              // CMYK 70,0,100,0 USGS Color 890
            else if (grainSize === 'silt') color = 'rgba(153, 255, 102, 1)';          // CMYK 40,0,60,0 USGS Color 570
            // Sandstone
            else if (grainSize === 'sand_very_fin') color = 'rgba(255, 255, 179, 1)'; // CMYK 0,0,30,0 USGS Color 40
            else if (grainSize === 'sand_fine_low') color = 'rgba(255, 255, 153, 1)'; // CMYK 0,0,40,0 USGS Color 50
            else if (grainSize === 'sand_fine_upp') color = 'rgba(255, 255, 128, 1)'; // CMYK 0,0,50,0 USGS Color 60
            else if (grainSize === 'sand_medium_l') color = 'rgba(255, 255, 102, 1)'; // CMYK 0,0,60,0 USGS Color 70
            else if (grainSize === 'sand_medium_u') color = 'rgba(255, 255, 77, 1)';  // CMYK 0,0,70,0 USGS Color 80
            else if (grainSize === 'sand_coarse_l') color = 'rgba(255, 255, 0, 1)';   // CMYK 0,0,100,0 USGS Color 90
            else if (grainSize === 'sand_coarse_u') color = 'rgba(255, 235, 0, 1)';   // CMYK 0,8,100,0 USGS Color 91
            else if (grainSize === 'sand_very_coa') color = 'rgba(255, 222, 0, 1)';   // CMYK 0,13,100,0 USGS Color 92
            // Conglomerate
            else if (featureProperties.sed.lithologies.primary_lithology === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'conglomerate') {
              if (grainSize === 'granule') color = 'rgba(255, 153, 0, 1)';            // CMYK 0,40,100,0 USGS Color 95
              else if (grainSize === 'pebble') color = 'rgba(255, 128, 0, 1)';        // CMYK 0,50,100,0 USGS Color 96
              else if (grainSize === 'cobble') color = 'rgba(255, 102, 0, 1)';        // CMYK 0,60,100,0 USGS Color 97
              else if (grainSize === 'boulder') color = 'rgba(255, 77, 0, 1)';        // CMYK 0,70,100,0 USGS Color 98
            }
            // Breccia
            else if (featureProperties.sed.lithologies.primary_lithology === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'breccia') {
              if (grainSize === 'granule') color = 'rgba(230, 0, 0, 1)';              // CMYK 10,100,100,0 USGS Color 95
              else if (grainSize === 'pebble') color = 'rgba(204, 0, 0, 1)';          // CMYK 20,100,100,0 USGS Color 96
              else if (grainSize === 'cobble') color = 'rgba(179, 0, 0, 1)';          // CMYK 30,100,100,0 USGS Color 97
              else if (grainSize === 'boulder') color = 'rgba(153, 0, 0, 1)';         // CMYK 40,100,100,0 USGS Color 98
            }
            // Limestone / Dolomite
            else if (grainSize === 'mudstone') color = 'rgba(77, 255, 128, 1)';       // CMYK 70,0,50,0 USGS Color 860
            else if (grainSize === 'wackestone') color = 'rgba(77, 255, 179, 1)';     // CMYK 70,0,30,0 USGS Color 840
            else if (grainSize === 'packstone') color = 'rgba(77, 255, 222, 1)';      // CMYK 70,0,13,0 USGS Color 820
            else if (grainSize === 'grainstone') color = 'rgba(179, 255, 255, 1)';    // CMYK 30,0,0,0 USGS Color 400
            else if (grainSize === 'boundstone') color = 'rgba(77, 128, 255, 1)';     // CMYK 70,50,0,0 USGS Color 806
            else if (grainSize === 'cementstone') color = 'rgba(0, 179, 179, 1)';     // CMYK 100,30,30,0 USGS Color 944
            else if (grainSize === 'recrystallized') color = 'rgba(0, 102, 222, 1)';  // CMYK 100,60,13,0 USGS Color 927
            else if (grainSize === 'floatstone') color = 'rgba(77, 255, 255, 1)';     // CMYK 70,0,0,0 USGS Color 800
            else if (grainSize === 'rudstone') color = 'rgba(77, 204, 255, 1)';       // CMYK 70,20,0,0 USGS Color 803
            else if (grainSize === 'framestone') color = 'rgba(77, 128, 255, 1)';     // CMYK 70,50,0,0 USGS Color 806
            else if (grainSize === 'bafflestone') color = 'rgba(77, 128, 255, 1)';    // CMYK 70,50,0,0 USGS Color 806
            else if (grainSize === 'bindstone') color = 'rgba(77, 128, 255, 1)';      // CMYK 70,50,0,0 USGS Color 806
            // Misc. Lithologies
            else if (grainSize === 'evaporite') color = 'rgba(153, 77, 255, 1)';      // CMYK 40,70,0,0 USGS Color 508
            else if (grainSize === 'chert') color = 'rgba(102, 77, 77, 1)';           // CMYK 60,70,70,0
            else if (grainSize === 'ironstone') color = 'rgba(153, 0, 0, 1)';         // CMYK 40,100,100,0
            else if (grainSize === 'phosphatic') color = 'rgba(153, 255, 179, 1)';    // CMYK 40,0,30,0
            else if (grainSize === 'volcaniclastic') color = 'rgba(255, 128, 255, 1)';// CMYK 0,50,0,0
            else if (grainSize === 'organic_coal') color = 'rgba(0, 0, 0, 1)';        // CMYK 100,100,100,0 USGS Color 999
            else color = 'rgba(255, 255, 255, 1)';                                    // default white

            fill = new ol.style.Fill();
            fill.setColor(color);
          }
        }
      }
      else $log.error('Strat Interval indicated but no lithology for', featureProperties);
      return fill;
    }

    function loadPattern(src) {
      var fill = new ol.style.Fill();
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var img = new Image();
      img.src = 'img/sed/' + src + '.png';
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        var pattern = context.createPattern(img, 'repeat');
        fill.setColor(pattern);
        featureLayer.getLayersArray()[0].getSource().changed();    // Assumes the intervals on feature layer 0 (and other Spots on layer 1)
      };
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

    function getPolyFill(feature, resolution, isInterbed) {
      var featureProperties = feature.getProperties();

      // If a Strat Interval
      var fill = [];
      if (featureProperties.surface_feature &&
        featureProperties.surface_feature.surface_feature_type === 'strat_interval') {
        fill = getStratIntervalFill(featureProperties, resolution, isInterbed)
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

    function setFeatureLayer(inFeatureLayer) {
      featureLayer = inFeatureLayer;
    }

    function setFillPatterns(features) {
      // Limestone / Dolomite / Misc. Lithologies
      patterns['limestone'] = loadPattern('basic/LimeSimple');
      patterns['dolomite'] = loadPattern('basic/DoloSimple');
      patterns['evaporite'] = loadPattern('misc/EvaBasic');
      patterns['chert'] = loadPattern('misc/ChertBasic');
      patterns['phosphatic'] = loadPattern('misc/PhosBasic');
      patterns['volcaniclastic'] = loadPattern('misc/VolBasic');

      // Siliciclastic (Mudstone/Shale, Sandstone, Conglomerate, Breccia)
      patterns['mud_silt'] = loadPattern('basic/MudSimple');
      patterns['sandstone'] = loadPattern('basic/SandSimple');
      patterns['conglomerate'] = loadPattern('basic/CongSimple');
      patterns['breccia'] = loadPattern('basic/BrecSimple');

      // Mudstone/Shale
      patterns['clay'] = loadPattern('siliciclastics/ClayBasic');
      patterns['mud'] = loadPattern('siliciclastics/MudBasic');
      patterns['silt'] = loadPattern('siliciclastics/SiltBasic');
      // Sandstone
      patterns['sand_very_fin'] = loadPattern('siliciclastics/VFBasic');
      patterns['sand_fine_low'] = loadPattern('siliciclastics/FLBasic');
      patterns['sand_fine_upp'] = loadPattern('siliciclastics/FUBasic');
      patterns['sand_medium_l'] = loadPattern('siliciclastics/MLBasic');
      patterns['sand_medium_u'] = loadPattern('siliciclastics/MUBasic');
      patterns['sand_coarse_l'] = loadPattern('siliciclastics/CLBasic');
      patterns['sand_coarse_u'] = loadPattern('siliciclastics/CUBasic');
      patterns['sand_very_coa'] = loadPattern('siliciclastics/VCBasic');

      // Conglomerate
      patterns['congl_granule'] = loadPattern('siliciclastics/CGrBasic');
      patterns['congl_pebble'] = loadPattern('siliciclastics/CPebBasic');
      patterns['congl_cobble'] = loadPattern('siliciclastics/CCobBasic');
      patterns['congl_boulder'] = loadPattern('siliciclastics/CBoBasic');

      // Breccia
      patterns['brec_granule'] = loadPattern('siliciclastics/BGrBasic');
      patterns['brec_pebble'] = loadPattern('siliciclastics/BPebBasic');
      patterns['brec_cobble'] = loadPattern('siliciclastics/BCobBasic');
      patterns['brec_boulder'] = loadPattern('siliciclastics/BBoBasic');

      // Limestone
      patterns['li_bafflestone'] = loadPattern('limestone/LiBoBasic');
      patterns['li_bindstone'] = loadPattern('limestone/LiBoBasic');
      patterns['li_boundstone'] = loadPattern('limestone/LiBoBasic');
      patterns['li_floatstone'] = loadPattern('limestone/LiFloBasic');
      patterns['li_framestone'] = loadPattern('limestone/LiBoBasic');
      patterns['li_grainstone'] = loadPattern('limestone/LiGrBasic');
      patterns['li_mudstone'] = loadPattern('limestone/LiMudBasic');
      patterns['li_packstone'] = loadPattern('limestone/LiPaBasic');
      patterns['li_rudstone'] = loadPattern('limestone/LiRudBasic');
      patterns['li_wackestone'] = loadPattern('limestone/LiWaBasic');

      // Dolomite
      patterns['do_bafflestone'] = loadPattern('dolomite/DoBoBasic');
      patterns['do_bindstone'] = loadPattern('dolomite/DoBoBasic');
      patterns['do_boundstone'] = loadPattern('dolomite/DoBoBasic');
      patterns['do_floatstone'] = loadPattern('dolomite/DoFloBasic');
      patterns['do_framestone'] = loadPattern('dolomite/DoBoBasic');
      patterns['do_grainstone'] = loadPattern('dolomite/DoGrBasic');
      patterns['do_mudstone'] = loadPattern('dolomite/DoMudBasic');
      patterns['do_packstone'] = loadPattern('dolomite/DoPaBasic');
      patterns['do_rudstone'] = loadPattern('dolomite/DoRudBasic');
      patterns['do_wackestone'] = loadPattern('dolomite/DoWaBasic');

      // Misc. Lithologies
      patterns['evaporite'] = loadPattern('misc/EvaBasic');
      patterns['chert'] = loadPattern('misc/ChertBasic');
      patterns['phosphatic'] = loadPattern('misc/PhosBasic');
      patterns['volcaniclastic'] = loadPattern('misc/VolBasic');
    }
  }
}());
