angular.module('app')
  .addContactSurvey = function ($scope) {

  $scope.contact_survey = [
    {
      "name": "contact_type",
      "type": "select_one lx9ax28",
      "label": "Contact Type:",
      "required": "true",
      "default": "not specified",
      "relevant": "",
      "hint": ""
    },
    {
      "name": "depositional_contact_type",
      "type": "select_one bi4sw60",
      "label": "Depositional Contact Type:",
      "required": "true",
      "default": "not specified",
      "relevant": "${contact_type} = 'depositional'",
      "hint": ""
    },
    {
      "name": "unconformity_type",
      "type": "select_one dq27t21",
      "label": "Unconformity Type:",
      "required": "true",
      "default": "not specified",
      "relevant": "${depositional_contact_type} = 'unconformity'",
      "hint": ""
    },
    {
      "name": "intruding_feature_is",
      "type": "select_one cj4zw02",
      "label": "intruding feature is:",
      "required": "true",
      "default": "not specified",
      "relevant": "${contact_type} = 'intrusive'",
      "hint": "What type of feature is intruding?"
    },
    {
      "name": "metamorphic_contact_type",
      "type": "select_one pb5wo52",
      "label": "Metamorphic Contact Type:",
      "required": "true",
      "default": "not specified",
      "relevant": "${contact_type} = 'metamorphic'",
      "hint": ""
    },
    {
      "name": "metamorphic_contact_other_det",
      "type": "note",
      "label": "Metamorphic Contact (other detail)",
      "required": "false",
      "default": "",
      "relevant": "${metamorphic_contact_type} = 'other'",
      "hint": ""
    },
    {
      "name": "marker_layer_details",
      "type": "note",
      "label": "Marker Layer details:",
      "required": "true",
      "default": "no details specified.",
      "relevant": "${contact_type} = 'marker_layer'",
      "hint": "Notes about the marker layer"
    },
    {
      "name": "contact_character",
      "type": "select_one vv9tu90",
      "label": "Contact Character:",
      "required": "true",
      "default": "",
      "relevant": "",
      "hint": ""
    },
    {
      "name": "button_to_link_to_existing_ori",
      "type": "text",
      "label": "Button to link to existing orientation",
      "required": "false",
      "default": "",
      "relevant": "",
      "hint": ""
    },
    {
      "name": "button_to_link_to_new_orientat",
      "type": "text",
      "label": "Button to link to new orientatoin",
      "required": "false",
      "default": "",
      "relevant": "",
      "hint": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "default": "",
      "relevant": "",
      "hint": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "default": "",
      "relevant": "",
      "hint": ""
    }
  ]
};