angular.module('app')
  .addContactsAndTracesSurvey = function ($scope) {

  $scope.contacts_and_traces_survey = [
    {
      "name":"contact_type",
      "type":"select_one lx9ax28",
      "label":"Contact Type",
      "required":"true",
      "appearance":"horizontal",
      "relevant":"",
      "hint":"",
      "default":""
    },
    {
      "name":"Other_Contact_Type",
      "type":"text",
      "label":"Other Contact Type",
      "required":"true",
      "appearance":"",
      "relevant":"${contact_type} = 'other'",
      "hint":"",
      "default":""
    },
    {
      "name":"depositional_contact_type",
      "type":"select_one bi4sw60",
      "label":"Depositional Contact Type",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'depositional'",
      "hint":"",
      "default":""
    },
    {
      "name":"Other_Depositional_Type",
      "type":"text",
      "label":"Other Depositional Type",
      "required":"true",
      "appearance":"",
      "relevant":"${depositional_contact_type} = 'other'",
      "hint":"",
      "default":""
    },
    {
      "name":"unconformity_type",
      "type":"select_one dq27t21",
      "label":"Unconformity Type",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${depositional_contact_type} = 'unconformity'",
      "hint":"",
      "default":""
    },
    {
      "name":"intruding_feature",
      "type":"select_one cj4zw02",
      "label":"Intruding Feature",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'intrusive'",
      "hint":"What type of feature is intruding?",
      "default":""
    },
    {
      "name":"metamorphic_contact_type",
      "type":"select_one pb5wo52",
      "label":"Metamorphic Contact Type",
      "required":"false",
      "appearance":"horizontal-compact",
      "relevant":"${contact_type} = 'metamorphic'",
      "hint":"",
      "default":""
    },
    {
      "name":"metamorphic_contact_other_det",
      "type":"note",
      "label":"Other Metamorphic Contact",
      "required":"true",
      "appearance":"",
      "relevant":"${metamorphic_contact_type} = 'other'",
      "hint":"",
      "default":""
    },
    {
      "name":"marker_layer_details",
      "type":"note",
      "label":"Marker Layer Details",
      "required":"false",
      "appearance":"",
      "relevant":"${contact_type} = 'marker_layer'",
      "hint":"Notes about the marker layer",
      "default":"No details specified."
    },
    {
      "name":"fault_geometry",
      "type":"select_one ku2gk10",
      "label":"Type of Fault or Shear Zone",
      "required":"false",
      "appearance":"horizontal-compact",
      "relevant":"${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"strike_slip_movement",
      "type":"select_one ww1yf84",
      "label":"Strike-Slip Movement",
      "required":"false",
      "appearance":"horizontal-compact",
      "relevant":"${fault_geometry} = 'strike_slip'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"dip_slip_movement",
      "type":"select_one dr9xt23",
      "label":"Dip-Slip Movement",
      "required":"false",
      "appearance":"horizontal-compact",
      "relevant":"${fault_geometry} = 'dip_slip'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"oblique_movement",
      "type":"select_one os1df47",
      "label":"Oblique Movement",
      "required":"false",
      "appearance":"horizontal-compact",
      "relevant":"${fault_geometry} = 'oblique'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"movement_justification",
      "type":"select_one kt81l04",
      "label":"Movement Justification",
      "required":"false",
      "appearance":"horizontal-compact",
      "relevant":"${fault_geometry} = 'strike_slip' or ${fault_geometry} = 'dip_slip' or ${fault_geometry} = 'oblique'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"Fault_Offset_Markers",
      "type":"select_multiple gs8tm04",
      "label":"Fault Offset Markers",
      "required":"true",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'fault' and ${movement_justification} = 'offset'",
      "hint":"",
      "default":""
    },
    {
      "name":"offset_markers_001",
      "type":"select_multiple uh1mv47",
      "label":"Shear Zone Offset Markers",
      "required":"true",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'shear_zone' and ${movement_justification} = 'offset'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"marker_detail",
      "type":"text",
      "label":"Other Offset Marker and Detail",
      "required":"false",
      "appearance":"multiline",
      "relevant":"${movement_justification} = 'offset'",
      "hint":"Describe marker or piercing point details",
      "default":""
    },
    {
      "name":"Offset_m",
      "type":"decimal",
      "label":"Offset (m)",
      "required":"false",
      "appearance":"",
      "relevant":"${movement_justification} = 'offset'",
      "hint":"",
      "default":""
    },
    {
      "name":"directional_indicators",
      "type":"select_multiple xd2fb20",
      "label":"Fault Slip Directional Indicators",
      "required":"true",
      "appearance":"horizontal",
      "relevant":"${movement_justification} = 'directional_indicator' and ${contact_type} = 'fault'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"Shear_Zone_Directional_indicat",
      "type":"select_multiple go8zy48",
      "label":"Shear Zone Directional indicators",
      "required":"true",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'shear_zone' and ${movement_justification} = 'directional_indicator'",
      "hint":"",
      "default":""
    },
    {
      "name":"Other_Directional_Indicator",
      "type":"text",
      "label":"Other Directional Indicator",
      "required":"true",
      "appearance":"",
      "relevant":"selected(${directional_indicators}, 'other') or selected(${Shear_Zone_Directional_indicat}, 'other')",
      "hint":"",
      "default":""
    },
    {
      "name":"Thickness_of_Fault_or_Shear_Zo",
      "type":"decimal",
      "label":"Thickness of Fault or Shear Zone (m)",
      "required":"false",
      "appearance":"",
      "relevant":"${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint":"",
      "default":""
    },
    {
      "name":"Minimum_Age_of_Deformation_Ma",
      "type":"decimal",
      "label":"Minimum Age of Deformation (Ma)",
      "required":"false",
      "appearance":"",
      "relevant":"${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint":"",
      "default":""
    },
    {
      "name":"Maximum_Age_of_Deformation_Ma",
      "type":"decimal",
      "label":"Maximum Age of Deformation (Ma)",
      "required":"false",
      "appearance":"",
      "relevant":"${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint":"",
      "default":""
    },
    {
      "name":"juxtaposes_rocks",
      "type":"select_multiple fq8rt60",
      "label":"Juxtaposes __________ rocks....",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"against_rocks",
      "type":"select_multiple kw6tp41",
      "label":"... against ________ rocks.",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint":"",
      "default":"not_specified"
    },
    {
      "name":"fold_geometry",
      "type":"select_one wg6ry31",
      "label":"Dominant Fold Geometry",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'option_11'",
      "hint":"What is the shape of the fold when looking down-plunge?",
      "default":""
    },
    {
      "name":"fold_shape",
      "type":"select_one fa6tb91",
      "label":"Dominant Fold Shape",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'option_11'",
      "hint":"",
      "default":""
    },
    {
      "name":"fold_attitude",
      "type":"select_one iq4bx64",
      "label":"Dominant Fold Attitude",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'option_11'",
      "hint":"",
      "default":""
    },
    {
      "name":"tightness",
      "type":"select_one ao3ks66",
      "label":"Tightness / Interlimb Angle",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'option_11'",
      "hint":"",
      "default":""
    },
    {
      "name":"vergence",
      "type":"select_one iu9ug45",
      "label":"Vergence",
      "required":"false",
      "appearance":"horizontal-compact",
      "relevant":"${contact_type} = 'option_11'",
      "hint":"Approximate direction of vergence from fold asymmetry",
      "default":"None"
    },
    {
      "name":"Contact_Quality",
      "type":"select_one wb5nf41",
      "label":"Contact Quality",
      "required":"true",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'depositional' or ${contact_type} = 'intrusive' or ${contact_type} = 'metamorphic' or ${contact_type} = 'fault' or ${contact_type} = 'shear_zone' or ${contact_type} = 'option_11' or ${contact_type} = 'unknown' or ${contact_type} = 'marker_layer'",
      "hint":"",
      "default":""
    },
    {
      "name":"Contact_Character",
      "type":"select_one rd1pp06",
      "label":"Contact Character",
      "required":"false",
      "appearance":"horizontal",
      "relevant":"${contact_type} = 'depositional' or ${contact_type} = 'intrusive' or ${contact_type} = 'metamorphic' or ${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint":"",
      "default":""
    },
    {
      "name":"start",
      "type":"start",
      "label":"",
      "required":"",
      "appearance":"",
      "relevant":"",
      "hint":"",
      "default":""
    },
    {
      "name":"end",
      "type":"end",
      "label":"",
      "required":"",
      "appearance":"",
      "relevant":"",
      "hint":"",
      "default":""
    }
  ]
};