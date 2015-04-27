angular.module('app')
  .addContactSurvey = function ($scope) {

  $scope.contact_survey = [
    {
      "name": "contact_type",
      "type": "select_one lx9ax28",
      "label": "Contact Type",
      "required": "true",
      "relevant": "",
      "hint": "",
      "default": ""
    },
    {
      "name": "depositional_contact_type",
      "type": "select_one bi4sw60",
      "label": "Depositional Contact Type",
      "required": "true",
      "relevant": "${contact_type} = 'depositional'",
      "hint": "",
      "default": ""
    },
    {
      "name": "unconformity_type",
      "type": "select_one dq27t21",
      "label": "Unconformity Type",
      "required": "true",
      "relevant": "${depositional_contact_type} = 'unconformity'",
      "hint": "",
      "default": ""
    },
    {
      "name": "intruding_feature",
      "type": "select_one cj4zw02",
      "label": "Intruding Feature",
      "required": "true",
      "relevant": "${contact_type} = 'intrusive'",
      "hint": "What type of feature is intruding?",
      "default": ""
    },
    {
      "name": "metamorphic_contact_type",
      "type": "select_one pb5wo52",
      "label": "Metamorphic Contact Type",
      "required": "true",
      "relevant": "${contact_type} = 'metamorphic'",
      "hint": "",
      "default": ""
    },
    {
      "name": "metamorphic_contact_other_det",
      "type": "note",
      "label": "Metamorphic Contact (other detail)",
      "required": "false",
      "relevant": "${metamorphic_contact_type} = 'other'",
      "hint": "",
      "default": ""
    },
    {
      "name": "marker_layer_details",
      "type": "note",
      "label": "Marker Layer Details",
      "required": "true",
      "relevant": "${contact_type} = 'marker_layer'",
      "hint": "Notes about the marker layer",
      "default": "No details specified."
    },
    {
      "name": "contact_character",
      "type": "select_one vv9tu90",
      "label": "Contact Character",
      "required": "true",
      "relevant": "",
      "hint": "",
      "default": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "relevant": "",
      "hint": "",
      "default": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "relevant": "",
      "hint": "",
      "default": ""
    }
  ]
};