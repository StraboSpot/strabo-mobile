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
    }

    function getStratIntervalFill(featureProperties, resolution) {
      var fill;
      var color;
      if (featureProperties.sed && featureProperties.sed.lithologies) {
        //$log.log(props.sed.lithologies);

        var stratSectionSettings = StratSectionFactory.getStratSectionSettings(featureProperties.strat_section_id);
        if (stratSectionSettings.display_lithology_patterns) {
          if (stratSectionSettings.column_profile === 'basic_lithologies') {
            var lithology = featureProperties.sed.lithologies;

            // Limestone / Dolomite / Misc. Lithologies
            if (lithology.primary_lithology === 'limestone') fill = patterns['limestone'];
            else if (lithology.primary_lithology === 'dolomite') fill = patterns['dolomite'];
            //else if (lithology.primary_lithology === 'organic_coal') patterns[grainSize] = loadPattern('misc/SiltBasic');
            else if (lithology.primary_lithology === 'evaporite') fill = patterns['evaporite'];
            else if (lithology.primary_lithology === 'chert') fill = patterns['chert'];
            //else if (lithology.primary_lithology === 'ironstone') patterns[grainSize] = loadPattern('misc/SiltBasic');
            else if (lithology.primary_lithology === 'phosphatic') fill = patterns['phosphatic'];
            else if (lithology.primary_lithology === 'volcaniclastic') fill = patterns['volcaniclastic'];

            // Siliciclastic (Mudstone/Shale, Sandstone, Conglomerate, Breccia)
            else if (lithology.mud_silt_principal_grain_size) fill = patterns['mud_silt'];
            else if (lithology.sand_principal_grain_size) fill = patterns['sandstone'];
            else if (lithology.congl_principal_grain_size) fill = patterns['conglomerate'];
            else if (lithology.breccia_principal_grain_size) fill = patterns['breccia'];
          }
          else {
            var primaryLithology = featureProperties.sed.lithologies.primary_lithology;
            var grainSize = featureProperties.sed.lithologies.mud_silt_principal_grain_size ||
              featureProperties.sed.lithologies.sand_principal_grain_size ||
              featureProperties.sed.lithologies.congl_principal_grain_size ||
              featureProperties.sed.lithologies.breccia_principal_grain_size ||
              featureProperties.sed.lithologies.principal_dunham_class ||
              featureProperties.sed.lithologies.primary_lithology;
            if (primaryLithology === 'limestone') fill = patterns['li_' + grainSize];
            else if (primaryLithology === 'dolomite') fill = patterns['do_' + grainSize];
            else if (primaryLithology === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'conglomerate') {
              fill = patterns['congl_' + grainSize];
            }
            else if (primaryLithology === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'breccia') {
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
            var lithology = featureProperties.sed.lithologies;

            // Limestone / Dolomite / Misc. Lithologies
            if (lithology.primary_lithology === 'limestone') color = 'rgba(77, 255, 222, 1)';           // CMYK 70,0,13,0 USGS Color 820
            else if (lithology.primary_lithology === 'dolomite') color = 'rgba(77, 255, 179, 1)';       // CMYK 70,0,30,0 USGS Color 840
            else if (lithology.primary_lithology === 'organic_coal') color = 'rgba(0, 0, 0, 1)';        // CMYK 100,100,100,0 USGS Color 999
            else if (lithology.primary_lithology === 'evaporite') color = 'rgba(153, 77, 255, 1)';      // CMYK 40,70,0,0 USGS Color 508;
            else if (lithology.primary_lithology === 'chert') color = 'rgba(102, 77, 77, 1)';           // CMYK 60,70,70,0
            else if (lithology.primary_lithology === 'ironstone') color = 'rgba(153, 0, 0, 1)';         // CMYK 40,100,100,0
            else if (lithology.primary_lithology === 'phosphatic') color = 'rgba(153, 255, 179, 1)';    // CMYK 40,0,30,0
            else if (lithology.primary_lithology === 'volcaniclastic') color = 'rgba(255, 128, 255, 1)';// CMYK 0,50,0,0

            // Siliciclastic (Mudstone/Shale, Sandstone, Conglomerate, Breccia)
            else if (lithology.mud_silt_principal_grain_size) color = 'rgba(128, 222, 77, 1)';          // CMYK 50,13,70,0 USGS Color 682
            else if (lithology.sand_principal_grain_size) color = 'rgba(255, 255, 77, 1)';              // CMYK 0,0,70,0 USGS Color 80
            else if (lithology.congl_principal_grain_size) color = 'rgba(255, 102, 0, 1)';              // CMYK 0,60,100,0 USGS Color 97
            else if (lithology.breccia_principal_grain_size) color = 'rgba(213, 0, 0, 1)';              // CMYK 13,100,100,4

            else color = 'rgba(255, 255, 255, 1)';                                                      // default white

            fill = new ol.style.Fill();
            fill.setColor(color);
          }
          else {
            var lithology = featureProperties.sed.lithologies.mud_silt_principal_grain_size ||
              featureProperties.sed.lithologies.sand_principal_grain_size ||
              featureProperties.sed.lithologies.congl_principal_grain_size ||
              featureProperties.sed.lithologies.breccia_principal_grain_size ||
              featureProperties.sed.lithologies.principal_dunham_class ||
              featureProperties.sed.lithologies.primary_lithology;
            // Mudstone/Shale
            if (lithology === 'clay') color = 'rgba(128, 222, 77, 1)';                // CMYK 50,13,70,0 USGS Color 682
            else if (lithology === 'mud') color = 'rgba(77, 255, 0, 1)';              // CMYK 70,0,100,0 USGS Color 890
            else if (lithology === 'silt') color = 'rgba(153, 255, 102, 1)';          // CMYK 40,0,60,0 USGS Color 570
            // Sandstone
            else if (lithology === 'sand_very_fin') color = 'rgba(255, 255, 179, 1)'; // CMYK 0,0,30,0 USGS Color 40
            else if (lithology === 'sand_fine_low') color = 'rgba(255, 255, 153, 1)'; // CMYK 0,0,40,0 USGS Color 50
            else if (lithology === 'sand_fine_upp') color = 'rgba(255, 255, 128, 1)'; // CMYK 0,0,50,0 USGS Color 60
            else if (lithology === 'sand_medium_l') color = 'rgba(255, 255, 102, 1)'; // CMYK 0,0,60,0 USGS Color 70
            else if (lithology === 'sand_medium_u') color = 'rgba(255, 255, 77, 1)';  // CMYK 0,0,70,0 USGS Color 80
            else if (lithology === 'sand_coarse_l') color = 'rgba(255, 255, 0, 1)';   // CMYK 0,0,100,0 USGS Color 90
            else if (lithology === 'sand_coarse_u') color = 'rgba(255, 235, 0, 1)';   // CMYK 0,8,100,0 USGS Color 91
            else if (lithology === 'sand_very_coa') color = 'rgba(255, 222, 0, 1)';   // CMYK 0,13,100,0 USGS Color 92
            // Conglomerate
            else if (featureProperties.sed.lithologies.primary_lithology === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'conglomerate') {
              if (lithology === 'granule') color = 'rgba(255, 153, 0, 1)';            // CMYK 0,40,100,0 USGS Color 95
              else if (lithology === 'pebble') color = 'rgba(255, 128, 0, 1)';        // CMYK 0,50,100,0 USGS Color 96
              else if (lithology === 'cobble') color = 'rgba(255, 102, 0, 1)';        // CMYK 0,60,100,0 USGS Color 97
              else if (lithology === 'boulder') color = 'rgba(255, 77, 0, 1)';        // CMYK 0,70,100,0 USGS Color 98
            }
            // Breccia
            else if (featureProperties.sed.lithologies.primary_lithology === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'breccia') {
              if (lithology === 'granule') color = 'rgba(230, 0, 0, 1)';              // CMYK 10,100,100,0 USGS Color 95
              else if (lithology === 'pebble') color = 'rgba(204, 0, 0, 1)';          // CMYK 20,100,100,0 USGS Color 96
              else if (lithology === 'cobble') color = 'rgba(179, 0, 0, 1)';          // CMYK 30,100,100,0 USGS Color 97
              else if (lithology === 'boulder') color = 'rgba(153, 0, 0, 1)';         // CMYK 40,100,100,0 USGS Color 98
            }
            // Limestone / Dolomite
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
            // Misc. Lithologies
            else if (lithology === 'evaporite') color = 'rgba(153, 77, 255, 1)';      // CMYK 40,70,0,0 USGS Color 508
            else if (lithology === 'chert') color = 'rgba(102, 77, 77, 1)';           // CMYK 60,70,70,0
            else if (lithology === 'ironstone') color = 'rgba(153, 0, 0, 1)';         // CMYK 40,100,100,0
            else if (lithology === 'phosphatic') color = 'rgba(153, 255, 179, 1)';    // CMYK 40,0,30,0
            else if (lithology === 'volcaniclastic') color = 'rgba(255, 128, 255, 1)';// CMYK 0,50,0,0
            else if (lithology === 'organic_coal') color = 'rgba(0, 0, 0, 1)';        // CMYK 100,100,100,0 USGS Color 999
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

    function setFeatureLayer(inFeatureLayer) {
      featureLayer = inFeatureLayer;
    }

    function setFillPatterns(features) {
      _.each(features, function (feature) {
        var featureProperties = feature.getProperties();
        if (featureProperties.sed && featureProperties.sed.lithologies) {
          // Basic Lithologies Column Profile
          var stratSectionSettings = StratSectionFactory.getStratSectionSettings(featureProperties.strat_section_id);
          if (stratSectionSettings.column_profile === 'basic_lithologies') {
            var lithology = featureProperties.sed.lithologies;

            // Limestone / Dolomite / Misc. Lithologies
            if (lithology.primary_lithology === 'limestone') patterns['limestone'] = loadPattern('basic/LimeSimple');
            else if (lithology.primary_lithology === 'dolomite') patterns['dolomite'] = loadPattern('basic/DoloSimple');
            //else if (lithology.primary_lithology === 'organic_coal') patterns[grainSize] = loadPattern('misc/SiltBasic');
            else if (lithology.primary_lithology === 'evaporite') patterns['evaporite'] = loadPattern('misc/EvaBasic');
            else if (lithology.primary_lithology === 'chert') patterns['chert'] = loadPattern('misc/ChertBasic');
            //else if (lithology.primary_lithology === 'ironstone') patterns[grainSize] = loadPattern('misc/SiltBasic');
            else if (lithology.primary_lithology === 'phosphatic') patterns['phosphatic'] = loadPattern('misc/PhosBasic');
            else if (lithology.primary_lithology === 'volcaniclastic') patterns['volcaniclastic'] = loadPattern('misc/VolBasic');

            // Siliciclastic (Mudstone/Shale, Sandstone, Conglomerate, Breccia)
            else if (lithology.mud_silt_principal_grain_size) patterns['mud_silt'] = loadPattern('basic/MudSimple');
            else if (lithology.sand_principal_grain_size) patterns['sandstone'] = loadPattern('basic/SandSimple');
            else if (lithology.congl_principal_grain_size) patterns['conglomerate'] = loadPattern('basic/CongSimple');
            else if (lithology.breccia_principal_grain_size) patterns['breccia'] = loadPattern('basic/BrecSimple');
          }
          else {
            var primaryLithology = featureProperties.sed.lithologies.primary_lithology;
            var grainSize = featureProperties.sed.lithologies.mud_silt_principal_grain_size ||
              featureProperties.sed.lithologies.sand_principal_grain_size ||
              featureProperties.sed.lithologies.congl_principal_grain_size ||
              featureProperties.sed.lithologies.breccia_principal_grain_size ||
              featureProperties.sed.lithologies.principal_dunham_class ||
              featureProperties.sed.lithologies.primary_lithology;
            // Mudstone/Shale
            if (grainSize === 'clay') patterns[grainSize] = loadPattern('siliciclastics/ClayBasic');
            else if (grainSize === 'mud') patterns[grainSize] = loadPattern('siliciclastics/MudBasic');
            else if (grainSize === 'silt') patterns[grainSize] = loadPattern('siliciclastics/SiltBasic');
            // Sandstone
            else if (grainSize === 'sand_very_fin') patterns[grainSize] = loadPattern('siliciclastics/VFBasic');
            else if (grainSize === 'sand_fine_low') patterns[grainSize] = loadPattern('siliciclastics/FLBasic');
            else if (grainSize === 'sand_fine_upp') patterns[grainSize] = loadPattern('siliciclastics/FUBasic');
            else if (grainSize === 'sand_medium_l') patterns[grainSize] = loadPattern('siliciclastics/MLBasic');
            else if (grainSize === 'sand_medium_u') patterns[grainSize] = loadPattern('siliciclastics/MUBasic');
            else if (grainSize === 'sand_coarse_l') patterns[grainSize] = loadPattern('siliciclastics/CLBasic');
            else if (grainSize === 'sand_coarse_u') patterns[grainSize] = loadPattern('siliciclastics/CUBasic');
            else if (grainSize === 'sand_very_coa') patterns[grainSize] = loadPattern('siliciclastics/VCBasic');
            // Conglomerate
            else if (primaryLithology === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'conglomerate') {
              if (grainSize === 'granule') patterns['congl_' + grainSize] = loadPattern('siliciclastics/CGrBasic');
              else if (grainSize === 'pebble') patterns['congl_' + grainSize] = loadPattern('siliciclastics/CPebBasic');
              else if (grainSize === 'cobble') patterns['congl_' + grainSize] = loadPattern('siliciclastics/CCobBasic');
              else if (grainSize === 'boulder') patterns['congl_' + grainSize] = loadPattern('siliciclastics/CBoBasic');
            }
            // Breccia
            else if (primaryLithology === 'siliciclastic' &&
              featureProperties.sed.lithologies.principal_siliciclastic_type === 'breccia') {
              if (grainSize === 'granule') patterns['brec_' + grainSize] = loadPattern('siliciclastics/BGrBasic');
              else if (grainSize === 'pebble') patterns['brec_' + grainSize] = loadPattern('siliciclastics/BPebBasic');
              else if (grainSize === 'cobble') patterns['brec_' + grainSize] = loadPattern('siliciclastics/BCobBasic');
              else if (grainSize === 'boulder') patterns['brec_' + grainSize] = loadPattern('siliciclastics/BBoBasic');
            }
            // Limestone
            else if (primaryLithology === 'limestone') {
              if (grainSize === 'bafflestone') patterns['li_' + grainSize] = loadPattern('limestone/LiBoBasic');
              else if (grainSize === 'bindstone') patterns['li_' + grainSize] = loadPattern('limestone/LiBoBasic');
              else if (grainSize === 'boundstone') patterns['li_' + grainSize] = loadPattern('limestone/LiBoBasic');
              else if (grainSize === 'floatstone') patterns['li_' + grainSize] = loadPattern('limestone/LiFloBasic');
              else if (grainSize === 'framestone') patterns['li_' + grainSize] = loadPattern('limestone/LiBoBasic');
              else if (grainSize === 'grainstone') patterns['li_' + grainSize] = loadPattern('limestone/LiGrBasic');
              else if (grainSize === 'mudstone') patterns['li_' + grainSize] = loadPattern('limestone/LiMudBasic');
              else if (grainSize === 'packstone') patterns['li_' + grainSize] = loadPattern('limestone/LiPaBasic');
              else if (grainSize === 'rudstone') patterns['li_' + grainSize] = loadPattern('limestone/LiRudBasic');
              else if (grainSize === 'wackestone') patterns['li_' + grainSize] = loadPattern('limestone/LiWaBasic');
              //else if (grainSize === 'cementstone') patterns['li_' + grainSize] = loadPattern('limestone/SiltBasic');
              //else if (grainSize === 'recrystallized') patterns['li_' + grainSize] = loadPattern('limestone/SiltBasic');
            }
            // Dolomite
            else if (primaryLithology === 'dolomite') {
              if (grainSize === 'bafflestone') patterns['do_' + grainSize] = loadPattern('dolomite/DoBoBasic');
              else if (grainSize === 'bindstone') patterns['do_' + grainSize] = loadPattern('dolomite/DoBoBasic');
              else if (grainSize === 'boundstone') patterns['do_' + grainSize] = loadPattern('dolomite/DoBoBasic');
              else if (grainSize === 'floatstone') patterns['do_' + grainSize] = loadPattern('dolomite/DoFloBasic');
              else if (grainSize === 'framestone') patterns['do_' + grainSize] = loadPattern('dolomite/DoBoBasic');
              else if (grainSize === 'grainstone') patterns['do_' + grainSize] = loadPattern('dolomite/DoGrBasic');
              else if (grainSize === 'mudstone') patterns['do_' + grainSize] = loadPattern('dolomite/DoMudBasic');
              else if (grainSize === 'packstone') patterns['do_' + grainSize] = loadPattern('dolomite/DoPaBasic');
              else if (grainSize === 'rudstone') patterns['do_' + grainSize] = loadPattern('dolomite/DoRudBasic');
              else if (grainSize === 'wackestone') patterns['do_' + grainSize] = loadPattern('dolomite/DoWaBasic');
              //else if (grainSize === 'cementstone') patterns['do_' + grainSize] = loadPattern('dolomite/SiltBasic');
              //else if (grainSize === 'recrystallized') patterns['do_' + grainSize] = loadPattern('dolomite/SiltBasic');
            }
            // Misc. Lithologies
            else if (grainSize === 'evaporite') patterns[grainSize] = loadPattern('misc/EvaBasic');
            else if (grainSize === 'chert') patterns[grainSize] = loadPattern('misc/ChertBasic');
            //else if (grainSize === 'ironstone') patterns[grainSize] = loadPattern('misc/SiltBasic');
            else if (grainSize === 'phosphatic') patterns[grainSize] = loadPattern('misc/PhosBasic');
            else if (grainSize === 'volcaniclastic') patterns[grainSize] = loadPattern('misc/VolBasic');
            //else if (grainSize === 'organic_coal') patterns[grainSize] = loadPattern('misc/SiltBasic');
          }
        }
      });
    }
  }
}());
