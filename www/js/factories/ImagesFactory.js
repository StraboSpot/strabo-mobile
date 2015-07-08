'use strict';

angular.module('app')
  .factory('SymbolsFactory', function() {
    var symbols = {
      axial_planar_inclined: 'img/geology/cleavage_inclined.png',
      axial_planar_vertical: 'img/geology/cleavage_vertical.png',
      bedding_horizontal: 'img/geology/bedding_horizontal.png',
      bedding_inclined: 'img/geology/bedding_inclined.png',
      bedding_vertical: 'img/geology/bedding_vertical.png',
      contact_inclined: 'img/geology/contact_inclined.png',
      contact_vertical: 'img/geology/contact_vertical.png',
      fault_plane_inclined: 'img/geology/fault_surface_inclined.png',
      fault_plane_vertical: 'img/geology/fault_surface_vertical.png',
      fold_hinge_inclined: 'img/geology/fold_axis.png',
      foliation_horizontal: 'img/geology/foliation_horizontal.png',
      foliation_inclined: 'img/geology/foliation_general_inclined.png',
      foliation_vertical: 'img/geology/foliation_general_vertical.png',
      joint_inclined: 'img/geology/joint_surface_inclined.png',
      joint_vertical: 'img/geology/joint_surface_vertical.png',
      lineation_general: 'img/geology/lineation_general.png',
      planar_general: 'img/geology/point.png',
      shear_zone_inclined: 'img/geology/shear_zone_inclined.png',
      shear_zone_vertical: 'img/geology/shear_zone_vertical.png',
      striation: 'img/geology/striation.png'
    };

    var factory = {};
    factory.getSymbolPath = function(feature_type, pORl, orientation) {

      // Set a default symbol by whether feature is planar or linear
      var default_symbol = (pORl == 'planar') ? symbols.planar_general : symbols.lineation_general;

      // Substitute for missing symbol files
      feature_type = (feature_type == 'fracture') ? 'fault_plane' : feature_type;
      feature_type = (feature_type == 'shear_fracture') ? 'fault_plane' : feature_type;
      feature_type = (feature_type == 'vein') ? 'joint' : feature_type;
      feature_type = (feature_type == 'fault') ? 'fault_plane' : feature_type;
      feature_type = (feature_type == 'solid_state') ? 'lineation_general' : feature_type;
      feature_type = (feature_type == 'intersection') ? 'lineation_general' : feature_type;
      feature_type = (feature_type == 'flow') ? 'lineation_general' : feature_type;
      feature_type = (feature_type == 'vector') ? 'lineation_general' : feature_type;

      var src;
      switch (true) {
        case (orientation == 0):
          src = feature_type + '_horizontal';
          return symbols[src] || default_symbol;
        case ((orientation > 0) && (orientation < 90)):
          src = feature_type + '_inclined';
          return symbols[src] || default_symbol;
        case (orientation == 90):
          src = feature_type + '_vertical';
          return symbols[src] || default_symbol;
        default:
          return default_symbol;
      }
    };

    return factory;
  });
