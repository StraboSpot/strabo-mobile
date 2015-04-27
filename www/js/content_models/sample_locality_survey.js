angular.module('app')
  .addSampleLocalitySurvey = function ($scope) {

  $scope.sample_locality_survey = [
    {
      "name": "sample_id_name",
      "type": "text",
      "label": "Sample specific ID / Name",
      "required": "true",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "oriented_sample",
      "type": "select_one hz9zw76",
      "label": "Oriented Sample",
      "required": "true",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "sample_orientation_strike",
      "type": "integer",
      "label": "Sample Orientation Strike",
      "required": "true",
      "default": "",
      "hint": "What's the strike of orientation mark / surface?",
      "relevant": "${oriented_sample} = 'yes'",
      "constraint": ". <= 360 and . >= 0",
      "constraint_message": "Strike must be between 0-360."
    },
    {
      "name": "sample_orientation_dip",
      "type": "integer",
      "label": "Sample Orientation Dip",
      "required": "true",
      "default": "",
      "hint": "What's the dip of orientation mark / surface?",
      "relevant": "${oriented_sample} = 'yes'",
      "constraint": ". >= 0 and . <= 90",
      "constraint_message": "Dip must be between 0-90."
    },
    {
      "name": "material_type",
      "type": "select_one jq8qd30",
      "label": "Material Type",
      "required": "true",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "material_details",
      "type": "note",
      "label": "Material Details",
      "required": "false",
      "default": "",
      "hint": "",
      "relevant": "${material_type} != ''",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "approx_size_cm",
      "type": "integer",
      "label": "Approximate Size / Diameter (cm)",
      "required": "true",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "main_sampling_purpose",
      "type": "select_one to0mv13",
      "label": "Main Sampling Purpose",
      "required": "true",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "sample_description",
      "type": "note",
      "label": "Sample Description",
      "required": "false",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "other_comments_about_sampling",
      "type": "note",
      "label": "Other Comments About Sampling",
      "required": "false",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "inferred_age_ma",
      "type": "integer",
      "label": "Inferred Age (Ma)",
      "required": "false",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "default": "",
      "hint": "",
      "relevant": "",
      "constraint": "",
      "constraint_message": ""
    }
  ]
};