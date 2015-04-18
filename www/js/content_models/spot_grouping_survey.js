angular.module('app')
  .addSpotGroupingSurvey = function ($scope) {

  $scope.spot_grouping_survey = [
    {
      "name": "group_name",
      "type": "text",
      "label": "Group Label:",
      "required": "true",
      "hint": "",
      "default": "",
      "relevant": ""
    },
    {
      "name": "group_relationship",
      "type": "select_multiple xn4xv87",
      "label": "What do elements of this group have in common?",
      "required": "true",
      "hint": "How are these data similar?",
      "default": "not specified",
      "relevant": ""
    },
    {
      "name": "larger_structure_is_a",
      "type": "select_one lr0jp76",
      "label": "Larger structure is a:",
      "required": "true",
      "hint": "(e.g., fold, fault, shear zone, intrusive body, etc.)",
      "default": "not specified",
      "relevant": ""
    },
    {
      "name": "link_this_specific_feature",
      "type": "select_one so9zn66",
      "label": "Link this group to a specific feature?",
      "required": "false",
      "hint": "Is there an existing spot for the larger feature?",
      "default": "not specified",
      "relevant": "selected(${group_relationship}, 'larger_structu')"
    },
    {
      "name": "age_details",
      "type": "text",
      "label": "Age details:",
      "required": "true",
      "hint": "Do you know the age?",
      "default": "not specified",
      "relevant": "selected(${group_relationship}, 'age')"
    },
    {
      "name": "new_similarity_for_grouping",
      "type": "text",
      "label": "Define new similarity for grouping:",
      "required": "true",
      "hint": "How are these data similar that they belong in a group together?",
      "default": "not specified",
      "relevant": "selected(${group_relationship}, 'new')"
    },
    {
      "name": "notes_comments_about_the_gro",
      "type": "note",
      "label": "Notes / Comments about the group:",
      "required": "false",
      "hint": "",
      "default": "",
      "relevant": ""
    },
    {"name": "start", "type": "start", "label": "", "required": "", "hint": "", "default": "", "relevant": ""},
    {"name": "end", "type": "end", "label": "", "required": "", "hint": "", "default": "", "relevant": ""}
  ]
};