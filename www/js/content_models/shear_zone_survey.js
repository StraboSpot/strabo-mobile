angular.module('app')
  .addShearZoneSurvey = function($scope) {

  $scope.shear_zone_survey = [
    {
      "name": "thickness__m",
      "type": "integer",
      "label": "Thickness (m)",
      "hint": "What is the thickness of this shear zone in meters?",
      "required": "true",
      "default": "not specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": ""
    },
    {
      "name": "Strike_of_shear_zone_boundary",
      "type": "integer",
      "label": "Strike of shear zone boundary:",
      "hint": "",
      "required": "false",
      "default": "",
      "constraint": ". >= 0 and . <= 360",
      "constraint_message": "Strike is out of range!",
      "relevant": ""
    },
    {
      "name": "Dip_of_shear_zone_boundary",
      "type": "integer",
      "label": "Dip of shear zone boundary",
      "hint": "",
      "required": "false",
      "default": "",
      "constraint": ". >= 0 and . <= 90",
      "constraint_message": "Dip is out of range!",
      "relevant": ""
    },
    {
      "name": "Fault_Geometry",
      "type": "select_one ku2gk10",
      "label": "Shear zone movement type:",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": ""
    },
    {
      "name": "Movement",
      "type": "select_one ww1yf84",
      "label": "Strike-Slip Movement:",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "${Fault_Geometry} = 'strike_slip'"
    },
    {
      "name": "Dip_Slip_Movement",
      "type": "select_one dr9xt23",
      "label": "Dip-Slip Movement:",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "${Fault_Geometry} = 'dip_slip'"
    },
    {
      "name": "Oblique_Movement",
      "type": "select_one os1df47",
      "label": "Oblique Movement:",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "${Fault_Geometry} = 'oblique'"
    },
    {
      "name": "Movement_Justification",
      "type": "select_one kt81l04",
      "label": "Movement Justification:",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "${Fault_Geometry} != ''"
    },
    {
      "name": "Offset_Markers",
      "type": "select_multiple uh1mv47",
      "label": "Offset Markers:",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "${Movement_Justification} = 'offset'"
    },
    {
      "name": "Piercing_Point_Detail",
      "type": "text",
      "label": "Piercing Point Description:",
      "hint": "Specify piercing point.",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "selected(${Offset_Markers}, 'piercing_point')"
    },
    {
      "name": "Marker_Detail",
      "type": "text",
      "label": "Marker type:",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "selected(${Offset_Markers}, 'other_marker')"
    },
    {
      "name": "Directional_Indicators",
      "type": "select_multiple xd2fb20",
      "label": "Directional Indicators:",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "${Movement_Justification} = 'directional_indicator'"
    },
    {
      "name": "Feature_Asymmetry_Detail",
      "type": "text",
      "label": "Asymmetry Details:",
      "hint": "porphyroblast/clast, folds, mica fish, etc",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": "selected(${Directional_Indicators}, 'shear_sense')"
    },
    {
      "name": "Mineral_Lineation_Detail",
      "type": "text",
      "label": "Mineral Lineation Detail:",
      "hint": "What is the mineral?",
      "required": "false",
      "default": "",
      "constraint": "",
      "constraint_message": "",
      "relevant": "selected(${Directional_Indicators}, 'mineral_lineat')"
    },
    {
      "name": "Juxtaposes_rocks",
      "type": "select_multiple fq8rt60",
      "label": "Juxtaposes __________ rocks....",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": ""
    },
    {
      "name": "__against_rocks",
      "type": "select_multiple kw6tp41",
      "label": "... against ________ rocks.",
      "hint": "",
      "required": "false",
      "default": "not_specified",
      "constraint": "",
      "constraint_message": "",
      "relevant": ""
    },
    {
      "name": "Inferred_age_of_shear_zone__Ma",
      "type": "integer",
      "label": "Inferred age (Ma) of shear zone activity:",
      "hint": "Do you know when the shear zone was active?",
      "required": "false",
      "default": "",
      "constraint": "",
      "constraint_message": "",
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
      "constraint_message": "",
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
      "constraint_message": "",
      "relevant": ""
    }
  ]
};