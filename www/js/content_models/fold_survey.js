angular.module('app')
  .addFoldSurvey = function ($scope) {

  $scope.fold_survey = [
    {
      "name": "approx_amplitude",
      "type": "select_one zq9sr00",
      "label": "Approximate Amplitude Scale of Related Folding",
      "required": "true",
      "hint": ""
    },
    {
      "name": "fold_geometry",
      "type": "select_one wg6ry31",
      "label": "Dominant Fold Geometry",
      "required": "true",
      "hint": "What is the shape of the fold when looking down-plunge?"
    },
    {
      "name": "fold_shape",
      "type": "select_one fa6tb91",
      "label": "Dominant Fold Shape",
      "required": "true",
      "hint": ""
    },
    {
      "name": "fold_attitude",
      "type": "select_one iq4bx64",
      "label": "Dominant Fold Attitude",
      "required": "true",
      "hint": ""
    },
    {
      "name": "tightness",
      "type": "select_one ao3ks66",
      "label": "Tightness / Interlimb Angle",
      "required": "true",
      "hint": ""
    },
    {
      "name": "vergence",
      "type": "select_one iu9ug45",
      "label": "Vergence",
      "required": "true",
      "hint": "Approximate vergence dold asymmetry or other...irection from f"
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "hint": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "hint": ""
    }
  ]
};