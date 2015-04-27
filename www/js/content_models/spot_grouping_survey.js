angular.module('app')
  .addSpotGroupingSurvey = function ($scope) {

  $scope.spot_grouping_survey = [
    {
      "name": "group_name",
      "type": "text",
      "label": "Group Label",
      "required": "true",
      "hint": "",
      "relevant": "",
      "default": ""
    },
    {
      "name": "group_relationship",
      "type": "select_multiple xn4xv87",
      "label": "What do elements of this group have in common?",
      "required": "true",
      "hint": "How are these data similar?",
      "relevant": "",
      "default": ""
    },
    {
      "name": "larger_structure_is_a",
      "type": "select_one lr0jp76",
      "label": "Larger Structure is a",
      "required": "true",
      "hint": "(e.g., fold, fault, shear zone, intrusive body, etc.)",
      "relevant": "",
      "default": ""
    },
    {
      "name": "age_details",
      "type": "text",
      "label": "Age Details",
      "required": "true",
      "hint": "Do you know the age?",
      "relevant": "selected(${group_relationship}, 'age')",
      "default": "not specified"
    },
    {
      "name": "new_similarity_for_grouping",
      "type": "text",
      "label": "Define New Similarity for Grouping",
      "required": "true",
      "hint": "How are these data similar that they belong in a group together?",
      "relevant": "selected(${group_relationship}, 'new')",
      "default": "not specified"
    },
    {
      "name": "group_notes",
      "type": "note",
      "label": "Notes / Comments About the Group",
      "required": "false",
      "hint": "",
      "relevant": "",
      "default": ""
    },
    {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "hint": "",
      "relevant": "",
      "default": ""
    },
    {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "hint": "",
      "relevant": "",
      "default": ""
    }
  ]
};