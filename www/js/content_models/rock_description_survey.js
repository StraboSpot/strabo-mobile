angular.module('app')
  .addRockDescriptionSurvey = function ($scope) {

  $scope.rock_description_survey = [
    {
      "name": "unit_name",
      "type": "text",
      "label": "Map Unit Name",
      "required": "false",
      "default": "N/A"
    },
    {
      "name": "unit_abbreviation",
      "type": "text",
      "label": "Unit Label (abbreviation)",
      "required": "true",
      "default": "N/A"
    },
    {
      "name": "rock_type",
      "type": "select_one rm0pv08",
      "label": "Rock Type",
      "required": "false",
      "default": ""
    },
    {
      "name": "description",
      "type": "note",
      "label": "Description / Lithology",
      "required": "false",
      "default": ""
    },
    {
      "name": "age_ma",
      "type": "integer",
      "label": "Age (Ma)",
      "required": "false",
      "default": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "default": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "default": ""
    }
  ]
};