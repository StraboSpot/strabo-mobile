angular.module('app')
  .addFoldSurvey = function ($scope) {

  $scope.fold_survey = [
    {
      "name": "approx_amplitude",
      "type": "select_one zq9sr00",
      "label": "Approximate amplitude scale of related folding?",
      "required": "true",
      "default": "not specified",
      "hint": ""
    },
    {
      "name": "fold_geometry",
      "type": "select_one wg6ry31",
      "label": "Dominant Fold Geometry:",
      "required": "true",
      "default": "not specified",
      "hint": "What is the shape of the fold when looking down-plunge?"
    },
    {
      "name": "fold_shape",
      "type": "select_one fa6tb91",
      "label": "Dominant Fold Shape",
      "required": "true",
      "default": "not specified",
      "hint": ""
    },
    {
      "name": "fold_attitude",
      "type": "select_one iq4bx64",
      "label": "Dominant Fold Attitude:",
      "required": "true",
      "default": "not specified",
      "hint": ""
    },
    {
      "name": "tightness",
      "type": "select_one ao3ks66",
      "label": "Tightness / Interlimb angle",
      "required": "true",
      "default": "",
      "hint": ""
    },
    {
      "name": "vergence",
      "type": "select_one iu9ug45",
      "label": "Vergence?",
      "required": "true",
      "default": "not specified",
      "hint": "Approximate vergence direction from fold asymmetry or other..."
    },
    {
      "name": "button_to_link_to_existing_ori",
      "type": "text",
      "label": "Button to link to existing orientation",
      "required": "false",
      "default": "",
      "hint": ""
    },
    {
      "name": "button_to_link_to_new_orientat",
      "type": "text",
      "label": "Button to link to new orientatoin",
      "required": "false",
      "default": "",
      "hint": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "default": "",
      "hint": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "default": "",
      "hint": ""
    }
  ]
};