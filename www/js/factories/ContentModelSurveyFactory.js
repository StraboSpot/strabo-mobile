'use strict';

angular.module('app')
  .factory('ContentModelSurveyFactory', function() {

    var factory = {};

    factory.contacts_and_traces_survey = [
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
        "relevant":"${movement_justification} = 'direct_indicat' and ${contact_type} = 'fault'",
        "hint":"",
        "default":"not_specified"
      },
      {
        "name":"Shear_Zone_Directional_indicat",
        "type":"select_multiple go8zy48",
        "label":"Shear Zone Directional indicators",
        "required":"true",
        "appearance":"horizontal",
        "relevant":"${contact_type} = 'shear_zone' and ${movement_justification} = 'direct_indicat'",
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
        "label":"Juxtaposes __________ rocks in the hanging wall....",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
        "hint":"",
        "default":"not_specified"
      },
      {
        "name":"against_rocks",
        "type":"select_multiple kw6tp41",
        "label":"... against ________ rocks in the footwall.",
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
        "relevant":"${contact_type} = 'fold_trace'",
        "hint":"What is the shape of the fold when looking down-plunge?",
        "default":""
      },
      {
        "name":"fold_shape",
        "type":"select_one fa6tb91",
        "label":"Dominant Fold Shape",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${contact_type} = 'fold_trace'",
        "hint":"",
        "default":""
      },
      {
        "name":"fold_attitude",
        "type":"select_one iq4bx64",
        "label":"Dominant Fold Attitude",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${contact_type} = 'fold_trace'",
        "hint":"",
        "default":""
      },
      {
        "name":"tightness",
        "type":"select_one ao3ks66",
        "label":"Tightness / Interlimb Angle",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${contact_type} = 'fold_trace'",
        "hint":"",
        "default":""
      },
      {
        "name":"vergence",
        "type":"select_one iu9ug45",
        "label":"Vergence",
        "required":"false",
        "appearance":"horizontal-compact",
        "relevant":"${contact_type} = 'fold_trace'",
        "hint":"Approximate direction of vergence from fold asymmetry",
        "default":"None"
      },
      {
        "name":"Contact_Quality",
        "type":"select_one wb5nf41",
        "label":"Contact Quality",
        "required":"true",
        "appearance":"horizontal",
        "relevant":"${contact_type} = 'depositional' or ${contact_type} = 'intrusive' or ${contact_type} = 'metamorphic' or ${contact_type} = 'fault' or ${contact_type} = 'shear_zone' or ${contact_type} = 'fold_trace' or ${contact_type} = 'unknown' or ${contact_type} = 'marker_layer'",
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
    ];

    factory.contacts_and_traces_choices = [
      {
        "label":"depositional",
        "name":"depositional",
        "order":0,
        "list name":"lx9ax28"
      },
      {
        "label":"intrusive",
        "name":"intrusive",
        "order":1,
        "list name":"lx9ax28"
      },
      {
        "label":"metamorphic",
        "name":"metamorphic",
        "order":2,
        "list name":"lx9ax28"
      },
      {
        "label":"fault",
        "name":"fault",
        "order":3,
        "list name":"lx9ax28"
      },
      {
        "label":"shear zone",
        "name":"shear_zone",
        "order":4,
        "list name":"lx9ax28"
      },
      {
        "label":"fold trace",
        "name":"fold_trace",
        "order":5,
        "list name":"lx9ax28"
      },
      {
        "label":"marker layer",
        "name":"marker_layer",
        "order":6,
        "list name":"lx9ax28"
      },
      {
        "label":"edge of mapping",
        "name":"map_edge",
        "order":7,
        "list name":"lx9ax28"
      },
      {
        "label":"temporary",
        "name":"temporary",
        "order":8,
        "list name":"lx9ax28"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":9,
        "list name":"lx9ax28"
      },
      {
        "label":"other",
        "name":"other",
        "order":10,
        "list name":"lx9ax28"
      },
      {
        "label":"stratigraphic",
        "name":"stratigraphic",
        "order":0,
        "list name":"bi4sw60"
      },
      {
        "label":"alluvial",
        "name":"alluvial",
        "order":1,
        "list name":"bi4sw60"
      },
      {
        "label":"unconformity",
        "name":"unconformity",
        "order":2,
        "list name":"bi4sw60"
      },
      {
        "label":"volcanic",
        "name":"volcanic",
        "order":3,
        "list name":"bi4sw60"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":4,
        "list name":"bi4sw60"
      },
      {
        "label":"other",
        "name":"other",
        "order":null,
        "list name":"bi4sw60"
      },
      {
        "label":"angular unconformity",
        "name":"angular_unconf",
        "order":null,
        "list name":"dq27t21"
      },
      {
        "label":"nonconformity",
        "name":"nonconformity",
        "order":null,
        "list name":"dq27t21"
      },
      {
        "label":"disconformity",
        "name":"disconformity",
        "order":null,
        "list name":"dq27t21"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":null,
        "list name":"dq27t21"
      },
      {
        "label":"dike (cuts fabric)",
        "name":"dike",
        "order":0,
        "list name":"cj4zw02"
      },
      {
        "label":"sill (conforms to fabric)",
        "name":"sill",
        "order":1,
        "list name":"cj4zw02"
      },
      {
        "label":"pluton",
        "name":"pluton",
        "order":2,
        "list name":"cj4zw02"
      },
      {
        "label":"migmatite",
        "name":"migmatite",
        "order":3,
        "list name":"cj4zw02"
      },
      {
        "label":"injectite",
        "name":"injectite",
        "order":4,
        "list name":"cj4zw02"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":5,
        "list name":"cj4zw02"
      },
      {
        "label":"between different metamorphic rocks",
        "name":"btwn_2_dif_mm",
        "order":0,
        "list name":"pb5wo52"
      },
      {
        "label":"isograd",
        "name":"isograd",
        "order":2,
        "list name":"pb5wo52"
      },
      {
        "label":"other",
        "name":"other",
        "order":null,
        "list name":"pb5wo52"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":0,
        "list name":"ku2gk10"
      },
      {
        "label":"strike-slip",
        "name":"strike_slip",
        "order":1,
        "list name":"ku2gk10"
      },
      {
        "label":"dip-slip",
        "name":"dip_slip",
        "order":2,
        "list name":"ku2gk10"
      },
      {
        "label":"oblique-slip",
        "name":"oblique",
        "order":3,
        "list name":"ku2gk10"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":0,
        "list name":"ww1yf84"
      },
      {
        "label":"dextral",
        "name":"dextral",
        "order":1,
        "list name":"ww1yf84"
      },
      {
        "label":"sinistral",
        "name":"sinistral",
        "order":2,
        "list name":"ww1yf84"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":0,
        "list name":"dr9xt23"
      },
      {
        "label":"normal",
        "name":"normal",
        "order":1,
        "list name":"dr9xt23"
      },
      {
        "label":"reverse",
        "name":"reverse",
        "order":2,
        "list name":"dr9xt23"
      },
      {
        "label":"thrust",
        "name":"thrust",
        "order":3,
        "list name":"dr9xt23"
      },
      {
        "label":"low-angle normal",
        "name":"low_angle_norm",
        "order":null,
        "list name":"dr9xt23"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":0,
        "list name":"os1df47"
      },
      {
        "label":"dextral reverse",
        "name":"dextral_reverse",
        "order":1,
        "list name":"os1df47"
      },
      {
        "label":"dextral normal",
        "name":"dextral_normal",
        "order":2,
        "list name":"os1df47"
      },
      {
        "label":"sinistral reverse",
        "name":"sinistral_reverse",
        "order":3,
        "list name":"os1df47"
      },
      {
        "label":"sinistral normal",
        "name":"sinistral_normal",
        "order":4,
        "list name":"os1df47"
      },
      {
        "label":"dextral",
        "name":"dextral",
        "order":null,
        "list name":"os1df47"
      },
      {
        "label":"sinistral",
        "name":"sinistral",
        "order":null,
        "list name":"os1df47"
      },
      {
        "label":"reverse",
        "name":"reverse",
        "order":null,
        "list name":"os1df47"
      },
      {
        "label":"normal",
        "name":"normal",
        "order":null,
        "list name":"os1df47"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":0,
        "list name":"kt81l04"
      },
      {
        "label":"offset marker",
        "name":"offset",
        "order":1,
        "list name":"kt81l04"
      },
      {
        "label":"directional indicators",
        "name":"direct_indicat",
        "order":2,
        "list name":"kt81l04"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":null,
        "list name":"gs8tm04"
      },
      {
        "label":"bedding",
        "name":"bedding",
        "order":null,
        "list name":"gs8tm04"
      },
      {
        "label":"intrusion",
        "name":"intrusion",
        "order":null,
        "list name":"gs8tm04"
      },
      {
        "label":"metamorphic foliation",
        "name":"foliation",
        "order":null,
        "list name":"gs8tm04"
      },
      {
        "label":"compositional banding",
        "name":"comp_banding",
        "order":null,
        "list name":"gs8tm04"
      },
      {
        "label":"geomorphic feature",
        "name":"geomorph_feat",
        "order":null,
        "list name":"gs8tm04"
      },
      {
        "label":"other",
        "name":"other",
        "order":null,
        "list name":"gs8tm04"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":0,
        "list name":"uh1mv47"
      },
      {
        "label":"bedding",
        "name":"bedding",
        "order":1,
        "list name":"uh1mv47"
      },
      {
        "label":"intrusion",
        "name":"intrusion",
        "order":2,
        "list name":"uh1mv47"
      },
      {
        "label":"metamorphic foliation",
        "name":"foliation",
        "order":3,
        "list name":"uh1mv47"
      },
      {
        "label":"compositional banding",
        "name":"comp_banding",
        "order":4,
        "list name":"uh1mv47"
      },
      {
        "label":"other",
        "name":"other",
        "order":6,
        "list name":"uh1mv47"
      },
      {
        "label":"Riedel shears",
        "name":"riedel_shears",
        "order":0,
        "list name":"xd2fb20"
      },
      {
        "label":"gouge fill",
        "name":"gouge_fill",
        "order":1,
        "list name":"xd2fb20"
      },
      {
        "label":"crescentic fractures",
        "name":"cresc_fracture",
        "order":2,
        "list name":"xd2fb20"
      },
      {
        "label":"slickenfibers",
        "name":"slickenfibers",
        "order":3,
        "list name":"xd2fb20"
      },
      {
        "label":"tension gashes",
        "name":"tension_gashes",
        "order":4,
        "list name":"xd2fb20"
      },
      {
        "label":"oblique foliation",
        "name":"oblique_fol",
        "order":5,
        "list name":"xd2fb20"
      },
      {
        "label":"drag folds",
        "name":"drag_folds",
        "order":6,
        "list name":"xd2fb20"
      },
      {
        "label":"asymmetric folds",
        "name":"asymm_folds",
        "order":7,
        "list name":"xd2fb20"
      },
      {
        "label":"rotated clasts",
        "name":"rotated_clasts",
        "order":8,
        "list name":"xd2fb20"
      },
      {
        "label":"domino clasts",
        "name":"domino_clasts",
        "order":9,
        "list name":"xd2fb20"
      },
      {
        "label":"other",
        "name":"other",
        "order":10,
        "list name":"xd2fb20"
      },
      {
        "label":"oblique foliation",
        "name":"oblique_fol",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"drag",
        "name":"drag",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"asymmetric folds",
        "name":"asymm_fol",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"domino texture",
        "name":"domino_texture",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"rotated clasts",
        "name":"rotated_clasts",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"rotated porphyroblasts",
        "name":"rotated_porph",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"delta clasts",
        "name":"delta_clasts",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"S-C fabric",
        "name":"s_c_fabric",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"S-C' fabric",
        "name":"s_c__fabric",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"C-C' fabric",
        "name":"c_c__fabric",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"mica fish",
        "name":"mica_fish",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"boudinage",
        "name":"boudinage",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"other",
        "name":"other",
        "order":null,
        "list name":"go8zy48"
      },
      {
        "label":"This is a list of rock units / descriptions user has made",
        "name":"rock_unit_list",
        "order":null,
        "list name":"fq8rt60"
      },
      {
        "label":"More in the list of rock units / descriptions user has made",
        "name":"more_unit_list",
        "order":null,
        "list name":"fq8rt60"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":null,
        "list name":"fq8rt60"
      },
      {
        "label":"This is a list of rock units / descriptions user has made",
        "name":"rock_unit_list",
        "order":null,
        "list name":"kw6tp41"
      },
      {
        "label":"More in the list of rock units / descriptions user has made",
        "name":"more_unit_list",
        "order":null,
        "list name":"kw6tp41"
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "order":null,
        "list name":"kw6tp41"
      },
      {
        "label":"syncline",
        "name":"syncline",
        "order":0,
        "list name":"wg6ry31"
      },
      {
        "label":"anticline",
        "name":"anticline",
        "order":1,
        "list name":"wg6ry31"
      },
      {
        "label":"monocline",
        "name":"monocline",
        "order":2,
        "list name":"wg6ry31"
      },
      {
        "label":"synform",
        "name":"synform",
        "order":3,
        "list name":"wg6ry31"
      },
      {
        "label":"antiform",
        "name":"antiform",
        "order":4,
        "list name":"wg6ry31"
      },
      {
        "label":"s-fold",
        "name":"s_fold",
        "order":5,
        "list name":"wg6ry31"
      },
      {
        "label":"z-fold",
        "name":"z_fold",
        "order":6,
        "list name":"wg6ry31"
      },
      {
        "label":"m-fold",
        "name":"m_fold",
        "order":7,
        "list name":"wg6ry31"
      },
      {
        "label":"sheath",
        "name":"sheath",
        "order":8,
        "list name":"wg6ry31"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":9,
        "list name":"wg6ry31"
      },
      {
        "label":"chevron",
        "name":"chevron",
        "order":0,
        "list name":"fa6tb91"
      },
      {
        "label":"cuspate",
        "name":"cuspate",
        "order":1,
        "list name":"fa6tb91"
      },
      {
        "label":"circular",
        "name":"circular",
        "order":2,
        "list name":"fa6tb91"
      },
      {
        "label":"elliptical",
        "name":"elliptical",
        "order":3,
        "list name":"fa6tb91"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":null,
        "list name":"fa6tb91"
      },
      {
        "label":"upright",
        "name":"upright",
        "order":0,
        "list name":"iq4bx64"
      },
      {
        "label":"overturned",
        "name":"overturned",
        "order":1,
        "list name":"iq4bx64"
      },
      {
        "label":"vertical",
        "name":"vertical",
        "order":2,
        "list name":"iq4bx64"
      },
      {
        "label":"horizontal",
        "name":"horizontal",
        "order":3,
        "list name":"iq4bx64"
      },
      {
        "label":"recumbent",
        "name":"recumbent",
        "order":4,
        "list name":"iq4bx64"
      },
      {
        "label":"inclined",
        "name":"inclined",
        "order":5,
        "list name":"iq4bx64"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":null,
        "list name":"iq4bx64"
      },
      {
        "label":"gentle   (180\xB0–120\xB0)",
        "name":"gentle",
        "order":null,
        "list name":"ao3ks66"
      },
      {
        "label":"open   (120\xB0–70\xB0)",
        "name":"open",
        "order":null,
        "list name":"ao3ks66"
      },
      {
        "label":"close   (70\xB0–30\xB0)",
        "name":"close",
        "order":null,
        "list name":"ao3ks66"
      },
      {
        "label":"tight   (30\xB0–10\xB0)",
        "name":"tight",
        "order":null,
        "list name":"ao3ks66"
      },
      {
        "label":"isoclinal   (10\xB0–0\xB0)",
        "name":"isoclinal",
        "order":null,
        "list name":"ao3ks66"
      },
      {
        "label":"None",
        "name":"none",
        "order":0,
        "list name":"iu9ug45"
      },
      {
        "label":"North",
        "name":"north",
        "order":1,
        "list name":"iu9ug45"
      },
      {
        "label":"NE",
        "name":"ne",
        "order":2,
        "list name":"iu9ug45"
      },
      {
        "label":"East",
        "name":"east",
        "order":3,
        "list name":"iu9ug45"
      },
      {
        "label":"SE",
        "name":"se",
        "order":4,
        "list name":"iu9ug45"
      },
      {
        "label":"South",
        "name":"south",
        "order":5,
        "list name":"iu9ug45"
      },
      {
        "label":"SW",
        "name":"sw",
        "order":6,
        "list name":"iu9ug45"
      },
      {
        "label":"West",
        "name":"west",
        "order":7,
        "list name":"iu9ug45"
      },
      {
        "label":"NW",
        "name":"nw",
        "order":8,
        "list name":"iu9ug45"
      },
      {
        "label":"known",
        "name":"known",
        "order":null,
        "list name":"wb5nf41"
      },
      {
        "label":"approximate",
        "name":"approximate",
        "order":null,
        "list name":"wb5nf41"
      },
      {
        "label":"inferred",
        "name":"inferred",
        "order":null,
        "list name":"wb5nf41"
      },
      {
        "label":"questionable approximate",
        "name":"approximate(?)",
        "order":null,
        "list name":"wb5nf41"
      },
      {
        "label":"questionable inferred",
        "name":"inferred(?)",
        "order":null,
        "list name":"wb5nf41"
      },
      {
        "label":"concealed",
        "name":"concealed",
        "order":null,
        "list name":"wb5nf41"
      },
      {
        "label":"sharp",
        "name":"sharp",
        "order":null,
        "list name":"rd1pp06"
      },
      {
        "label":"gradational",
        "name":"gradational",
        "order":null,
        "list name":"rd1pp06"
      },
      {
        "label":"chilled",
        "name":"chilled",
        "order":null,
        "list name":"rd1pp06"
      },
      {
        "label":"brecciated",
        "name":"brecciated",
        "order":null,
        "list name":"rd1pp06"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":null,
        "list name":"rd1pp06"
      }
    ];

    factory.measurements_and_observations_survey = [
      {
        "name":"measured_plane",
        "type":"acknowledge",
        "label":"MEASURED PLANE?",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"strike",
        "type":"integer",
        "label":"Strike",
        "required":"true",
        "hint":"Azimuth in degrees",
        "relevant":"${measured_plane} != ''",
        "constraint":". >= 0 and . <= 360",
        "constraint_message":"Strike must be between 0-360.",
        "default":"",
        "appearance":""
      },
      {
        "name":"dip",
        "type":"integer",
        "label":"Dip",
        "required":"true",
        "hint":"",
        "relevant":"${measured_plane} != ''",
        "constraint":". >= 0 and . <= 90",
        "constraint_message":"Dip must be between 0-90.",
        "default":"",
        "appearance":""
      },
      {
        "name":"planar_surface_quality",
        "type":"select_one gl2mf38",
        "label":"Planar Surface Quality",
        "required":"false",
        "hint":"Quality of the exposed plane? Irregular means the feature is curviplanar.",
        "relevant":"${strike} > 0",
        "constraint":"",
        "constraint_message":"",
        "default":"accurate",
        "appearance":"horizontal-compact"
      },
      {
        "name":"planar_measurement_quality",
        "type":"select_one xn9nf56",
        "label":"Planar Measurement Quality",
        "required":"false",
        "hint":"How well was this plane measured?",
        "relevant":"${strike} > 0",
        "constraint":"",
        "constraint_message":"",
        "default":"3",
        "appearance":"likert"
      },
      {
        "name":"planar_feature_type",
        "type":"select_one ll25x57",
        "label":"Planar Feature Type",
        "required":"true",
        "hint":"",
        "relevant":"${strike} > 0",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"contact_type",
        "type":"select_one lx9ax28",
        "label":"Contact Type",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'contact'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"other_contact_type",
        "type":"text",
        "label":"Other Contact Type",
        "required":"false",
        "hint":"",
        "relevant":"${contact_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"depositional_contact_type",
        "type":"select_one bi4sw60",
        "label":"Depositional Contact Type",
        "required":"false",
        "hint":"",
        "relevant":"${contact_type} = 'depositional'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"other_depositional_type",
        "type":"text",
        "label":"Other Depositional Type",
        "required":"false",
        "hint":"",
        "relevant":"${depositional_contact_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"unconformity_type",
        "type":"select_one dq27t21",
        "label":"Unconformity Type",
        "required":"false",
        "hint":"",
        "relevant":"${depositional_contact_type} = 'unconformity'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"intruding_feature",
        "type":"select_one cj4zw02",
        "label":"Intruding Feature",
        "required":"false",
        "hint":"What type of feature is intruding?",
        "relevant":"${contact_type} = 'intrusive'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"metamorphic_contact_type",
        "type":"select_one pb5wo52",
        "label":"Metamorphic Contact Type",
        "required":"false",
        "hint":"",
        "relevant":"${contact_type} = 'metamorphic'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"ohter_metamorphic_contact",
        "type":"note",
        "label":"Other Metamorphic Contact",
        "required":"false",
        "hint":"",
        "relevant":"${metamorphic_contact_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"marker_layer_details",
        "type":"note",
        "label":"Marker Layer Details",
        "required":"false",
        "hint":"Notes about the marker layer",
        "relevant":"${contact_type} = 'marker_layer'",
        "constraint":"",
        "constraint_message":"",
        "default":"No details specified.",
        "appearance":""
      },
      {
        "name":"foliation_type",
        "type":"select_one vn7df87",
        "label":"Foliation Type",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'foliation'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal"
      },
      {
        "name":"other_foliation_type",
        "type":"text",
        "label":"Other Foliation Type",
        "required":"false",
        "hint":"",
        "relevant":"${foliation_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"solid_state_foliation_type",
        "type":"select_one lz7no78",
        "label":"Solid-state Foliation Type",
        "required":"false",
        "hint":"",
        "relevant":"${foliation_type} = 'solid_state'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal"
      },
      {
        "name":"other_solid_state_foliation_an",
        "type":"text",
        "label":"Other Solid-State Foliation and Description",
        "required":"false",
        "hint":"",
        "relevant":"${solid_state_foliation_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"tectonite_label",
        "type":"select_one su3eo23",
        "label":"Tectonite Label",
        "required":"false",
        "hint":"",
        "relevant":"${solid_state_foliation_type} = 'cataclastic' or ${solid_state_foliation_type} = 'mylonitic' or ${solid_state_foliation_type} = 'schistosity' or ${solid_state_foliation_type} = 'gneissic_banding' or ${solid_state_foliation_type} = 'strain_marker'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal-compact"
      },
      {
        "name":"gneissic_band_spacing_cm",
        "type":"decimal",
        "label":"Gneissic Band Spacing (cm)",
        "required":"false",
        "hint":"",
        "relevant":"${solid_state_foliation_type} = 'gneissic_banding'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"average_grain_size_mm_in_gne",
        "type":"integer",
        "label":"Average Grain Size (mm) in Gneissic Bands",
        "required":"false",
        "hint":"",
        "relevant":"${solid_state_foliation_type} = 'gneissic_banding'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"cleavage_type",
        "type":"select_one dr5ab45",
        "label":"Cleavage Type",
        "required":"false",
        "hint":"",
        "relevant":"${foliation_type} = 'cleavage'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal"
      },
      {
        "name":"other_cleavage",
        "type":"text",
        "label":"Other Cleavage",
        "required":"false",
        "hint":"",
        "relevant":"${cleavage_type} = 'other_new'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"vein_mineral_fill",
        "type":"select_one pa42s24",
        "label":"Vein Mineral Fill",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'vein'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"likert"
      },
      {
        "name":"other_vein_mineral",
        "type":"text",
        "label":"Other Vein Mineral",
        "required":"true",
        "hint":"",
        "relevant":"${vein_mineral_fill} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"shear_fracture_type",
        "type":"select_one ra0iq26",
        "label":"Shear Fracture Type",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'shear_fracture'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"type_of_fault_or_shear_zone",
        "type":"select_one ku2gk10",
        "label":"Type of Fault or Shear Zone",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'fault_plane' or ${planar_feature_type} = 'shear_zone' or ${planar_feature_type} = 'shear_fracture'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal-compact"
      },
      {
        "name":"strike_slip_movement",
        "type":"select_one ww1yf84",
        "label":"Strike-Slip Movement",
        "required":"true",
        "hint":"",
        "relevant":"${type_of_fault_or_shear_zone} = 'strike_slip'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal-compact"
      },
      {
        "name":"dip_slip_movement",
        "type":"select_one dr9xt23",
        "label":"Dip-Slip Movement",
        "required":"true",
        "hint":"",
        "relevant":"${type_of_fault_or_shear_zone} = 'dip_slip'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal-compact"
      },
      {
        "name":"oblique_movement",
        "type":"select_one os1df47",
        "label":"Oblique Movement",
        "required":"true",
        "hint":"",
        "relevant":"${type_of_fault_or_shear_zone} = 'oblique'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal-compact"
      },
      {
        "name":"movement_justification",
        "type":"select_one kt81l04",
        "label":"Movement Justification",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'fault_plane' or ${planar_feature_type} = 'shear_fracture' or ${planar_feature_type} = 'shear_zone'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal-compact"
      },
      {
        "name":"fault_offset_markers_0",
        "type":"select_multiple gs8tm04",
        "label":"Fault Offset Markers",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'fault_plane' and ${movement_justification} = 'offset_marker'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"fault_offset_markers_1",
        "type":"select_multiple td6dh37",
        "label":"Fault Offset Markers",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'shear_fracture' and ${movement_justification} = 'offset_marker'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"shear_zone_offset_markers",
        "type":"select_multiple uh1mv47",
        "label":"Shear Zone Offset Markers",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'shear_zone' and ${movement_justification} = 'offset_marker'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal"
      },
      {
        "name":"offset_marker_detail",
        "type":"text",
        "label":"Offset Marker Detail",
        "required":"true",
        "hint":"Describe marker or piercing point details",
        "relevant":"${movement_justification} = 'offset_marker'",
        "constraint":"",
        "constraint_message":"",
        "default":"not specified",
        "appearance":"multiline"
      },
      {
        "name":"offset_m",
        "type":"decimal",
        "label":"Offset (m)",
        "required":"false",
        "hint":"",
        "relevant":"${movement_justification} = 'offset_marker'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"fault_directional_indicators_0",
        "type":"select_multiple eg8eq24",
        "label":"Fault Directional Indicators",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'fault_plane' and ${movement_justification} = 'direct_indicat'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"fault_directional_indicators_1",
        "type":"select_multiple qr6wd52",
        "label":"Fault Directional Indicators",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'shear_fracture' and ${movement_justification} = 'direct_indicat'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"two_shear_zone_directional_ind",
        "type":"select_multiple xd2fb20",
        "label":"Two Shear Zone Directional Indicators",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'shear_zone' and ${movement_justification} = 'direct_indicat'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal"
      },
      {
        "name":"other_directional_indicator",
        "type":"text",
        "label":"Other Directional Indicator",
        "required":"false",
        "hint":"",
        "relevant":"selected(${fault_directional_indicators_0}, 'other') or selected(${fault_directional_indicators_1}, 'other') or selected(${two_shear_zone_directional_ind}, 'other')",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"juxtaposes_rocks",
        "type":"select_multiple fq8rt60",
        "label":"Juxtaposes __________ rocks in the hanging wall....",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'fault_plane' or ${planar_feature_type} = 'shear_zone'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal"
      },
      {
        "name":"against_rocks",
        "type":"select_multiple kw6tp41",
        "label":"... against ________ rocks in the footwall.",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'fault_plane' or ${planar_feature_type} = 'shear_zone'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal"
      },
      {
        "name":"thickness_of_fault_or_shear_zo",
        "type":"decimal",
        "label":"Thickness of Fault or Shear Zone (m)",
        "required":"false",
        "hint":"in meters",
        "relevant":"${planar_feature_type} = 'fault_plane' or ${planar_feature_type} = 'shear_fracture' or ${planar_feature_type} = 'shear_zone'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"minimum_age_of_deformation_ma",
        "type":"decimal",
        "label":"Minimum Age of Deformation (Ma)",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'fault_plane' or ${planar_feature_type} = 'shear_fracture' or ${planar_feature_type} = 'shear_zone'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"maximum_age_of_deformation_ma",
        "type":"decimal",
        "label":"Maximum Age of Deformation (Ma)",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'fault_plane' or ${planar_feature_type} = 'shear_fracture' or ${planar_feature_type} = 'shear_zone'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"specific_foliation_element",
        "type":"select_one of53v22",
        "label":"Specific Foliation Element being Measured",
        "required":"false",
        "hint":"",
        "relevant":"${foliation_type} = 'solid_state'",
        "constraint":"",
        "constraint_message":"",
        "default":"not_specified",
        "appearance":"horizontal-compact"
      },
      {
        "name":"other_planar_feature",
        "type":"text",
        "label":"Other Planar Feature",
        "required":"true",
        "hint":"",
        "relevant":"${planar_feature_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"plane_facing",
        "type":"select_one to1en66",
        "label":"Plane Facing",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'bedding' or ${planar_feature_type} = 'contact'",
        "constraint":"",
        "constraint_message":"",
        "default":"upright",
        "appearance":"horizontal-compact"
      },
      {
        "name":"facing_direction",
        "type":"text",
        "label":"Facing Direction",
        "required":"false",
        "hint":"",
        "relevant":"${strike} > -1 and ${plane_facing} = 'vertical'",
        "constraint":"",
        "constraint_message":"",
        "default":"u",
        "appearance":""
      },
      {
        "name":"measured_line",
        "type":"acknowledge",
        "label":"MEASURED LINE?",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"trend",
        "type":"integer",
        "label":"Trend",
        "required":"true",
        "hint":"Azimuth in degrees",
        "relevant":"${measured_line} != ''",
        "constraint":". >= 0 and . <= 360",
        "constraint_message":"Trend must be between 0-360.",
        "default":"",
        "appearance":""
      },
      {
        "name":"plunge",
        "type":"integer",
        "label":"Plunge",
        "required":"true",
        "hint":"",
        "relevant":"${measured_line} != ''",
        "constraint":". >= 0 and . <= 90",
        "constraint_message":"Plunge must be between 0-90.",
        "default":"",
        "appearance":""
      },
      {
        "name":"Rake",
        "type":"integer",
        "label":"Rake",
        "required":"false",
        "hint":"angle from strike on plane (0-180)?",
        "relevant":"${measured_line} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"rake_calculated",
        "type":"acknowledge",
        "label":"Rake Calculated?",
        "required":"false",
        "hint":"Was the rake calculated, instead of measured?",
        "relevant":"${measured_line} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"linear_orientation_quality",
        "type":"select_one gl2mf38",
        "label":"Linear Orientation Quality",
        "required":"true",
        "hint":"How accurate is the measurement? Irregular = curviplanar.",
        "relevant":"${measured_line} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"accurate",
        "appearance":"horizontal-compact"
      },
      {
        "name":"linear_measurement_quality",
        "type":"select_one xn9nf56",
        "label":"Linear Measurement Quality",
        "required":"true",
        "hint":"",
        "relevant":"${measured_line} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"3",
        "appearance":"likert"
      },
      {
        "name":"linear_feature_type",
        "type":"select_one lg1ol67",
        "label":"Linear Feature Type",
        "required":"true",
        "hint":"",
        "relevant":"${measured_line} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"other_linear_feature",
        "type":"text",
        "label":"Other Linear Feature",
        "required":"true",
        "hint":"",
        "relevant":"${linear_feature_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"fault_lineations",
        "type":"select_one ww1bs55",
        "label":"Fault Lineations",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'fault'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"other_fault_lineation",
        "type":"text",
        "label":"Other Fault Lineation",
        "required":"true",
        "hint":"",
        "relevant":"${fault_lineations} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"solid_state_lineations",
        "type":"select_one wt9mt75",
        "label":"Solid-State Lineation",
        "required":"true",
        "hint":"",
        "relevant":"${linear_feature_type} = 'solid_state'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"other_solid_state_lineation",
        "type":"text",
        "label":"Other Solid-State Lineation",
        "required":"true",
        "hint":"",
        "relevant":"${solid_state_lineations} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"Pencil_Cleavage_Intersection",
        "type":"select_one og63u88",
        "label":"Pencil Cleavage Intersection?",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'intersection'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"intersection_lineation_descrip",
        "type":"text",
        "label":"Intersection Lineation Description",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'intersection'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"approx_amplitude",
        "type":"select_one zq9sr00",
        "label":"Approximate Amplitude Scale of Related Folding",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'fold_hinge'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"dominant_fold_geometry",
        "type":"select_one wg6ry31",
        "label":"Dominant Fold Geometry",
        "required":"false",
        "hint":"What is the shape of the fold when looking down-plunge?",
        "relevant":"${linear_feature_type} = 'fold_hinge'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"dominant_fold_shape",
        "type":"select_one fa6tb91",
        "label":"Dominant Fold Shape",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'fold_hinge'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"dominant_fold_attitude",
        "type":"select_one iq4bx64",
        "label":"Dominant Fold Attitude",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'fold_hinge'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"tightness_interlimb_angle",
        "type":"select_one ao3ks66",
        "label":"Tightness / Interlimb Angle",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'fold_hinge'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"vergence",
        "type":"select_one iu9ug45",
        "label":"Vergence",
        "required":"false",
        "hint":"Approximate vergence fold asymmetry or other...irection from f",
        "relevant":"${linear_feature_type} = 'fold_hinge'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"vector_magnitude_meters",
        "type":"decimal",
        "label":"Vector Magnitude (meters)",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'vector'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"structure_notes",
        "type":"text",
        "label":"Structure Notes",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"start",
        "type":"start",
        "label":"",
        "required":"",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"end",
        "type":"end",
        "label":"",
        "required":"",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      }
    ];

    factory.measurements_and_observations_choices = [
      {
        "label":"accurate",
        "name":"accurate",
        "list name":"gl2mf38",
        "order":null
      },
      {
        "label":"approximate",
        "name":"approximate",
        "list name":"gl2mf38",
        "order":null
      },
      {
        "label":"irregular",
        "name":"irregular",
        "list name":"gl2mf38",
        "order":null
      },
      {
        "label":"1",
        "name":"1",
        "list name":"xn9nf56",
        "order":null
      },
      {
        "label":"2",
        "name":"2",
        "list name":"xn9nf56",
        "order":null
      },
      {
        "label":"3",
        "name":"3",
        "list name":"xn9nf56",
        "order":null
      },
      {
        "label":"4",
        "name":"4",
        "list name":"xn9nf56",
        "order":null
      },
      {
        "label":"5",
        "name":"5",
        "list name":"xn9nf56",
        "order":null
      },
      {
        "label":"bedding",
        "name":"bedding",
        "list name":"ll25x57",
        "order":0
      },
      {
        "label":"contact",
        "name":"contact",
        "list name":"ll25x57",
        "order":1
      },
      {
        "label":"foliation",
        "name":"foliation",
        "list name":"ll25x57",
        "order":2
      },
      {
        "label":"axial planar surface",
        "name":"axial_planar",
        "list name":"ll25x57",
        "order":3
      },
      {
        "label":"fracture",
        "name":"fracture",
        "list name":"ll25x57",
        "order":4
      },
      {
        "label":"joint",
        "name":"joint",
        "list name":"ll25x57",
        "order":5
      },
      {
        "label":"fault plane",
        "name":"fault_plane",
        "list name":"ll25x57",
        "order":6
      },
      {
        "label":"shear fracture",
        "name":"shear_fracture",
        "list name":"ll25x57",
        "order":7
      },
      {
        "label":"shear zone",
        "name":"shear_zone",
        "list name":"ll25x57",
        "order":8
      },
      {
        "label":"other",
        "name":"other",
        "list name":"ll25x57",
        "order":9
      },
      {
        "label":"vein",
        "name":"vein",
        "list name":"ll25x57",
        "order":null
      },
      {
        "label":"depositional",
        "name":"depositional",
        "list name":"lx9ax28",
        "order":0
      },
      {
        "label":"intrusive",
        "name":"intrusive",
        "list name":"lx9ax28",
        "order":1
      },
      {
        "label":"metamorphic",
        "name":"metamorphic",
        "list name":"lx9ax28",
        "order":2
      },
      {
        "label":"marker layer",
        "name":"marker_layer",
        "list name":"lx9ax28",
        "order":3
      },
      {
        "label":"unknown",
        "name":"unknown",
        "list name":"lx9ax28",
        "order":5
      },
      {
        "label":"other",
        "name":"other",
        "list name":"lx9ax28",
        "order":6
      },
      {
        "label":"stratigraphic",
        "name":"stratigraphic",
        "list name":"bi4sw60",
        "order":0
      },
      {
        "label":"alluvial",
        "name":"alluvial",
        "list name":"bi4sw60",
        "order":1
      },
      {
        "label":"unconformity",
        "name":"unconformity",
        "list name":"bi4sw60",
        "order":2
      },
      {
        "label":"volcanic",
        "name":"volcanic",
        "list name":"bi4sw60",
        "order":3
      },
      {
        "label":"unknown",
        "name":"unknown",
        "list name":"bi4sw60",
        "order":4
      },
      {
        "label":"other",
        "name":"other",
        "list name":"bi4sw60",
        "order":null
      },
      {
        "label":"angular unconformity",
        "name":"angular_unconf",
        "list name":"dq27t21",
        "order":null
      },
      {
        "label":"nonconformity",
        "name":"nonconformity",
        "list name":"dq27t21",
        "order":null
      },
      {
        "label":"disconformity",
        "name":"disconformity",
        "list name":"dq27t21",
        "order":null
      },
      {
        "label":"unknown",
        "name":"unknown",
        "list name":"dq27t21",
        "order":null
      },
      {
        "label":"dike (cuts fabric)",
        "name":"dike",
        "list name":"cj4zw02",
        "order":0
      },
      {
        "label":"sill (conforms to fabric)",
        "name":"sill",
        "list name":"cj4zw02",
        "order":1
      },
      {
        "label":"pluton",
        "name":"pluton",
        "list name":"cj4zw02",
        "order":2
      },
      {
        "label":"migmatite",
        "name":"migmatite",
        "list name":"cj4zw02",
        "order":3
      },
      {
        "label":"injectite",
        "name":"injectite",
        "list name":"cj4zw02",
        "order":4
      },
      {
        "label":"unknown",
        "name":"unknown",
        "list name":"cj4zw02",
        "order":5
      },
      {
        "label":"between different metamorphic rocks",
        "name":"btwn_diff_meta",
        "list name":"pb5wo52",
        "order":0
      },
      {
        "label":"isograd",
        "name":"isograd",
        "list name":"pb5wo52",
        "order":2
      },
      {
        "label":"other",
        "name":"other",
        "list name":"pb5wo52",
        "order":null
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"vn7df87",
        "order":0
      },
      {
        "label":"solid-state",
        "name":"solid_state",
        "list name":"vn7df87",
        "order":1
      },
      {
        "label":"magmatic",
        "name":"magmatic",
        "list name":"vn7df87",
        "order":2
      },
      {
        "label":"migmatitic",
        "name":"migmatitic",
        "list name":"vn7df87",
        "order":3
      },
      {
        "label":"cleavage",
        "name":"cleavage",
        "list name":"vn7df87",
        "order":4
      },
      {
        "label":"lava flow",
        "name":"lava_flow",
        "list name":"vn7df87",
        "order":5
      },
      {
        "label":"compaction",
        "name":"compaction",
        "list name":"vn7df87",
        "order":6
      },
      {
        "label":"other",
        "name":"other",
        "list name":"vn7df87",
        "order":7
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"lz7no78",
        "order":0
      },
      {
        "label":"cataclastic",
        "name":"cataclastic",
        "list name":"lz7no78",
        "order":1
      },
      {
        "label":"mylonitic",
        "name":"mylonitic",
        "list name":"lz7no78",
        "order":2
      },
      {
        "label":"schistosity",
        "name":"schistosity",
        "list name":"lz7no78",
        "order":3
      },
      {
        "label":"lenticular",
        "name":"lenticular",
        "list name":"lz7no78",
        "order":4
      },
      {
        "label":"gneissic banding",
        "name":"gneissic_banding",
        "list name":"lz7no78",
        "order":5
      },
      {
        "label":"strain markers (e.g., flattened pebbles)",
        "name":"strain_marker",
        "list name":"lz7no78",
        "order":6
      },
      {
        "label":"other",
        "name":"other",
        "list name":"lz7no78",
        "order":7
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"su3eo23",
        "order":0
      },
      {
        "label":"S tectonite",
        "name":"s_tectonite",
        "list name":"su3eo23",
        "order":1
      },
      {
        "label":"S-L tectonite",
        "name":"s_l_tectonite",
        "list name":"su3eo23",
        "order":2
      },
      {
        "label":"L-S tectonite",
        "name":"l_s_tectonite",
        "list name":"su3eo23",
        "order":3
      },
      {
        "label":"L tectonite",
        "name":"l_tectonite",
        "list name":"su3eo23",
        "order":4
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"dr5ab45",
        "order":0
      },
      {
        "label":"slatey",
        "name":"slatey",
        "list name":"dr5ab45",
        "order":1
      },
      {
        "label":"phyllitic",
        "name":"phyllitic",
        "list name":"dr5ab45",
        "order":2
      },
      {
        "label":"crenulation",
        "name":"crenulation",
        "list name":"dr5ab45",
        "order":3
      },
      {
        "label":"phacoidal (lensoid)",
        "name":"phacoidal",
        "list name":"dr5ab45",
        "order":4
      },
      {
        "label":"other",
        "name":"other_new",
        "list name":"dr5ab45",
        "order":6
      },
      {
        "label":"quartz",
        "name":"quartz",
        "list name":"pa42s24",
        "order":null
      },
      {
        "label":"calcite",
        "name":"calcite",
        "list name":"pa42s24",
        "order":null
      },
      {
        "label":"other",
        "name":"other",
        "list name":"pa42s24",
        "order":null
      },
      {
        "label":"R",
        "name":"r",
        "list name":"ra0iq26",
        "order":null
      },
      {
        "label":"R'",
        "name":"r_1",
        "list name":"ra0iq26",
        "order":null
      },
      {
        "label":"P",
        "name":"p",
        "list name":"ra0iq26",
        "order":null
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"ku2gk10",
        "order":0
      },
      {
        "label":"strike-slip",
        "name":"strike_slip",
        "list name":"ku2gk10",
        "order":1
      },
      {
        "label":"dip-slip",
        "name":"dip_slip",
        "list name":"ku2gk10",
        "order":2
      },
      {
        "label":"oblique-slip",
        "name":"oblique",
        "list name":"ku2gk10",
        "order":3
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"ww1yf84",
        "order":0
      },
      {
        "label":"dextral",
        "name":"dextral",
        "list name":"ww1yf84",
        "order":1
      },
      {
        "label":"sinistral",
        "name":"sinistral",
        "list name":"ww1yf84",
        "order":2
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"dr9xt23",
        "order":0
      },
      {
        "label":"reverse",
        "name":"reverse",
        "list name":"dr9xt23",
        "order":1
      },
      {
        "label":"normal",
        "name":"normal",
        "list name":"dr9xt23",
        "order":2
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"os1df47",
        "order":0
      },
      {
        "label":"dextral reverse",
        "name":"dextral_reverse",
        "list name":"os1df47",
        "order":1
      },
      {
        "label":"dextral normal",
        "name":"dextral_normal",
        "list name":"os1df47",
        "order":2
      },
      {
        "label":"sinistral reverse",
        "name":"sinistral_reverse",
        "list name":"os1df47",
        "order":3
      },
      {
        "label":"sinistral normal",
        "name":"sinistral_normal",
        "list name":"os1df47",
        "order":4
      },
      {
        "label":"dextral",
        "name":"dextral",
        "list name":"os1df47",
        "order":null
      },
      {
        "label":"sinistral",
        "name":"sinistral",
        "list name":"os1df47",
        "order":null
      },
      {
        "label":"reverse",
        "name":"reverse",
        "list name":"os1df47",
        "order":null
      },
      {
        "label":"normal",
        "name":"normal",
        "list name":"os1df47",
        "order":null
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"kt81l04",
        "order":0
      },
      {
        "label":"offset marker",
        "name":"offset_marker",
        "list name":"kt81l04",
        "order":1
      },
      {
        "label":"directional indicators",
        "name":"direct_indicat",
        "list name":"kt81l04",
        "order":2
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"gs8tm04",
        "order":null
      },
      {
        "label":"bedding",
        "name":"bedding",
        "list name":"gs8tm04",
        "order":null
      },
      {
        "label":"intrusion",
        "name":"intrusion",
        "list name":"gs8tm04",
        "order":null
      },
      {
        "label":"metamorphic foliation",
        "name":"foliation",
        "list name":"gs8tm04",
        "order":null
      },
      {
        "label":"compositional banding",
        "name":"comp_banding",
        "list name":"gs8tm04",
        "order":null
      },
      {
        "label":"geomorphic feature",
        "name":"geomorph_feat",
        "list name":"gs8tm04",
        "order":null
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"td6dh37",
        "order":null
      },
      {
        "label":"bedding",
        "name":"bedding",
        "list name":"td6dh37",
        "order":null
      },
      {
        "label":"intrusion",
        "name":"intrusion",
        "list name":"td6dh37",
        "order":null
      },
      {
        "label":"metamorphic foliation",
        "name":"foliation",
        "list name":"td6dh37",
        "order":null
      },
      {
        "label":"compositional banding",
        "name":"comp_banding",
        "list name":"td6dh37",
        "order":null
      },
      {
        "label":"geomorphic feature",
        "name":"geomorph_feat",
        "list name":"td6dh37",
        "order":null
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"uh1mv47",
        "order":0
      },
      {
        "label":"bedding",
        "name":"bedding",
        "list name":"uh1mv47",
        "order":1
      },
      {
        "label":"intrusion",
        "name":"intrusion",
        "list name":"uh1mv47",
        "order":2
      },
      {
        "label":"metamorphic foliation",
        "name":"foliation",
        "list name":"uh1mv47",
        "order":3
      },
      {
        "label":"compositional banding",
        "name":"comp_banding",
        "list name":"uh1mv47",
        "order":4
      },
      {
        "label":"other marker",
        "name":"other_marker",
        "list name":"uh1mv47",
        "order":6
      },
      {
        "label":"Riedel shear",
        "name":"riedel_shear",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"gouge fill",
        "name":"gouge_fill",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"crescentic fractures",
        "name":"cresc_fracture",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"slickenfibers",
        "name":"slickenfibers",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"oblique gouge foliation",
        "name":"oblique_foliat",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"drag folds",
        "name":"drag_folds",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"rotated clasts",
        "name":"rotated_clasts",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"domino texture",
        "name":"domino_texture",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"tension gashes",
        "name":"tension_gashes",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"asymmetric folds",
        "name":"asymm_folds",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"other",
        "name":"other",
        "list name":"eg8eq24",
        "order":null
      },
      {
        "label":"Riedel shear",
        "name":"riedel_shear",
        "list name":"qr6wd52",
        "order":1
      },
      {
        "label":"gouge fill",
        "name":"gouge_fill",
        "list name":"qr6wd52",
        "order":2
      },
      {
        "label":"crescentic fractures",
        "name":"cresc_fract",
        "list name":"qr6wd52",
        "order":3
      },
      {
        "label":"slickenfibers",
        "name":"slickenfibers",
        "list name":"qr6wd52",
        "order":4
      },
      {
        "label":"oblique gouge foliation",
        "name":"oblique_foliat",
        "list name":"qr6wd52",
        "order":5
      },
      {
        "label":"drag folds",
        "name":"drag_folds",
        "list name":"qr6wd52",
        "order":6
      },
      {
        "label":"rotated clasts",
        "name":"rotated_clasts",
        "list name":"qr6wd52",
        "order":7
      },
      {
        "label":"domino texture",
        "name":"domino_texture",
        "list name":"qr6wd52",
        "order":8
      },
      {
        "label":"tension gashes",
        "name":"tension_gashes",
        "list name":"qr6wd52",
        "order":9
      },
      {
        "label":"asymmetric folds",
        "name":"asymm_folds",
        "list name":"qr6wd52",
        "order":10
      },
      {
        "label":"other",
        "name":"other",
        "list name":"qr6wd52",
        "order":11
      },
      {
        "label":"oblique foliation",
        "name":"oblique_foliation",
        "list name":"xd2fb20",
        "order":1
      },
      {
        "label":"drag folds",
        "name":"drag_folds",
        "list name":"xd2fb20",
        "order":2
      },
      {
        "label":"asymmetric folds",
        "name":"asymm_folds",
        "list name":"xd2fb20",
        "order":3
      },
      {
        "label":"domino texture",
        "name":"domino_clasts",
        "list name":"xd2fb20",
        "order":5
      },
      {
        "label":"rotated clasts",
        "name":"rotated_clasts",
        "list name":"xd2fb20",
        "order":6
      },
      {
        "label":"rotated porphyroblasts",
        "name":"rotated_porph",
        "list name":"xd2fb20",
        "order":7
      },
      {
        "label":"delta porphyroclasts",
        "name":"delta_clasts",
        "list name":"xd2fb20",
        "order":8
      },
      {
        "label":"S-C fabric",
        "name":"s_c_fabric",
        "list name":"xd2fb20",
        "order":9
      },
      {
        "label":"S-C' fabric",
        "name":"s_c__fabric",
        "list name":"xd2fb20",
        "order":10
      },
      {
        "label":"C-C' fabric",
        "name":"c_c__fabric",
        "list name":"xd2fb20",
        "order":11
      },
      {
        "label":"mica fish",
        "name":"mica_fish",
        "list name":"xd2fb20",
        "order":12
      },
      {
        "label":"boudinage",
        "name":"boudinage",
        "list name":"xd2fb20",
        "order":13
      },
      {
        "label":"other",
        "name":"other",
        "list name":"xd2fb20",
        "order":14
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"fq8rt60",
        "order":0
      },
      {
        "label":"This is a list of rock units / descriptions user has made",
        "name":"rock_unit_list",
        "list name":"fq8rt60",
        "order":1
      },
      {
        "label":"More in the list of rock units / descriptions user has made",
        "name":"more_unit_list",
        "list name":"fq8rt60",
        "order":2
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"kw6tp41",
        "order":0
      },
      {
        "label":"This is a list of rock units / descriptions user has made",
        "name":"rock_unit_list",
        "list name":"kw6tp41",
        "order":1
      },
      {
        "label":"More in the list of rock units / descriptions user has made",
        "name":"more_unit_list",
        "list name":"kw6tp41",
        "order":2
      },
      {
        "label":"not specified",
        "name":"not_specified",
        "list name":"of53v22",
        "order":0
      },
      {
        "label":"S",
        "name":"s",
        "list name":"of53v22",
        "order":1
      },
      {
        "label":"C",
        "name":"c",
        "list name":"of53v22",
        "order":2
      },
      {
        "label":"C'",
        "name":"c_1",
        "list name":"of53v22",
        "order":3
      },
      {
        "label":"upright",
        "name":"upright",
        "list name":"to1en66",
        "order":null
      },
      {
        "label":"overturned",
        "name":"overturned",
        "list name":"to1en66",
        "order":null
      },
      {
        "label":"vertical",
        "name":"vertical",
        "list name":"to1en66",
        "order":null
      },
      {
        "label":"unknown",
        "name":"unknown",
        "list name":"to1en66",
        "order":null
      },
      {
        "label":"fault",
        "name":"fault",
        "list name":"lg1ol67",
        "order":0
      },
      {
        "label":"solid-state",
        "name":"solid_state",
        "list name":"lg1ol67",
        "order":1
      },
      {
        "label":"fold hinge",
        "name":"fold_hinge",
        "list name":"lg1ol67",
        "order":2
      },
      {
        "label":"intersection",
        "name":"intersection",
        "list name":"lg1ol67",
        "order":3
      },
      {
        "label":"flow",
        "name":"flow",
        "list name":"lg1ol67",
        "order":4
      },
      {
        "label":"vector",
        "name":"vector",
        "list name":"lg1ol67",
        "order":5
      },
      {
        "label":"other",
        "name":"other",
        "list name":"lg1ol67",
        "order":6
      },
      {
        "label":"striations",
        "name":"striations",
        "list name":"ww1bs55",
        "order":null
      },
      {
        "label":"mullions",
        "name":"mullions",
        "list name":"ww1bs55",
        "order":null
      },
      {
        "label":"slickenfibers",
        "name":"slickenfibers",
        "list name":"ww1bs55",
        "order":null
      },
      {
        "label":"mineral streaks",
        "name":"mineral_streak",
        "list name":"ww1bs55",
        "order":null
      },
      {
        "label":"asymmetric folds",
        "name":"asymm_folds",
        "list name":"ww1bs55",
        "order":null
      },
      {
        "label":"other",
        "name":"other",
        "list name":"ww1bs55",
        "order":null
      },
      {
        "label":"stretching",
        "name":"stretching",
        "list name":"wt9mt75",
        "order":null
      },
      {
        "label":"rodding",
        "name":"rodding",
        "list name":"wt9mt75",
        "order":null
      },
      {
        "label":"boudin",
        "name":"boudin",
        "list name":"wt9mt75",
        "order":null
      },
      {
        "label":"other",
        "name":"other",
        "list name":"wt9mt75",
        "order":null
      },
      {
        "label":"Pencil cleavage",
        "name":"pencil_cleav",
        "list name":"og63u88",
        "order":null
      },
      {
        "label":"centimeter",
        "name":"centimeter",
        "list name":"zq9sr00",
        "order":null
      },
      {
        "label":"meter",
        "name":"meter",
        "list name":"zq9sr00",
        "order":null
      },
      {
        "label":"kilometer",
        "name":"kilometer",
        "list name":"zq9sr00",
        "order":null
      },
      {
        "label":"crenulation",
        "name":"crenulation",
        "list name":"wg6ry31",
        "order":0
      },
      {
        "label":"syncline",
        "name":"syncline",
        "list name":"wg6ry31",
        "order":1
      },
      {
        "label":"anticline",
        "name":"anticline",
        "list name":"wg6ry31",
        "order":2
      },
      {
        "label":"monocline",
        "name":"monocline",
        "list name":"wg6ry31",
        "order":3
      },
      {
        "label":"synform",
        "name":"synform",
        "list name":"wg6ry31",
        "order":4
      },
      {
        "label":"antiform",
        "name":"antiform",
        "list name":"wg6ry31",
        "order":5
      },
      {
        "label":"s-fold",
        "name":"s_fold",
        "list name":"wg6ry31",
        "order":6
      },
      {
        "label":"z-fold",
        "name":"z_fold",
        "list name":"wg6ry31",
        "order":7
      },
      {
        "label":"m-fold",
        "name":"m_fold",
        "list name":"wg6ry31",
        "order":8
      },
      {
        "label":"sheath",
        "name":"sheath",
        "list name":"wg6ry31",
        "order":9
      },
      {
        "label":"chevron",
        "name":"chevron",
        "list name":"fa6tb91",
        "order":0
      },
      {
        "label":"cuspate",
        "name":"cuspate",
        "list name":"fa6tb91",
        "order":1
      },
      {
        "label":"circular",
        "name":"circular",
        "list name":"fa6tb91",
        "order":2
      },
      {
        "label":"elliptical",
        "name":"elliptical",
        "list name":"fa6tb91",
        "order":3
      },
      {
        "label":"upright",
        "name":"upright",
        "list name":"iq4bx64",
        "order":0
      },
      {
        "label":"overturned",
        "name":"overturned",
        "list name":"iq4bx64",
        "order":1
      },
      {
        "label":"vertical",
        "name":"vertical",
        "list name":"iq4bx64",
        "order":2
      },
      {
        "label":"horizontal",
        "name":"horizontal",
        "list name":"iq4bx64",
        "order":3
      },
      {
        "label":"recumbent",
        "name":"recumbent",
        "list name":"iq4bx64",
        "order":4
      },
      {
        "label":"inclined",
        "name":"inclined",
        "list name":"iq4bx64",
        "order":5
      },
      {
        "label":"gentle   (180º –120º)",
        "name":"gentle",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"open   (120\xB0–70\xB0)",
        "name":"open",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"close   (70\xB0–30\xB0)",
        "name":"close",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"tight   (30\xB0–10\xB0)",
        "name":"tight",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"isoclinal   (10\xB0–0\xB0)",
        "name":"isoclinal",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"North",
        "name":"north",
        "list name":"iu9ug45",
        "order":1
      },
      {
        "label":"NE",
        "name":"ne",
        "list name":"iu9ug45",
        "order":3
      },
      {
        "label":"East",
        "name":"east",
        "list name":"iu9ug45",
        "order":5
      },
      {
        "label":"SE",
        "name":"se",
        "list name":"iu9ug45",
        "order":7
      },
      {
        "label":"South",
        "name":"south",
        "list name":"iu9ug45",
        "order":9
      },
      {
        "label":"SW",
        "name":"sw",
        "list name":"iu9ug45",
        "order":11
      },
      {
        "label":"West",
        "name":"west",
        "list name":"iu9ug45",
        "order":13
      },
      {
        "label":"NW",
        "name":"nw",
        "list name":"iu9ug45",
        "order":15
      }
    ];

    factory.rock_description_survey = [
      {
        "name":"unit_label_abbreviation",
        "type":"text",
        "label":"Unit Label (abbreviation)",
        "required":"false",
        "appearance":"",
        "relevant":""
      },
      {
        "name":"Age_Modiifier_for_unit_Label",
        "type":"select_one yt8ht45",
        "label":"Unit Label Age Symbol",
        "required":"false",
        "appearance":"minimal",
        "relevant":""
      },
      {
        "name":"map_unit_name",
        "type":"text",
        "label":"Formation Name",
        "required":"false",
        "appearance":"",
        "relevant":""
      },
      {
        "name":"Member_Name",
        "type":"text",
        "label":"Member Name",
        "required":"false",
        "appearance":"",
        "relevant":""
      },
      {
        "name":"Submember_Name",
        "type":"text",
        "label":"Submember Name",
        "required":"false",
        "appearance":"",
        "relevant":""
      },
      {
        "name":"rock_type",
        "type":"select_one rm0pv08",
        "label":"Rock Type",
        "required":"true",
        "appearance":"horizontal",
        "relevant":""
      },
      {
        "name":"sediment_type",
        "type":"select_one ej6zw88",
        "label":"Sediment Type",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${rock_type} = 'sediment'"
      },
      {
        "name":"other_sediment_type",
        "type":"text",
        "label":"Other Sediment Type",
        "required":"true",
        "appearance":"",
        "relevant":"${sediment_type} = 'other'"
      },
      {
        "name":"sedimentary_rock_type",
        "type":"select_one bt4yo56",
        "label":"Sedimentary Rock Type",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${rock_type} = 'sedimentary'"
      },
      {
        "name":"other_sedimentary_rock_type",
        "type":"text",
        "label":"Other Sedimentary Rock Type",
        "required":"true",
        "appearance":"",
        "relevant":"${sedimentary_rock_type} = 'other'"
      },
      {
        "name":"igneous_rock_class",
        "type":"select_one nm4yc64",
        "label":"Igneous Rock Class",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${rock_type} = 'igneous'"
      },
      {
        "name":"volcanic_rock_type",
        "type":"select_one gw1hp47",
        "label":"Volcanic Rock Type",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${igneous_rock_class} = 'volcanic' or ${igneous_rock_class} = 'hypabyssal'"
      },
      {
        "name":"other_volcanic_rock_type",
        "type":"text",
        "label":"Other Volcanic Rock Type",
        "required":"true",
        "appearance":"",
        "relevant":"${volcanic_rock_type} = 'other'"
      },
      {
        "name":"plutonic_rock_types",
        "type":"select_one pu9hj08",
        "label":"Plutonic Rock Types",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${igneous_rock_class} = 'plutonic'"
      },
      {
        "name":"other_plutonic_rock_type",
        "type":"text",
        "label":"Other Plutonic Rock Type",
        "required":"true",
        "appearance":"",
        "relevant":"${plutonic_rock_types} = 'other'"
      },
      {
        "name":"metamorphic_rock_types",
        "type":"select_one yg0ew35",
        "label":"Metamorphic Rock Types",
        "required":"false",
        "appearance":"",
        "relevant":"${rock_type} = 'metamorphic'"
      },
      {
        "name":"other_metamorphic_rock_type",
        "type":"text",
        "label":"Other Metamorphic Rock Type",
        "required":"true",
        "appearance":"",
        "relevant":"${metamorphic_rock_types} = 'other'"
      },
      {
        "name":"description_lithology",
        "type":"note",
        "label":"Description / Lithology",
        "required":"false",
        "appearance":"",
        "relevant":""
      },
      {
        "name":"absolute_age_of_geologic_unit_",
        "type":"decimal",
        "label":"Absolute Age of Geologic Unit (Ma)",
        "required":"false",
        "appearance":"",
        "relevant":""
      },
      {
        "name":"eon",
        "type":"select_one fy5ep25",
        "label":"Eon",
        "required":"false",
        "appearance":"horizontal",
        "relevant":""
      },
      {
        "name":"Era",
        "type":"select_one kb2cc45",
        "label":"Era",
        "required":"false",
        "appearance":"horizontal",
        "relevant":""
      },
      {
        "name":"Period",
        "type":"select_one xw5wu04",
        "label":"Period",
        "required":"false",
        "appearance":"horizontal",
        "relevant":""
      },
      {
        "name":"Epoch",
        "type":"select_one kf0mi66",
        "label":"Epoch",
        "required":"false",
        "appearance":"horizontal",
        "relevant":""
      },
      {
        "name":"age_modifier",
        "type":"select_one ns6qv42",
        "label":"Age Modifier",
        "required":"false",
        "appearance":"horizontal-compact",
        "relevant":""
      },
      {
        "name":"start",
        "type":"start",
        "label":"",
        "required":"",
        "appearance":"",
        "relevant":""
      },
      {
        "name":"end",
        "type":"end",
        "label":"",
        "required":"",
        "appearance":"",
        "relevant":""
      }
    ];

    factory.rock_description_choices = [
      {
        "label":"Quaternary (Q)",
        "name":"quaternary",
        "order":0,
        "list name":"yt8ht45"
      },
      {
        "label":"Neogene (N)",
        "name":"neogene",
        "order":1,
        "list name":"yt8ht45"
      },
      {
        "label":"Paleogene (:)",
        "name":"paleogene",
        "order":2,
        "list name":"yt8ht45"
      },
      {
        "label":"Cenozoic ({)",
        "name":"cenozoic",
        "order":3,
        "list name":"yt8ht45"
      },
      {
        "label":"Cretaceous (K)",
        "name":"cretaceous",
        "order":4,
        "list name":"yt8ht45"
      },
      {
        "label":"Jurassic (J)",
        "name":"jurassic",
        "order":5,
        "list name":"yt8ht45"
      },
      {
        "label":"Triassic (^)",
        "name":"triassic",
        "order":6,
        "list name":"yt8ht45"
      },
      {
        "label":"Mesozoic (})",
        "name":"mesozoic",
        "order":7,
        "list name":"yt8ht45"
      },
      {
        "label":"Permian (P)",
        "name":"permian",
        "order":8,
        "list name":"yt8ht45"
      },
      {
        "label":"Carboniferous (C)",
        "name":"carboniferous",
        "order":9,
        "list name":"yt8ht45"
      },
      {
        "label":"Pennsylvanian (*)",
        "name":"pennsylvanian",
        "order":10,
        "list name":"yt8ht45"
      },
      {
        "label":"Mississippian (M)",
        "name":"mississippian",
        "order":11,
        "list name":"yt8ht45"
      },
      {
        "label":"Devonian (D)",
        "name":"devonian",
        "order":12,
        "list name":"yt8ht45"
      },
      {
        "label":"Silurian (S)",
        "name":"silurian",
        "order":13,
        "list name":"yt8ht45"
      },
      {
        "label":"Ordovician (O)",
        "name":"ordovician",
        "order":14,
        "list name":"yt8ht45"
      },
      {
        "label":"Cambrian (_)",
        "name":"cambrian",
        "order":15,
        "list name":"yt8ht45"
      },
      {
        "label":"Neoproterozoic (Z)",
        "name":"neoproterozoic",
        "order":16,
        "list name":"yt8ht45"
      },
      {
        "label":"Mesoproterozoic (Y)",
        "name":"mesoproterozoi",
        "order":17,
        "list name":"yt8ht45"
      },
      {
        "label":"Paleoproterozoic (X)",
        "name":"paleoproterozo",
        "order":18,
        "list name":"yt8ht45"
      },
      {
        "label":"Archean (W)",
        "name":"archean",
        "order":19,
        "list name":"yt8ht45"
      },
      {
        "label":"Precambrian (=)",
        "name":"precambrian",
        "order":20,
        "list name":"yt8ht45"
      },
      {
        "label":"unknown",
        "name":"unknown",
        "order":21,
        "list name":"yt8ht45"
      },
      {
        "label":"igneous",
        "name":"igneous",
        "order":0,
        "list name":"rm0pv08"
      },
      {
        "label":"metamorphic",
        "name":"metamorphic",
        "order":1,
        "list name":"rm0pv08"
      },
      {
        "label":"sedimentary",
        "name":"sedimentary",
        "order":2,
        "list name":"rm0pv08"
      },
      {
        "label":"sediment",
        "name":"sediment",
        "order":3,
        "list name":"rm0pv08"
      },
      {
        "label":"alluvium",
        "name":"alluvium",
        "order":0,
        "list name":"ej6zw88"
      },
      {
        "label":"older alluvium",
        "name":"older_alluvium",
        "order":1,
        "list name":"ej6zw88"
      },
      {
        "label":"colluvium",
        "name":"colluvium",
        "order":2,
        "list name":"ej6zw88"
      },
      {
        "label":"lake deposit",
        "name":"lake_deposit",
        "order":3,
        "list name":"ej6zw88"
      },
      {
        "label":"eolian",
        "name":"eolian",
        "order":4,
        "list name":"ej6zw88"
      },
      {
        "label":"talus",
        "name":"talus",
        "order":5,
        "list name":"ej6zw88"
      },
      {
        "label":"breccia",
        "name":"breccia",
        "order":6,
        "list name":"ej6zw88"
      },
      {
        "label":"gravel",
        "name":"gravel",
        "order":7,
        "list name":"ej6zw88"
      },
      {
        "label":"sand",
        "name":"sand",
        "order":8,
        "list name":"ej6zw88"
      },
      {
        "label":"silt",
        "name":"silt",
        "order":9,
        "list name":"ej6zw88"
      },
      {
        "label":"clay",
        "name":"clay",
        "order":10,
        "list name":"ej6zw88"
      },
      {
        "label":"moraine",
        "name":"moraine",
        "order":11,
        "list name":"ej6zw88"
      },
      {
        "label":"till",
        "name":"till",
        "order":12,
        "list name":"ej6zw88"
      },
      {
        "label":"loess",
        "name":"loess",
        "order":13,
        "list name":"ej6zw88"
      },
      {
        "label":"other",
        "name":"other",
        "order":14,
        "list name":"ej6zw88"
      },
      {
        "label":"limestone",
        "name":"limestone",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"dolostone",
        "name":"dolostone",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"travertine",
        "name":"travertine",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"evaporite",
        "name":"evaporite",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"chert",
        "name":"chert",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"conglomerate",
        "name":"conglomerate",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"breccia",
        "name":"breccia",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"sandstone",
        "name":"sandstone",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"siltstone",
        "name":"siltstone",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"mudstone",
        "name":"mudstone",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"shale",
        "name":"shale",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"claystone",
        "name":"claystone",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"coal",
        "name":"coal",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"other",
        "name":"other",
        "order":null,
        "list name":"bt4yo56"
      },
      {
        "label":"volcanic",
        "name":"volcanic",
        "order":null,
        "list name":"nm4yc64"
      },
      {
        "label":"plutonic",
        "name":"plutonic",
        "order":null,
        "list name":"nm4yc64"
      },
      {
        "label":"hypabyssal",
        "name":"hypabyssal",
        "order":null,
        "list name":"nm4yc64"
      },
      {
        "label":"basalt",
        "name":"basalt",
        "order":0,
        "list name":"gw1hp47"
      },
      {
        "label":"basaltic-andesite",
        "name":"basaltic_andes",
        "order":1,
        "list name":"gw1hp47"
      },
      {
        "label":"andesite",
        "name":"andesite",
        "order":2,
        "list name":"gw1hp47"
      },
      {
        "label":"latite",
        "name":"latite",
        "order":3,
        "list name":"gw1hp47"
      },
      {
        "label":"dacite",
        "name":"dacite",
        "order":4,
        "list name":"gw1hp47"
      },
      {
        "label":"rhyolite",
        "name":"rhyolite",
        "order":5,
        "list name":"gw1hp47"
      },
      {
        "label":"tuff",
        "name":"tuff",
        "order":6,
        "list name":"gw1hp47"
      },
      {
        "label":"ash-fall tuff",
        "name":"ash_fall_tuff",
        "order":7,
        "list name":"gw1hp47"
      },
      {
        "label":"ash-flow tuff",
        "name":"ash_flow_tuff",
        "order":8,
        "list name":"gw1hp47"
      },
      {
        "label":"vitrophyre",
        "name":"vitrophyre",
        "order":10,
        "list name":"gw1hp47"
      },
      {
        "label":"trachyte",
        "name":"trachyte",
        "order":11,
        "list name":"gw1hp47"
      },
      {
        "label":"trachyandesite",
        "name":"trachyandesite",
        "order":12,
        "list name":"gw1hp47"
      },
      {
        "label":"tuff breccia",
        "name":"tuff_breccia",
        "order":13,
        "list name":"gw1hp47"
      },
      {
        "label":"lapilli tuff",
        "name":"lapilli_tuff",
        "order":14,
        "list name":"gw1hp47"
      },
      {
        "label":"other",
        "name":"other",
        "order":15,
        "list name":"gw1hp47"
      },
      {
        "label":"granite",
        "name":"granite",
        "order":0,
        "list name":"pu9hj08"
      },
      {
        "label":"alkali feldspar granite",
        "name":"alkali_granite",
        "order":1,
        "list name":"pu9hj08"
      },
      {
        "label":"quartz monzonite",
        "name":"quartz_monz",
        "order":2,
        "list name":"pu9hj08"
      },
      {
        "label":"syenite",
        "name":"syenite",
        "order":3,
        "list name":"pu9hj08"
      },
      {
        "label":"granodiorite",
        "name":"granodiorite",
        "order":4,
        "list name":"pu9hj08"
      },
      {
        "label":"monzonite",
        "name":"monzonite",
        "order":5,
        "list name":"pu9hj08"
      },
      {
        "label":"tonalite",
        "name":"tonalite",
        "order":6,
        "list name":"pu9hj08"
      },
      {
        "label":"diorite",
        "name":"diorite",
        "order":7,
        "list name":"pu9hj08"
      },
      {
        "label":"gabbro",
        "name":"gabbro",
        "order":9,
        "list name":"pu9hj08"
      },
      {
        "label":"anorthosite",
        "name":"anorthosite",
        "order":10,
        "list name":"pu9hj08"
      },
      {
        "label":"other",
        "name":"other",
        "order":15,
        "list name":"pu9hj08"
      },
      {
        "label":"low-grade",
        "name":"low_grade",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"medium-grade",
        "name":"medium_grade",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"high-grade",
        "name":"high_grade",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"slate",
        "name":"slate",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"phyllite",
        "name":"phyllite",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"schist",
        "name":"schist",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"gneiss",
        "name":"gneiss",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"marble",
        "name":"marble",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"quartzite",
        "name":"quartzite",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"amphibolite",
        "name":"amphibolite",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"serpentinite",
        "name":"serpentinite",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"hornfels",
        "name":"hornfels",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"metavolcanic",
        "name":"metavolcanic",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"calc-silicate",
        "name":"calc_silicate",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"mylonite",
        "name":"mylonite",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"other",
        "name":"other",
        "order":null,
        "list name":"yg0ew35"
      },
      {
        "label":"Phanerozoic",
        "name":"phanerozoic",
        "order":null,
        "list name":"fy5ep25"
      },
      {
        "label":"Proterozoic",
        "name":"proterozoic",
        "order":null,
        "list name":"fy5ep25"
      },
      {
        "label":"Archean",
        "name":"archean",
        "order":null,
        "list name":"fy5ep25"
      },
      {
        "label":"Hadean",
        "name":"hadean",
        "order":null,
        "list name":"fy5ep25"
      },
      {
        "label":"Cenozoic",
        "name":"cenozoic",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Mesozoic",
        "name":"mesozoic",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Paleozoic",
        "name":"paleozoic",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Neoproterozoic",
        "name":"neoproterozoic",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Mesoproterozoic",
        "name":"mesoproterozoi",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Paleoproterozoic",
        "name":"paleoproterozo",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Neoarchean",
        "name":"neoarchean",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Mesoarchean",
        "name":"mesoarchean",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Paleoarchean",
        "name":"paleoarchean",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Eoarchean",
        "name":"eoarchean",
        "order":null,
        "list name":"kb2cc45"
      },
      {
        "label":"Quaternary",
        "name":"quaternary",
        "order":0,
        "list name":"xw5wu04"
      },
      {
        "label":"Neogene",
        "name":"neogene",
        "order":1,
        "list name":"xw5wu04"
      },
      {
        "label":"Paleogene",
        "name":"paleogene",
        "order":2,
        "list name":"xw5wu04"
      },
      {
        "label":"Cretaceous",
        "name":"cretaceous",
        "order":3,
        "list name":"xw5wu04"
      },
      {
        "label":"Jurassic",
        "name":"jurassic",
        "order":4,
        "list name":"xw5wu04"
      },
      {
        "label":"Triassic",
        "name":"triassic",
        "order":5,
        "list name":"xw5wu04"
      },
      {
        "label":"Permian",
        "name":"permian",
        "order":6,
        "list name":"xw5wu04"
      },
      {
        "label":"Carboniferous",
        "name":"carboniferous",
        "order":7,
        "list name":"xw5wu04"
      },
      {
        "label":"Pennsylvanian",
        "name":"pennsylvanian",
        "order":8,
        "list name":"xw5wu04"
      },
      {
        "label":"Mississippian",
        "name":"mississippian",
        "order":9,
        "list name":"xw5wu04"
      },
      {
        "label":"Devonian",
        "name":"devonian",
        "order":10,
        "list name":"xw5wu04"
      },
      {
        "label":"Silurian",
        "name":"silurian",
        "order":11,
        "list name":"xw5wu04"
      },
      {
        "label":"Ordovician",
        "name":"ordovician",
        "order":12,
        "list name":"xw5wu04"
      },
      {
        "label":"Cambrian",
        "name":"cambrian",
        "order":13,
        "list name":"xw5wu04"
      },
      {
        "label":"Ediacaran",
        "name":"ediacaran",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Cryogenian",
        "name":"cryogenian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Tonian",
        "name":"tonian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Stenian",
        "name":"stenian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Ectasian",
        "name":"ectasian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Calymmian",
        "name":"calymmian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Statherian",
        "name":"statherian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Orosirian",
        "name":"orosirian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Rhyacian",
        "name":"rhyacian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Siderian",
        "name":"siderian",
        "order":null,
        "list name":"xw5wu04"
      },
      {
        "label":"Holocene",
        "name":"holocene",
        "order":null,
        "list name":"kf0mi66"
      },
      {
        "label":"Pleistocene",
        "name":"pleistocene",
        "order":null,
        "list name":"kf0mi66"
      },
      {
        "label":"Pliocene",
        "name":"pliocene",
        "order":null,
        "list name":"kf0mi66"
      },
      {
        "label":"Miocene",
        "name":"miocene",
        "order":null,
        "list name":"kf0mi66"
      },
      {
        "label":"Oligocene",
        "name":"oligocene",
        "order":null,
        "list name":"kf0mi66"
      },
      {
        "label":"Eocene",
        "name":"eocene",
        "order":null,
        "list name":"kf0mi66"
      },
      {
        "label":"Paleocene",
        "name":"paleocene",
        "order":null,
        "list name":"kf0mi66"
      },
      {
        "label":"Late",
        "name":"late",
        "order":null,
        "list name":"ns6qv42"
      },
      {
        "label":"Middle",
        "name":"middle",
        "order":null,
        "list name":"ns6qv42"
      },
      {
        "label":"Early",
        "name":"early",
        "order":null,
        "list name":"ns6qv42"
      }
    ];

    factory.rock_sample_survey = [
      {
        "name":"sample_id_name",
        "type":"text",
        "label":"Sample specific ID / Name",
        "required":"true",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"oriented_sample",
        "type":"select_one hz9zw76",
        "label":"Oriented Sample",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"sample_orientation_strike",
        "type":"integer",
        "label":"Sample Orientation Strike",
        "required":"true",
        "hint":"What's the strike of orientation mark / surface?",
        "relevant":"${oriented_sample} = 'yes'",
        "constraint":". <= 360 and . >= 0",
        "constraint_message":"Strike must be between 0-360."
      },
      {
        "name":"sample_orientation_dip",
        "type":"integer",
        "label":"Sample Orientation Dip",
        "required":"true",
        "hint":"What's the dip of orientation mark / surface?",
        "relevant":"${oriented_sample} = 'yes'",
        "constraint":". >= 0 and . <= 90",
        "constraint_message":"Dip must be between 0-90."
      },
      {
        "name":"material_type",
        "type":"select_one jq8qd30",
        "label":"Material Type",
        "required":"true",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"Other_Material_Type",
        "type":"text",
        "label":"Other Material Type",
        "required":"true",
        "hint":"",
        "relevant":"${material_type} = 'other'",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"material_details",
        "type":"note",
        "label":"Material Details",
        "required":"false",
        "hint":"",
        "relevant":"${material_type} != ''",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"sample_size_cm",
        "type":"decimal",
        "label":"Sample Size (cm)",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"main_sampling_purpose",
        "type":"select_one to0mv13",
        "label":"Main Sampling Purpose",
        "required":"true",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"sample_description",
        "type":"note",
        "label":"Sample Description",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"other_comments_about_sampling",
        "type":"note",
        "label":"Other Comments About Sampling",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"inferred_age_of_sample_ma",
        "type":"decimal",
        "label":"Inferred Age of Sample (Ma)",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"start",
        "type":"start",
        "label":"",
        "required":"",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      },
      {
        "name":"end",
        "type":"end",
        "label":"",
        "required":"",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":""
      }
    ];

    factory.rock_sample_choices = [
      {
        "label":"Yes",
        "name":"yes",
        "list name":"hz9zw76",
        "order":null
      },
      {
        "label":"No",
        "name":"no",
        "list name":"hz9zw76",
        "order":null
      },
      {
        "label":"intact rock",
        "name":"intact_rock",
        "list name":"jq8qd30",
        "order":null
      },
      {
        "label":"fragmented rock",
        "name":"fragmented_roc",
        "list name":"jq8qd30",
        "order":null
      },
      {
        "label":"sediment",
        "name":"sediment",
        "list name":"jq8qd30",
        "order":null
      },
      {
        "label":"other",
        "name":"other",
        "list name":"jq8qd30",
        "order":null
      },
      {
        "label":"fabric / microstructure",
        "name":"fabric___micro",
        "list name":"to0mv13",
        "order":0
      },
      {
        "label":"petrology",
        "name":"petrology",
        "list name":"to0mv13",
        "order":1
      },
      {
        "label":"geochronology",
        "name":"geochronology",
        "list name":"to0mv13",
        "order":2
      },
      {
        "label":"geochemistry",
        "name":"geochemistry",
        "list name":"to0mv13",
        "order":3
      },
      {
        "label":"other",
        "name":"other",
        "list name":"to0mv13",
        "order":4
      }
    ];

    factory.spot_grouping_survey = [
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
    ];

    factory.spot_grouping_choices = [
      {
        "label": "other / new",
        "name": "new",
        "order": "0",
        "list name": "xn4xv87"
      },
      {
        "label": "feature type",
        "name": "feature_type",
        "order": "1",
        "list name": "xn4xv87"
      },
      {
        "label": "part of larger structure",
        "name": "larger_structu",
        "order": "2",
        "list name": "xn4xv87"
      },
      {
        "label": "age",
        "name": "age",
        "order": "3",
        "list name": "xn4xv87"
      },
      {
        "label": "location",
        "name": "location",
        "order": "4",
        "list name": "xn4xv87"
      },
      {
        "label": "part of same process or event",
        "name": "process",
        "order": "5",
        "list name": "xn4xv87"
      },
      {
        "label": "fault",
        "name": "fault",
        "order": "",
        "list name": "lr0jp76"
      },
      {
        "label": "fold",
        "name": "fold",
        "order": "",
        "list name": "lr0jp76"
      },
      {
        "label": "shear zone",
        "name": "shear_zone",
        "order": "",
        "list name": "lr0jp76"
      },
      {
        "label": "intrusive body",
        "name": "intrusive_body",
        "order": "",
        "list name": "lr0jp76"
      },
      {
        "label": "other",
        "name": "other",
        "order": "",
        "list name": "lr0jp76"
      }
    ];

    return factory;
  });
