angular.module('app')
  .addShearZoneSurvey = function ($scope) {

  $scope.shear_zone_survey = [{
    "name": "thickness_m",
    "type": "integer",
    "label": "Thickness (m)",
    "hint": "What is the thickness of this shear zone in meters?",
    "required": "true",
    "constraint": ". >= 0",
    "constraint_message": "Thickness must be greater than 0.",
    "default": "",
    "relevant": ""
  },
    {
      "name": "strike_of_shear_zone_boundary",
      "type": "integer",
      "label": "Strike of Shear Zone Boundary",
      "hint": "",
      "required": "false",
      "constraint": ". >= 0 and . <= 360",
      "constraint_message": "Strike must be between 0-360.",
      "default": "",
      "relevant": ""
    },
    {
      "name": "dip_of_shear_zone_boundary",
      "type": "integer",
      "label": "Dip of Shear Zone Boundary",
      "hint": "",
      "required": "false",
      "constraint": ". >= 0 and . <= 90",
      "constraint_message": "Dip must be between 0-360.",
      "default": "",
      "relevant": ""
    },
    {
      "name": "fault_geometry",
      "type": "select_one ku2gk10",
      "label": "Shear Zone Movement Type",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": ""
    },
    {
      "name": "Movement",
      "type": "select_one ww1yf84",
      "label": "Strike-Slip Movement",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "${fault_geometry} = 'strike_slip'"
    },
    {
      "name": "dip_slip_movement",
      "type": "select_one dr9xt23",
      "label": "Dip-Slip Movement",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "${fault_geometry} = 'dip_slip'"
    },
    {
      "name": "oblique_movement",
      "type": "select_one os1df47",
      "label": "Oblique Movement",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "${fault_geometry} = 'oblique'"
    },
    {
      "name": "movement_justification",
      "type": "select_one kt81l04",
      "label": "Movement Justification",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "${fault_geometry} != ''"
    },
    {
      "name": "offset_markers",
      "type": "select_multiple uh1mv47",
      "label": "Offset Markers",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "${movement_justification} = 'offset'"
    },
    {
      "name": "piercing_point_detail",
      "type": "text",
      "label": "Piercing Point Description",
      "hint": "Specify piercing point.",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "selected(${offset_markers}, 'piercing_point')"
    },
    {
      "name": "marker_detail",
      "type": "text",
      "label": "Marker Type",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "selected(${offset_markers}, 'other_marker')"
    },
    {
      "name": "directional_indicators",
      "type": "select_multiple xd2fb20",
      "label": "Directional Indicators",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "${movement_justification} = 'directional_indicator'"
    },
    {
      "name": "feature_asymmetry_detail",
      "type": "text",
      "label": "Asymmetry Details",
      "hint": "porphyroblast/clast, folds, mica fish, etc",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": "selected(${directional_indicators}, 'shear_sense')"
    },
    {
      "name": "mineral_lineation_detail",
      "type": "text",
      "label": "Mineral Lineation Detail",
      "hint": "What is the mineral?",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "",
      "relevant": "selected(${directional_indicators}, 'mineral_lineat')"
    },
    {
      "name": "juxtaposes_rocks",
      "type": "select_multiple fq8rt60",
      "label": "Juxtaposes __________ rocks....",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": ""
    },
    {
      "name": "against_rocks",
      "type": "select_multiple kw6tp41",
      "label": "... against ________ rocks.",
      "hint": "",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "not_specified",
      "relevant": ""
    },
    {
      "name": "inferred_age_of_shear_zone_ma",
      "type": "integer",
      "label": "Inferred Age (Ma) of Shear Zone Activity",
      "hint": "Do you know when the shear zone was active?",
      "required": "false",
      "constraint": "",
      "constraint_message": "",
      "default": "",
      "relevant": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "hint": "",
      "required": "",
      "constraint": "",
      "constraint_message": "",
      "default": "",
      "relevant": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "hint": "",
      "required": "",
      "constraint": "",
      "constraint_message": "",
      "default": "",
      "relevant": ""
    }
  ]
};