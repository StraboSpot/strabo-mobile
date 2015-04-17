angular.module('app')
  .addSampleLocalitySurvey = function ($scope) {

  $scope.sample_locality_survey = [
    {
      "name": "sample_id_name",
      "type": "text",
      "label": "Sample specific ID / name:",
      "required": "true",
      "default": "not specified",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "oriented_sample",
      "type": "select_one hz9zw76",
      "label": "Oriented sample?",
      "required": "true",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "sample_orientation_strike",
      "type": "integer",
      "label": "Sample Orientation Strike:",
      "required": "false",
      "default": "",
      "hint": "What's the strike of orientation mark / surface?",
      "relevant": "${oriented_sample} = 'yes'",
      "constraint": ". <= 360 and . >= 0"
    },
    {
      "name": "sample_orientation_dip",
      "type": "integer",
      "label": "Sample Orientation Dip",
      "required": "true",
      "default": "",
      "hint": "What's the dip of orientation mark / surface?",
      "relevant": "${oriented_sample} = 'yes'",
      "constraint": ". >= 0 and . <= 90"
    },
    {
      "name": "material_type",
      "type": "select_one jq8qd30",
      "label": "material type:",
      "required": "true",
      "default": "not specified",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "material_details",
      "type": "note",
      "label": "material details:",
      "required": "false",
      "default": "",
      "hint": "",
      "relevant": "${material_type} != ''",
      "constraint": ""
    },
    {
      "name": "approx_size_cm",
      "type": "integer",
      "label": "approximate size / diameter (cm)",
      "required": "true",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "main_sampling_purpose",
      "type": "select_one to0mv13",
      "label": "main sampling purpose:",
      "required": "true",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "sample_description",
      "type": "note",
      "label": "Sample Description:",
      "required": "false",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "other_comments_about_sampling",
      "type": "note",
      "label": "Other comments about sampling:",
      "required": "false",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "inferred_age_ma",
      "type": "integer",
      "label": "inferred age (Ma)?",
      "required": "false",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": ""
    }
  ]
};