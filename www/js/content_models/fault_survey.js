angular.module('app')
  .addFaultSurvey = function ($scope) {

  $scope.fault_survey = [
    {
      "name": "thickness_m",
      "type": "integer",
      "label": "Thickness (m):",
      "hint": "What is the thickness of this fault in meters?",
      "required": "true",
      "default": "not_specified",
      "constraint": ". > 0",
      "relevant": ""
    },
    {
      "name": "strike_of_fault",
      "type": "integer",
      "label": "Strike of fault:",
      "hint": "",
      "required": "true",
      "default": "",
      "constraint": ". <= 360 and . >= 0",
      "relevant": ""
    },
    {
      "name": "dip_of_fault",
      "type": "integer",
      "label": "Dip of fault:",
      "hint": "",
      "required": "true",
      "default": "",
      "constraint": ". >= 0 and . <= 90",
      "relevant": ""
    },
    {
      "name": "fault_geometry",
      "type": "select_one ku2gk10",
      "label": "Type of fault:",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": ""
    },
    {
      "name": "strike_slip_movement",
      "type": "select_one ww1yf84",
      "label": "Strike-Slip Movement:",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": "${fault_geometry} = 'strike_slip'"
    },
    {
      "name": "dip_slip_movement",
      "type": "select_one dr9xt23",
      "label": "Dip-Slip Movement:",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": "${fault_geometry} = 'dip_slip'"
    },
    {
      "name": "oblique_movement",
      "type": "select_one os1df47",
      "label": "Oblique Movement:",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": "${fault_geometry} = 'oblique'"
    },
    {
      "name": "movement_justification",
      "type": "select_one kt81l04",
      "label": "Movement Justification:",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": "${strike_slip_movement} = 'dextral' or ${strike_slip_movement} = 'sinistral' or ${dip_slip_movement} = 'reverse' or ${dip_slip_movement} = 'normal' or ${oblique_movement} = 'dextral_reverse' or ${oblique_movement} = 'dextral_normal' or ${oblique_movement} = 'sinistral_reverse' or ${oblique_movement} = 'sinistral_normal'"
    },
    {
      "name": "offset_markers",
      "type": "select_multiple uh1mv47",
      "label": "Offset Markers:",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": "${movement_justification} = 'offset'"
    },
    {
      "name": "marker_detail",
      "type": "text",
      "label": "Marker Detail:",
      "hint": "",
      "required": "true",
      "default": "not specified",
      "constraint": "",
      "relevant": "selected(${offset_markers}, 'geomorphic_feature') or selected(${offset_markers}, 'other_marker')"
    },
    {
      "name": "directional_indicators",
      "type": "select_multiple xd2fb20",
      "label": "Directional Indicators:",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": "${movement_justification} = 'directional_indicator'"
    },
    {
      "name": "feature_asymmetry_detail",
      "type": "text",
      "label": "Asymmetry Details:",
      "hint": "porphyroblast/clast, folds, mica fish, etc",
      "required": "true",
      "default": "",
      "constraint": "",
      "relevant": "selected(${directional_indicators}, 'shear_sense')"
    },
    {
      "name": "piercing_point_detail",
      "type": "text",
      "label": "Piercing Point Detail",
      "hint": "Specify piercing point.",
      "required": "true",
      "default": "",
      "constraint": "",
      "relevant": "selected(${directional_indicators}, 'piercing_point')"
    },
    {
      "name": "mineral_lineation_detail",
      "type": "text",
      "label": "Mineral Lineation Detail",
      "hint": "What is the mineral?",
      "required": "false",
      "default": "",
      "constraint": "",
      "relevant": "selected(${directional_indicators}, 'mineral_lineat')"
    },
    {
      "name": "juxtaposes_rocks",
      "type": "select_multiple fq8rt60",
      "label": "Juxtaposes __________ rocks....",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": ""
    },
    {
      "name": "against_rocks",
      "type": "select_multiple kw6tp41",
      "label": "... against ________ rocks.",
      "hint": "",
      "required": "true",
      "default": "not_specified",
      "constraint": "",
      "relevant": ""
    },
    {
      "name": "button_to_link_to_existing_ori",
      "type": "text",
      "label": "Button to link to existing orientation",
      "hint": "",
      "required": "false",
      "default": "",
      "constraint": "",
      "relevant": ""
    },
    {
      "name": "button_to_link_to_new_orientat",
      "type": "text",
      "label": "Button to link to new orientatoin",
      "hint": "",
      "required": "false",
      "default": "",
      "constraint": "",
      "relevant": ""
    },
    {
      "name": "inferred_age_of_faulting_ma",
      "type": "integer",
      "label": "Inferred age (Ma) of faulting:",
      "hint": "",
      "required": "false",
      "default": "",
      "constraint": "",
      "relevant": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "hint": "",
      "required": "",
      "default": "",
      "constraint": "",
      "relevant": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "hint": "",
      "required": "",
      "default": "",
      "constraint": "",
      "relevant": ""
    }
  ]
};