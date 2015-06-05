'use strict';

angular.module('app')
  .factory('ContentModelSurveyFactory', function() {

    var factory = {};

    factory.contacts_and_traces_survey = [{
      "name": "contact_type",
      "type": "select_one lx9ax28",
      "label": "Contact Type",
      "required": "true",
      "appearance": "horizontal",
      "relevant": "",
      "hint": "",
      "default": ""
    }, {
      "name": "Other_Contact_Type",
      "type": "text",
      "label": "Other Contact Type",
      "required": "true",
      "appearance": "",
      "relevant": "${contact_type} = 'other'",
      "hint": "",
      "default": ""
    }, {
      "name": "depositional_contact_type",
      "type": "select_one bi4sw60",
      "label": "Depositional Contact Type",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'depositional'",
      "hint": "",
      "default": ""
    }, {
      "name": "Other_Depositional_Type",
      "type": "text",
      "label": "Other Depositional Type",
      "required": "true",
      "appearance": "",
      "relevant": "${depositional_contact_type} = 'other'",
      "hint": "",
      "default": ""
    }, {
      "name": "unconformity_type",
      "type": "select_one dq27t21",
      "label": "Unconformity Type",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${depositional_contact_type} = 'unconformity'",
      "hint": "",
      "default": ""
    }, {
      "name": "intruding_feature",
      "type": "select_one cj4zw02",
      "label": "Intruding Feature",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'intrusive'",
      "hint": "What type of feature is intruding?",
      "default": ""
    }, {
      "name": "metamorphic_contact_type",
      "type": "select_one pb5wo52",
      "label": "Metamorphic Contact Type",
      "required": "false",
      "appearance": "horizontal-compact",
      "relevant": "${contact_type} = 'metamorphic'",
      "hint": "",
      "default": ""
    }, {
      "name": "metamorphic_contact_other_det",
      "type": "note",
      "label": "Other Metamorphic Contact",
      "required": "true",
      "appearance": "",
      "relevant": "${metamorphic_contact_type} = 'other'",
      "hint": "",
      "default": ""
    }, {
      "name": "marker_layer_details",
      "type": "note",
      "label": "Marker Layer Details",
      "required": "false",
      "appearance": "",
      "relevant": "${contact_type} = 'marker_layer'",
      "hint": "Notes about the marker layer",
      "default": "No details specified."
    }, {
      "name": "fault_geometry",
      "type": "select_one ku2gk10",
      "label": "Type of Fault or Shear Zone",
      "required": "false",
      "appearance": "horizontal-compact",
      "relevant": "${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "strike_slip_movement",
      "type": "select_one ww1yf84",
      "label": "Strike-Slip Movement",
      "required": "false",
      "appearance": "horizontal-compact",
      "relevant": "${fault_geometry} = 'strike_slip'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "dip_slip_movement",
      "type": "select_one dr9xt23",
      "label": "Dip-Slip Movement",
      "required": "false",
      "appearance": "horizontal-compact",
      "relevant": "${fault_geometry} = 'dip_slip'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "oblique_movement",
      "type": "select_one os1df47",
      "label": "Oblique Movement",
      "required": "false",
      "appearance": "horizontal-compact",
      "relevant": "${fault_geometry} = 'oblique'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "movement_justification",
      "type": "select_one kt81l04",
      "label": "Movement Justification",
      "required": "false",
      "appearance": "horizontal-compact",
      "relevant": "${fault_geometry} = 'strike_slip' or ${fault_geometry} = 'dip_slip' or ${fault_geometry} = 'oblique'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "Fault_Offset_Markers",
      "type": "select_multiple gs8tm04",
      "label": "Fault Offset Markers",
      "required": "true",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'fault' and ${movement_justification} = 'offset'",
      "hint": "",
      "default": ""
    }, {
      "name": "offset_markers_001",
      "type": "select_multiple uh1mv47",
      "label": "Shear Zone Offset Markers",
      "required": "true",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'shear_zone' and ${movement_justification} = 'offset'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "marker_detail",
      "type": "text",
      "label": "Other Offset Marker and Detail",
      "required": "false",
      "appearance": "multiline",
      "relevant": "${movement_justification} = 'offset'",
      "hint": "Describe marker or piercing point details",
      "default": ""
    }, {
      "name": "Offset_m",
      "type": "decimal",
      "label": "Offset (m)",
      "required": "false",
      "appearance": "",
      "relevant": "${movement_justification} = 'offset'",
      "hint": "",
      "default": ""
    }, {
      "name": "directional_indicators",
      "type": "select_multiple xd2fb20",
      "label": "Fault Slip Directional Indicators",
      "required": "true",
      "appearance": "horizontal",
      "relevant": "${movement_justification} = 'directional_indicator' and ${contact_type} = 'fault'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "Shear_Zone_Directional_indicat",
      "type": "select_multiple go8zy48",
      "label": "Shear Zone Directional indicators",
      "required": "true",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'shear_zone' and ${movement_justification} = 'directional_indicator'",
      "hint": "",
      "default": ""
    }, {
      "name": "Other_Directional_Indicator",
      "type": "text",
      "label": "Other Directional Indicator",
      "required": "true",
      "appearance": "",
      "relevant": "selected(${directional_indicators}, 'other') or selected(${Shear_Zone_Directional_indicat}, 'other')",
      "hint": "",
      "default": ""
    }, {
      "name": "Thickness_of_Fault_or_Shear_Zo",
      "type": "decimal",
      "label": "Thickness of Fault or Shear Zone (m)",
      "required": "false",
      "appearance": "",
      "relevant": "${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint": "",
      "default": ""
    }, {
      "name": "Minimum_Age_of_Deformation_Ma",
      "type": "decimal",
      "label": "Minimum Age of Deformation (Ma)",
      "required": "false",
      "appearance": "",
      "relevant": "${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint": "",
      "default": ""
    }, {
      "name": "Maximum_Age_of_Deformation_Ma",
      "type": "decimal",
      "label": "Maximum Age of Deformation (Ma)",
      "required": "false",
      "appearance": "",
      "relevant": "${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint": "",
      "default": ""
    }, {
      "name": "juxtaposes_rocks",
      "type": "select_multiple fq8rt60",
      "label": "Juxtaposes __________ rocks....",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "against_rocks",
      "type": "select_multiple kw6tp41",
      "label": "... against ________ rocks.",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint": "",
      "default": "not_specified"
    }, {
      "name": "fold_geometry",
      "type": "select_one wg6ry31",
      "label": "Dominant Fold Geometry",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'option_11'",
      "hint": "What is the shape of the fold when looking down-plunge?",
      "default": ""
    }, {
      "name": "fold_shape",
      "type": "select_one fa6tb91",
      "label": "Dominant Fold Shape",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'option_11'",
      "hint": "",
      "default": ""
    }, {
      "name": "fold_attitude",
      "type": "select_one iq4bx64",
      "label": "Dominant Fold Attitude",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'option_11'",
      "hint": "",
      "default": ""
    }, {
      "name": "tightness",
      "type": "select_one ao3ks66",
      "label": "Tightness / Interlimb Angle",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'option_11'",
      "hint": "",
      "default": ""
    }, {
      "name": "vergence",
      "type": "select_one iu9ug45",
      "label": "Vergence",
      "required": "false",
      "appearance": "horizontal-compact",
      "relevant": "${contact_type} = 'option_11'",
      "hint": "Approximate direction of vergence from fold asymmetry",
      "default": "None"
    }, {
      "name": "Contact_Quality",
      "type": "select_one wb5nf41",
      "label": "Contact Quality",
      "required": "true",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'depositional' or ${contact_type} = 'intrusive' or ${contact_type} = 'metamorphic' or ${contact_type} = 'fault' or ${contact_type} = 'shear_zone' or ${contact_type} = 'option_11' or ${contact_type} = 'unknown' or ${contact_type} = 'marker_layer'",
      "hint": "",
      "default": ""
    }, {
      "name": "Contact_Character",
      "type": "select_one rd1pp06",
      "label": "Contact Character",
      "required": "false",
      "appearance": "horizontal",
      "relevant": "${contact_type} = 'depositional' or ${contact_type} = 'intrusive' or ${contact_type} = 'metamorphic' or ${contact_type} = 'fault' or ${contact_type} = 'shear_zone'",
      "hint": "",
      "default": ""
    }, {
      "name": "start",
      "type": "start",
      "label": "",
      "required": "",
      "appearance": "",
      "relevant": "",
      "hint": "",
      "default": ""
    }, {
      "name": "end",
      "type": "end",
      "label": "",
      "required": "",
      "appearance": "",
      "relevant": "",
      "hint": "",
      "default": ""
    }];

    factory.contacts_and_traces_choices = [{
      "label": "depositional",
      "name": "depositional",
      "order": 0,
      "list name": "lx9ax28"
    }, {
      "label": "intrusive",
      "name": "intrusive",
      "order": 1,
      "list name": "lx9ax28"
    }, {
      "label": "metamorphic",
      "name": "metamorphic",
      "order": 2,
      "list name": "lx9ax28"
    }, {
      "label": "fault",
      "name": "fault",
      "order": 3,
      "list name": "lx9ax28"
    }, {
      "label": "shear zone",
      "name": "shear_zone",
      "order": 4,
      "list name": "lx9ax28"
    }, {
      "label": "fold trace",
      "name": "option_11",
      "order": 5,
      "list name": "lx9ax28"
    }, {
      "label": "marker layer",
      "name": "marker_layer",
      "order": 6,
      "list name": "lx9ax28"
    }, {
      "label": "edge of mapping",
      "name": "edge_of_mappin",
      "order": 7,
      "list name": "lx9ax28"
    }, {
      "label": "temporary",
      "name": "temporary",
      "order": 8,
      "list name": "lx9ax28"
    }, {
      "label": "unknown",
      "name": "unknown",
      "order": 9,
      "list name": "lx9ax28"
    }, {
      "label": "other",
      "name": "other",
      "order": 10,
      "list name": "lx9ax28"
    }, {
      "label": "stratigraphic",
      "name": "stratigraphic",
      "order": 0,
      "list name": "bi4sw60"
    }, {
      "label": "alluvial",
      "name": "alluvial",
      "order": 1,
      "list name": "bi4sw60"
    }, {
      "label": "unconformity",
      "name": "unconformity",
      "order": 2,
      "list name": "bi4sw60"
    }, {
      "label": "volcanic",
      "name": "volcanic",
      "order": 3,
      "list name": "bi4sw60"
    }, {
      "label": "unknown",
      "name": "unknown",
      "order": 4,
      "list name": "bi4sw60"
    }, {
      "label": "other",
      "name": "other",
      "order": null,
      "list name": "bi4sw60"
    }, {
      "label": "angular unconformity",
      "name": "angular_unconf",
      "order": null,
      "list name": "dq27t21"
    }, {
      "label": "nonconformity",
      "name": "nonconformity",
      "order": null,
      "list name": "dq27t21"
    }, {
      "label": "disconformity",
      "name": "disconformity",
      "order": null,
      "list name": "dq27t21"
    }, {
      "label": "unknown",
      "name": "unknown",
      "order": null,
      "list name": "dq27t21"
    }, {
      "label": "dike (cuts fabric)",
      "name": "dike",
      "order": 0,
      "list name": "cj4zw02"
    }, {
      "label": "sill (conforms to fabric)",
      "name": "sill",
      "order": 1,
      "list name": "cj4zw02"
    }, {
      "label": "pluton",
      "name": "pluton",
      "order": 2,
      "list name": "cj4zw02"
    }, {
      "label": "migmatite",
      "name": "migmatite",
      "order": 3,
      "list name": "cj4zw02"
    }, {
      "label": "injectite",
      "name": "injectite",
      "order": 4,
      "list name": "cj4zw02"
    }, {
      "label": "unknown",
      "name": "unknown",
      "order": 5,
      "list name": "cj4zw02"
    }, {
      "label": "between different metamorphic rocks",
      "name": "between_two_di",
      "order": 0,
      "list name": "pb5wo52"
    }, {
      "label": "isograd",
      "name": "isograd",
      "order": 2,
      "list name": "pb5wo52"
    }, {
      "label": "other",
      "name": "other",
      "order": null,
      "list name": "pb5wo52"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": 0,
      "list name": "ku2gk10"
    }, {
      "label": "strike-slip",
      "name": "strike_slip",
      "order": 1,
      "list name": "ku2gk10"
    }, {
      "label": "dip-slip",
      "name": "dip_slip",
      "order": 2,
      "list name": "ku2gk10"
    }, {
      "label": "oblique",
      "name": "oblique",
      "order": 3,
      "list name": "ku2gk10"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": 0,
      "list name": "ww1yf84"
    }, {
      "label": "dextral",
      "name": "dextral",
      "order": 1,
      "list name": "ww1yf84"
    }, {
      "label": "sinistral",
      "name": "sinistral",
      "order": 2,
      "list name": "ww1yf84"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": 0,
      "list name": "dr9xt23"
    }, {
      "label": "normal",
      "name": "normal",
      "order": 1,
      "list name": "dr9xt23"
    }, {
      "label": "reverse",
      "name": "reverse",
      "order": 2,
      "list name": "dr9xt23"
    }, {
      "label": "thrust",
      "name": "thrust",
      "order": 3,
      "list name": "dr9xt23"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": 0,
      "list name": "os1df47"
    }, {
      "label": "dextral reverse",
      "name": "dextral_reverse",
      "order": 1,
      "list name": "os1df47"
    }, {
      "label": "dextral normal",
      "name": "dextral_normal",
      "order": 2,
      "list name": "os1df47"
    }, {
      "label": "sinistral reverse",
      "name": "sinistral_reverse",
      "order": 3,
      "list name": "os1df47"
    }, {
      "label": "sinistral normal",
      "name": "sinistral_normal",
      "order": 4,
      "list name": "os1df47"
    }, {
      "label": "dextral",
      "name": "dextral",
      "order": null,
      "list name": "os1df47"
    }, {
      "label": "sinistral",
      "name": "sinistral",
      "order": null,
      "list name": "os1df47"
    }, {
      "label": "reverse",
      "name": "reverse",
      "order": null,
      "list name": "os1df47"
    }, {
      "label": "normal",
      "name": "normal",
      "order": null,
      "list name": "os1df47"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": 0,
      "list name": "kt81l04"
    }, {
      "label": "offset marker",
      "name": "offset",
      "order": 1,
      "list name": "kt81l04"
    }, {
      "label": "directional indicators",
      "name": "directional_indicator",
      "order": 2,
      "list name": "kt81l04"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": null,
      "list name": "gs8tm04"
    }, {
      "label": "bedding",
      "name": "bedding",
      "order": null,
      "list name": "gs8tm04"
    }, {
      "label": "intrusion",
      "name": "intrusion",
      "order": null,
      "list name": "gs8tm04"
    }, {
      "label": "metamorphic foliation",
      "name": "metamorphic_fo",
      "order": null,
      "list name": "gs8tm04"
    }, {
      "label": "compositional banding",
      "name": "compositional_",
      "order": null,
      "list name": "gs8tm04"
    }, {
      "label": "geomorphic feature",
      "name": "geomorphic_fea",
      "order": null,
      "list name": "gs8tm04"
    }, {
      "label": "other",
      "name": "other",
      "order": null,
      "list name": "gs8tm04"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": 0,
      "list name": "uh1mv47"
    }, {
      "label": "bedding",
      "name": "bedding",
      "order": 1,
      "list name": "uh1mv47"
    }, {
      "label": "intrusion",
      "name": "intrusion",
      "order": 2,
      "list name": "uh1mv47"
    }, {
      "label": "metamorphic foliation",
      "name": "metamorphic_foliation",
      "order": 3,
      "list name": "uh1mv47"
    }, {
      "label": "compositional banding",
      "name": "compositional_banding",
      "order": 4,
      "list name": "uh1mv47"
    }, {
      "label": "other",
      "name": "other_marker",
      "order": 6,
      "list name": "uh1mv47"
    }, {
      "label": "Riedel shears",
      "name": "riedel_shears",
      "order": 0,
      "list name": "xd2fb20"
    }, {
      "label": "gouge fill",
      "name": "gouge_fill",
      "order": 1,
      "list name": "xd2fb20"
    }, {
      "label": "crescentic fractures",
      "name": "crescentic_fractures",
      "order": 2,
      "list name": "xd2fb20"
    }, {
      "label": "slickenfibers",
      "name": "slickenfibers",
      "order": 3,
      "list name": "xd2fb20"
    }, {
      "label": "tension gashes",
      "name": "tension_gashes",
      "order": 4,
      "list name": "xd2fb20"
    }, {
      "label": "oblique foliation",
      "name": "oblique_foliation",
      "order": 5,
      "list name": "xd2fb20"
    }, {
      "label": "drag folds",
      "name": "drag_folds",
      "order": 6,
      "list name": "xd2fb20"
    }, {
      "label": "asymmetric folds",
      "name": "asymmetric_folds",
      "order": 7,
      "list name": "xd2fb20"
    }, {
      "label": "rotated clasts",
      "name": "rotated_clasts",
      "order": 8,
      "list name": "xd2fb20"
    }, {
      "label": "domino clasts",
      "name": "domino_clasts",
      "order": 9,
      "list name": "xd2fb20"
    }, {
      "label": "other",
      "name": "other",
      "order": 10,
      "list name": "xd2fb20"
    }, {
      "label": "oblique foliation",
      "name": "oblique_foliat",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "drag",
      "name": "drag",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "asymmetric folds",
      "name": "asymmetric_fol",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "domino texture",
      "name": "domino_texture",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "rotated clasts",
      "name": "rotated_clasts",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "rotated porphyroblasts",
      "name": "rotated_porphy",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "delta clasts",
      "name": "delta_clasts",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "S-C fabric",
      "name": "s_c_fabric",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "S-C' fabric",
      "name": "s_c__fabric",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "C-C' fabric",
      "name": "c_c__fabric",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "mica fish",
      "name": "mica_fish",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "boudinage",
      "name": "boudinage",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "other",
      "name": "other",
      "order": null,
      "list name": "go8zy48"
    }, {
      "label": "This is a list of rock units / descriptions user has made",
      "name": "this_is_a_list",
      "order": null,
      "list name": "fq8rt60"
    }, {
      "label": "More in the list of rock units / descriptions user has made",
      "name": "more_in_the_li",
      "order": null,
      "list name": "fq8rt60"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": null,
      "list name": "fq8rt60"
    }, {
      "label": "This is a list of rock units / descriptions user has made",
      "name": "this_is_a_list",
      "order": null,
      "list name": "kw6tp41"
    }, {
      "label": "More in the list of rock units / descriptions user has made",
      "name": "more_in_the_li",
      "order": null,
      "list name": "kw6tp41"
    }, {
      "label": "not specified",
      "name": "not_specified",
      "order": null,
      "list name": "kw6tp41"
    }, {
      "label": "syncline",
      "name": "syncline",
      "order": 0,
      "list name": "wg6ry31"
    }, {
      "label": "anticline",
      "name": "anticline",
      "order": 1,
      "list name": "wg6ry31"
    }, {
      "label": "monocline",
      "name": "monocline",
      "order": 2,
      "list name": "wg6ry31"
    }, {
      "label": "synform",
      "name": "synform",
      "order": 3,
      "list name": "wg6ry31"
    }, {
      "label": "antiform",
      "name": "antiform",
      "order": 4,
      "list name": "wg6ry31"
    }, {
      "label": "s-fold",
      "name": "s_fold",
      "order": 5,
      "list name": "wg6ry31"
    }, {
      "label": "z-fold",
      "name": "z_fold",
      "order": 6,
      "list name": "wg6ry31"
    }, {
      "label": "m-fold",
      "name": "m_fold",
      "order": 7,
      "list name": "wg6ry31"
    }, {
      "label": "sheath",
      "name": "sheath",
      "order": 8,
      "list name": "wg6ry31"
    }, {
      "label": "unknown",
      "name": "unknown",
      "order": 9,
      "list name": "wg6ry31"
    }, {
      "label": "chevron",
      "name": "chevron",
      "order": 0,
      "list name": "fa6tb91"
    }, {
      "label": "cuspate",
      "name": "cuspate",
      "order": 1,
      "list name": "fa6tb91"
    }, {
      "label": "circular",
      "name": "circular",
      "order": 2,
      "list name": "fa6tb91"
    }, {
      "label": "elliptical",
      "name": "elliptical",
      "order": 3,
      "list name": "fa6tb91"
    }, {
      "label": "unknown",
      "name": "unknown",
      "order": null,
      "list name": "fa6tb91"
    }, {
      "label": "upright",
      "name": "upright",
      "order": 0,
      "list name": "iq4bx64"
    }, {
      "label": "overturned",
      "name": "overturned",
      "order": 1,
      "list name": "iq4bx64"
    }, {
      "label": "vertical",
      "name": "vertical",
      "order": 2,
      "list name": "iq4bx64"
    }, {
      "label": "horizontal",
      "name": "horizontal",
      "order": 3,
      "list name": "iq4bx64"
    }, {
      "label": "recumbent",
      "name": "recumbent",
      "order": 4,
      "list name": "iq4bx64"
    }, {
      "label": "inclined",
      "name": "inclined",
      "order": 5,
      "list name": "iq4bx64"
    }, {
      "label": "unknown",
      "name": "unknown",
      "order": null,
      "list name": "iq4bx64"
    }, {
      "label": "gentle   (180\xB0-120\xB0)",
      "name": "gentle",
      "order": null,
      "list name": "ao3ks66"
    }, {
      "label": "open   (120\xB0-70\xB0)",
      "name": "open",
      "order": null,
      "list name": "ao3ks66"
    }, {
      "label": "close   (70\xB0-30\xB0)",
      "name": "close",
      "order": null,
      "list name": "ao3ks66"
    }, {
      "label": "tight   (30\xB0-10\xB0)",
      "name": "tight",
      "order": null,
      "list name": "ao3ks66"
    }, {
      "label": "isoclinal   (10\xB0-0\xB0)",
      "name": "isoclinal",
      "order": null,
      "list name": "ao3ks66"
    }, {
      "label": "None",
      "name": "option_9",
      "order": 0,
      "list name": "iu9ug45"
    }, {
      "label": "North",
      "name": "north",
      "order": 1,
      "list name": "iu9ug45"
    }, {
      "label": "NE",
      "name": "ne",
      "order": 2,
      "list name": "iu9ug45"
    }, {
      "label": "East",
      "name": "east",
      "order": 3,
      "list name": "iu9ug45"
    }, {
      "label": "SE",
      "name": "se",
      "order": 4,
      "list name": "iu9ug45"
    }, {
      "label": "South",
      "name": "south",
      "order": 5,
      "list name": "iu9ug45"
    }, {
      "label": "SW",
      "name": "sw",
      "order": 6,
      "list name": "iu9ug45"
    }, {
      "label": "West",
      "name": "west",
      "order": 7,
      "list name": "iu9ug45"
    }, {
      "label": "NW",
      "name": "nw",
      "order": 8,
      "list name": "iu9ug45"
    }, {
      "label": "known",
      "name": "known",
      "order": null,
      "list name": "wb5nf41"
    }, {
      "label": "approximate",
      "name": "approximate",
      "order": null,
      "list name": "wb5nf41"
    }, {
      "label": "inferred",
      "name": "inferred",
      "order": null,
      "list name": "wb5nf41"
    }, {
      "label": "questionable approximate",
      "name": "questionable_a",
      "order": null,
      "list name": "wb5nf41"
    }, {
      "label": "questionable inferred",
      "name": "questionable_i",
      "order": null,
      "list name": "wb5nf41"
    }, {
      "label": "concealed",
      "name": "concealed",
      "order": null,
      "list name": "wb5nf41"
    }, {
      "label": "sharp",
      "name": "sharp",
      "order": null,
      "list name": "rd1pp06"
    }, {
      "label": "gradational",
      "name": "gradational",
      "order": null,
      "list name": "rd1pp06"
    }, {
      "label": "chilled",
      "name": "chilled",
      "order": null,
      "list name": "rd1pp06"
    }, {
      "label": "brecciated",
      "name": "brecciated",
      "order": null,
      "list name": "rd1pp06"
    }, {
      "label": "unknown",
      "name": "unknown",
      "order": null,
      "list name": "rd1pp06"
    }];

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
        "name":"axial_planar_cleavage",
        "type":"acknowledge",
        "label":"Axial Planar Cleavage?",
        "required":"false",
        "hint":"",
        "relevant":"${planar_feature_type} = 'axial_planar_s'",
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
        "relevant":"${planar_feature_type} = 'joint'",
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
        "relevant":"${planar_feature_type} = 'fault_plane' and ${movement_justification} = 'offset'",
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
        "relevant":"${planar_feature_type} = 'shear_fracture' and ${movement_justification} = 'offset'",
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
        "relevant":"${planar_feature_type} = 'shear_zone' and ${movement_justification} = 'offset'",
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
        "relevant":"${movement_justification} = 'offset'",
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
        "relevant":"${movement_justification} = 'offset'",
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
        "relevant":"${planar_feature_type} = 'fault_plane' and ${movement_justification} = 'directional_indicator'",
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
        "relevant":"${planar_feature_type} = 'shear_fracture' and ${movement_justification} = 'directional_indicator'",
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
        "relevant":"${planar_feature_type} = 'shear_zone' and ${movement_justification} = 'directional_indicator'",
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
        "label":"Juxtaposes __________ rocks....",
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
        "label":"... against ________ rocks.",
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
        "required":"true",
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
        "name":"pencil_cleavage",
        "type":"acknowledge",
        "label":"Pencil Cleavage?",
        "required":"true",
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
        "name":"crenulation",
        "type":"acknowledge",
        "label":"Crenulation?",
        "required":"false",
        "hint":"",
        "relevant":"${linear_feature_type} = 'fold_hinge'",
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
        "name":"rock_description",
        "type":"acknowledge",
        "label":"Rock Description?",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"unit_label_abbreviation",
        "type":"text",
        "label":"Unit Label (abbreviation)",
        "required":"false",
        "hint":"",
        "relevant":"${rock_description} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"map_unit_name",
        "type":"text",
        "label":"Map Unit Name",
        "required":"false",
        "hint":"",
        "relevant":"${rock_description} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"rock_type",
        "type":"select_one rm0pv08",
        "label":"Rock Type",
        "required":"false",
        "hint":"",
        "relevant":"${rock_description} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"sediment_type",
        "type":"select_one ej6zw88",
        "label":"Sediment Type",
        "required":"false",
        "hint":"",
        "relevant":"${rock_type} = 'sediment'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"other_sediment_type",
        "type":"text",
        "label":"Other Sediment Type",
        "required":"true",
        "hint":"",
        "relevant":"${sediment_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"sedimentary_rock_type",
        "type":"select_one bt4yo56",
        "label":"Sedimentary Rock Type",
        "required":"false",
        "hint":"",
        "relevant":"${rock_type} = 'sedimentary'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"other_sedimentary_rock_type",
        "type":"text",
        "label":"Other Sedimentary Rock Type",
        "required":"true",
        "hint":"",
        "relevant":"${sedimentary_rock_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"igneous_rock_class",
        "type":"select_one nm4yc64",
        "label":"Igneous Rock Class",
        "required":"false",
        "hint":"",
        "relevant":"${rock_type} = 'igneous'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"volcanic_rock_type",
        "type":"select_one gw1hp47",
        "label":"Volcanic Rock Type",
        "required":"false",
        "hint":"",
        "relevant":"${igneous_rock_class} = 'volcanic' or ${igneous_rock_class} = 'hypabyssal'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"other_volcanic_rock_type",
        "type":"text",
        "label":"Other Volcanic Rock Type",
        "required":"true",
        "hint":"",
        "relevant":"${volcanic_rock_type} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"plutonic_rock_types",
        "type":"select_one pu9hj08",
        "label":"Plutonic Rock Types",
        "required":"false",
        "hint":"",
        "relevant":"${igneous_rock_class} = 'plutonic'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"other_plutonic_rock_type",
        "type":"text",
        "label":"Other Plutonic Rock Type",
        "required":"true",
        "hint":"",
        "relevant":"${plutonic_rock_types} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"metamorphic_rock_types",
        "type":"select_one yg0ew35",
        "label":"Metamorphic Rock Types",
        "required":"false",
        "hint":"",
        "relevant":"${rock_type} = 'metamorphic'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"other_metamorphic_rock_type",
        "type":"text",
        "label":"Other Metamorphic Rock Type",
        "required":"true",
        "hint":"",
        "relevant":"${metamorphic_rock_types} = 'other'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"description_lithology",
        "type":"note",
        "label":"Description / Lithology",
        "required":"false",
        "hint":"",
        "relevant":"${rock_description} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"absolute_age_of_geologic_unit_",
        "type":"decimal",
        "label":"Absolute Age of Geologic Unit (Ma)",
        "required":"false",
        "hint":"",
        "relevant":"${rock_description} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"eon",
        "type":"select_one fy5ep25",
        "label":"Eon",
        "required":"false",
        "hint":"",
        "relevant":"${rock_description} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"phanerozoic_era",
        "type":"select_one vz9ao44",
        "label":"Phanerozoic Era",
        "required":"false",
        "hint":"",
        "relevant":"${eon} = 'phanerozoic'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"proterozoic_era",
        "type":"select_one gr2yp07",
        "label":"Proterozoic Era",
        "required":"false",
        "hint":"",
        "relevant":"${eon} = 'proterozoic'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"archean_era",
        "type":"select_one fz38a59",
        "label":"Archean Era",
        "required":"false",
        "hint":"",
        "relevant":"${eon} = 'archean'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"cenozoic_period",
        "type":"select_one lb7hu27",
        "label":"Cenozoic Period",
        "required":"false",
        "hint":"",
        "relevant":"${phanerozoic_era} = 'cenozoic'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"mesozoic_period",
        "type":"select_one xu87d35",
        "label":"Mesozoic Period",
        "required":"false",
        "hint":"",
        "relevant":"${phanerozoic_era} = 'mesozoic'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"paleozoic_period",
        "type":"select_one vh16g23",
        "label":"Paleozoic Period",
        "required":"false",
        "hint":"",
        "relevant":"${phanerozoic_era} = 'paleozoic'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"proterozoic_and_archean_period",
        "type":"select_one yx4re06",
        "label":"Proterozoic and Archean Period",
        "required":"false",
        "hint":"",
        "relevant":"${eon} = 'proterozoic' or ${eon} = 'archean'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"quaternary_epoch",
        "type":"select_one vd9wt91",
        "label":"Quaternary Epoch",
        "required":"false",
        "hint":"",
        "relevant":"${cenozoic_period} = 'quaternary'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"neogene_epoch",
        "type":"select_one sw9pw60",
        "label":"Neogene Epoch",
        "required":"false",
        "hint":"",
        "relevant":"${cenozoic_period} = 'neogene'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"paleogene_epoch",
        "type":"select_one li0is11",
        "label":"Paleogene Epoch",
        "required":"false",
        "hint":"",
        "relevant":"${cenozoic_period} = 'paleogene'",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"age_modifier",
        "type":"select_one ns6qv42",
        "label":"Age Modifier",
        "required":"false",
        "hint":"",
        "relevant":"${rock_description} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal-compact"
      },
      {
        "name":"rock_sample",
        "type":"acknowledge",
        "label":"Rock Sample?",
        "required":"false",
        "hint":"",
        "relevant":"",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"oriented_sample",
        "type":"select_one hz9zw76",
        "label":"Oriented Sample",
        "required":"false",
        "hint":"",
        "relevant":"${rock_sample} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"sample_orientation_strike",
        "type":"integer",
        "label":"Sample Orientation Strike",
        "required":"true",
        "hint":"What's the strike of orientation mark / surface?",
        "relevant":"${oriented_sample} = 'yes'",
        "constraint":". <= 360 and . >= 0",
        "constraint_message":"Strike must be between 0-360.",
        "default":"",
        "appearance":""
      },
      {
        "name":"sample_orientation_dip",
        "type":"integer",
        "label":"Sample Orientation Dip",
        "required":"true",
        "hint":"What's the dip of orientation mark / surface?",
        "relevant":"${oriented_sample} = 'yes'",
        "constraint":". >= 0 and . <= 90",
        "constraint_message":"Dip must be between 0-90.",
        "default":"",
        "appearance":""
      },
      {
        "name":"material_type",
        "type":"select_one jq8qd30",
        "label":"Material Type",
        "required":"false",
        "hint":"",
        "relevant":"${rock_sample} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"material_details_and_other",
        "type":"note",
        "label":"Material Details and Other",
        "required":"false",
        "hint":"",
        "relevant":"${rock_sample} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"sample_size_cm",
        "type":"decimal",
        "label":"Sample Size (cm)",
        "required":"false",
        "hint":"",
        "relevant":"${rock_sample} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"main_sampling_purpose",
        "type":"select_one to0mv13",
        "label":"Main Sampling Purpose",
        "required":"false",
        "hint":"",
        "relevant":"${rock_sample} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":"horizontal"
      },
      {
        "name":"sample_description",
        "type":"note",
        "label":"Sample Description",
        "required":"false",
        "hint":"",
        "relevant":"${rock_sample} != ''",
        "constraint":"",
        "constraint_message":"",
        "default":"",
        "appearance":""
      },
      {
        "name":"inferred_age_of_sample_ma",
        "type":"decimal",
        "label":"Inferred Age of Sample (Ma)",
        "required":"false",
        "hint":"",
        "relevant":"${rock_sample} != ''",
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
        "name":"axial_planar_s",
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
        "label":"edge of mapping",
        "name":"edge_of_mappin",
        "list name":"lx9ax28",
        "order":4
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
        "order":5
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
        "label":"oblique",
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
        "name":"offset",
        "list name":"kt81l04",
        "order":1
      },
      {
        "label":"directional indicators",
        "name":"directional_indicator",
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
        "name":"metamorphic_fo",
        "list name":"gs8tm04",
        "order":null
      },
      {
        "label":"compositional banding",
        "name":"compositional_",
        "list name":"gs8tm04",
        "order":null
      },
      {
        "label":"geomorphic feature",
        "name":"geomorphic_fea",
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
        "name":"metamorphic_fo",
        "list name":"td6dh37",
        "order":null
      },
      {
        "label":"compositional banding",
        "name":"compositional_",
        "list name":"td6dh37",
        "order":null
      },
      {
        "label":"geomorphic feature",
        "name":"geomorphic_fea",
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
        "name":"metamorphic_foliation",
        "list name":"uh1mv47",
        "order":3
      },
      {
        "label":"compositional banding",
        "name":"compositional_banding",
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
        "label":"Riedel Shear",
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
        "name":"crescentic_fra",
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
        "name":"oblique_gouge_",
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
        "name":"asymmetric_fol",
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
        "label":"Riedel Shear",
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
        "name":"crescentic_fra",
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
        "name":"oblique_gouge_",
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
        "name":"asymmetric_fol",
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
        "name":"asymmetric_folds",
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
        "name":"rotated_porphyroblasts",
        "list name":"xd2fb20",
        "order":7
      },
      {
        "label":"delta porphyroclasts",
        "name":"delta_porphyroclasts",
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
        "name":"this_is_a_list",
        "list name":"fq8rt60",
        "order":1
      },
      {
        "label":"More in the list of rock units / descriptions user has made",
        "name":"more_in_the_li",
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
        "name":"this_is_a_list",
        "list name":"kw6tp41",
        "order":1
      },
      {
        "label":"More in the list of rock units / descriptions user has made",
        "name":"more_in_the_li",
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
        "label":"assymetric folds",
        "name":"assymetric_fol",
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
        "label":"centimeter",
        "name":"centimeter_sca",
        "list name":"zq9sr00",
        "order":null
      },
      {
        "label":"meter",
        "name":"meter_scale",
        "list name":"zq9sr00",
        "order":null
      },
      {
        "label":"kilometer",
        "name":"kilometer_scal",
        "list name":"zq9sr00",
        "order":null
      },
      {
        "label":"syncline",
        "name":"syncline",
        "list name":"wg6ry31",
        "order":0
      },
      {
        "label":"anticline",
        "name":"anticline",
        "list name":"wg6ry31",
        "order":1
      },
      {
        "label":"synform",
        "name":"synform",
        "list name":"wg6ry31",
        "order":2
      },
      {
        "label":"antiform",
        "name":"antiform",
        "list name":"wg6ry31",
        "order":3
      },
      {
        "label":"monocline",
        "name":"monocline",
        "list name":"wg6ry31",
        "order":4
      },
      {
        "label":"s-fold",
        "name":"s_fold",
        "list name":"wg6ry31",
        "order":5
      },
      {
        "label":"z-fold",
        "name":"z_fold",
        "list name":"wg6ry31",
        "order":6
      },
      {
        "label":"m-fold",
        "name":"m_fold",
        "list name":"wg6ry31",
        "order":7
      },
      {
        "label":"sheath",
        "name":"sheath",
        "list name":"wg6ry31",
        "order":8
      },
      {
        "label":"unknown",
        "name":"unknown",
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
        "label":"unknown",
        "name":"unknown",
        "list name":"fa6tb91",
        "order":null
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
        "label":"unknown",
        "name":"unknown",
        "list name":"iq4bx64",
        "order":null
      },
      {
        "label":"gentle   (180� �120�)",
        "name":"gentle",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"open   (120��70�)",
        "name":"open",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"close   (70��30�)",
        "name":"close",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"tight   (30��10�)",
        "name":"tight",
        "list name":"ao3ks66",
        "order":null
      },
      {
        "label":"isoclinal   (10��0�)",
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
      },
      {
        "label":"igneous",
        "name":"igneous",
        "list name":"rm0pv08",
        "order":0
      },
      {
        "label":"metamorphic",
        "name":"metamorphic",
        "list name":"rm0pv08",
        "order":1
      },
      {
        "label":"sedimentary",
        "name":"sedimentary",
        "list name":"rm0pv08",
        "order":2
      },
      {
        "label":"sediment",
        "name":"sediment",
        "list name":"rm0pv08",
        "order":3
      },
      {
        "label":"alluvium",
        "name":"alluvium",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"older alluvium",
        "name":"older_alluvium",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"colluvium",
        "name":"colluvium",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"lake deposit",
        "name":"lake_deposit",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"eolian",
        "name":"eolian",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"talus",
        "name":"talus",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"breccia",
        "name":"breccia",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"gravel",
        "name":"gravel",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"sand",
        "name":"sand",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"silt",
        "name":"silt",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"clay",
        "name":"clay",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"other",
        "name":"other",
        "list name":"ej6zw88",
        "order":null
      },
      {
        "label":"limestone",
        "name":"limestone",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"dolostone",
        "name":"dolostone",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"travertine",
        "name":"travertine",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"evaporite",
        "name":"evaporite",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"chert",
        "name":"chert",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"conglomerate",
        "name":"conglomerate",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"breccia",
        "name":"breccia",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"sandstone",
        "name":"sandstone",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"siltstone",
        "name":"siltstone",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"mudstone",
        "name":"mudstone",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"shale",
        "name":"shale",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"claystone",
        "name":"claystone",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"coal",
        "name":"coal",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"other",
        "name":"other",
        "list name":"bt4yo56",
        "order":null
      },
      {
        "label":"volcanic",
        "name":"volcanic",
        "list name":"nm4yc64",
        "order":null
      },
      {
        "label":"plutonic",
        "name":"plutonic",
        "list name":"nm4yc64",
        "order":null
      },
      {
        "label":"hypabyssal",
        "name":"hypabyssal",
        "list name":"nm4yc64",
        "order":null
      },
      {
        "label":"basalt",
        "name":"basalt",
        "list name":"gw1hp47",
        "order":0
      },
      {
        "label":"basaltic-andesite",
        "name":"basaltic_andes",
        "list name":"gw1hp47",
        "order":1
      },
      {
        "label":"andesite",
        "name":"andesite",
        "list name":"gw1hp47",
        "order":2
      },
      {
        "label":"latite",
        "name":"latite",
        "list name":"gw1hp47",
        "order":3
      },
      {
        "label":"dacite",
        "name":"dacite",
        "list name":"gw1hp47",
        "order":4
      },
      {
        "label":"rhyolite",
        "name":"rhyolite",
        "list name":"gw1hp47",
        "order":5
      },
      {
        "label":"tuff",
        "name":"tuff",
        "list name":"gw1hp47",
        "order":6
      },
      {
        "label":"ash-fall tuff",
        "name":"ash_fall_tuff",
        "list name":"gw1hp47",
        "order":7
      },
      {
        "label":"ash-flow tuff",
        "name":"ash_flow_tuff",
        "list name":"gw1hp47",
        "order":8
      },
      {
        "label":"vitrophyre",
        "name":"vitrophyre",
        "list name":"gw1hp47",
        "order":10
      },
      {
        "label":"trachyte",
        "name":"trachyte",
        "list name":"gw1hp47",
        "order":11
      },
      {
        "label":"trachyandesite",
        "name":"trachyandesite",
        "list name":"gw1hp47",
        "order":12
      },
      {
        "label":"tuff breccia",
        "name":"tuff_breccia",
        "list name":"gw1hp47",
        "order":13
      },
      {
        "label":"lapilli tuff",
        "name":"lapilli_tuff",
        "list name":"gw1hp47",
        "order":14
      },
      {
        "label":"other",
        "name":"other",
        "list name":"gw1hp47",
        "order":15
      },
      {
        "label":"granite",
        "name":"granite",
        "list name":"pu9hj08",
        "order":0
      },
      {
        "label":"alkali feldspar granite",
        "name":"alkali_feldspa",
        "list name":"pu9hj08",
        "order":1
      },
      {
        "label":"quartz monzonite",
        "name":"quartz_monzoni",
        "list name":"pu9hj08",
        "order":2
      },
      {
        "label":"syenite",
        "name":"syenite",
        "list name":"pu9hj08",
        "order":3
      },
      {
        "label":"granodiorite",
        "name":"granodiorite",
        "list name":"pu9hj08",
        "order":4
      },
      {
        "label":"monzonite",
        "name":"monzonite",
        "list name":"pu9hj08",
        "order":5
      },
      {
        "label":"tonalite",
        "name":"tonalite",
        "list name":"pu9hj08",
        "order":6
      },
      {
        "label":"diorite",
        "name":"diorite",
        "list name":"pu9hj08",
        "order":7
      },
      {
        "label":"gabbro",
        "name":"gabbro",
        "list name":"pu9hj08",
        "order":9
      },
      {
        "label":"anorthosite",
        "name":"anorthosite",
        "list name":"pu9hj08",
        "order":10
      },
      {
        "label":"other",
        "name":"other",
        "list name":"pu9hj08",
        "order":15
      },
      {
        "label":"low-grade",
        "name":"low_grade",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"medium-grade",
        "name":"medium_grade",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"high-grade",
        "name":"high_grade",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"slate",
        "name":"slate",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"phyllite",
        "name":"phyllite",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"schist",
        "name":"schist",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"gneiss",
        "name":"gneiss",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"marble",
        "name":"marble",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"quartzite",
        "name":"quartzite",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"amphibolite",
        "name":"amphibolite",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"serpentinite",
        "name":"serpentinite",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"hornfels",
        "name":"hornfels",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"metavolcanic",
        "name":"metavolcanic",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"calc-silicate",
        "name":"calc_silicate",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"mylonite",
        "name":"mylonite",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"other",
        "name":"other",
        "list name":"yg0ew35",
        "order":null
      },
      {
        "label":"Phanerozoic",
        "name":"phanerozoic",
        "list name":"fy5ep25",
        "order":null
      },
      {
        "label":"Proterozoic",
        "name":"proterozoic",
        "list name":"fy5ep25",
        "order":null
      },
      {
        "label":"Archean",
        "name":"archean",
        "list name":"fy5ep25",
        "order":null
      },
      {
        "label":"Hadean",
        "name":"hadean",
        "list name":"fy5ep25",
        "order":null
      },
      {
        "label":"Cenozoic",
        "name":"cenozoic",
        "list name":"vz9ao44",
        "order":null
      },
      {
        "label":"Mesozoic",
        "name":"mesozoic",
        "list name":"vz9ao44",
        "order":null
      },
      {
        "label":"Paleozoic",
        "name":"paleozoic",
        "list name":"vz9ao44",
        "order":null
      },
      {
        "label":"Neoproterozoic",
        "name":"neoproterozoic",
        "list name":"gr2yp07",
        "order":null
      },
      {
        "label":"Mesoproterozoic",
        "name":"mesoproterozoi",
        "list name":"gr2yp07",
        "order":null
      },
      {
        "label":"Paleoproterozoic",
        "name":"paleoproterozo",
        "list name":"gr2yp07",
        "order":null
      },
      {
        "label":"Neoarchean",
        "name":"neoarchean",
        "list name":"fz38a59",
        "order":null
      },
      {
        "label":"Mesoarchean",
        "name":"mesoarchean",
        "list name":"fz38a59",
        "order":null
      },
      {
        "label":"Paleoarchean",
        "name":"paleoarchean",
        "list name":"fz38a59",
        "order":null
      },
      {
        "label":"Eoarchean",
        "name":"eoarchean",
        "list name":"fz38a59",
        "order":null
      },
      {
        "label":"Quaternary",
        "name":"quaternary",
        "list name":"lb7hu27",
        "order":null
      },
      {
        "label":"Neogene",
        "name":"neogene",
        "list name":"lb7hu27",
        "order":null
      },
      {
        "label":"Paleogene",
        "name":"paleogene",
        "list name":"lb7hu27",
        "order":null
      },
      {
        "label":"Cretaceous",
        "name":"cretaceous",
        "list name":"xu87d35",
        "order":null
      },
      {
        "label":"Jurassic",
        "name":"jurassic",
        "list name":"xu87d35",
        "order":null
      },
      {
        "label":"Triassic",
        "name":"triassic",
        "list name":"xu87d35",
        "order":null
      },
      {
        "label":"Permian",
        "name":"permian",
        "list name":"vh16g23",
        "order":null
      },
      {
        "label":"Carboniferous",
        "name":"carboniferous",
        "list name":"vh16g23",
        "order":null
      },
      {
        "label":"Pennsylvanian",
        "name":"pennsylvanian",
        "list name":"vh16g23",
        "order":null
      },
      {
        "label":"Mississippian",
        "name":"mississippian",
        "list name":"vh16g23",
        "order":null
      },
      {
        "label":"Devonian",
        "name":"devonian",
        "list name":"vh16g23",
        "order":null
      },
      {
        "label":"Silurian",
        "name":"silurian",
        "list name":"vh16g23",
        "order":null
      },
      {
        "label":"Ordovician",
        "name":"ordovician",
        "list name":"vh16g23",
        "order":null
      },
      {
        "label":"Cambrian",
        "name":"cambrian",
        "list name":"vh16g23",
        "order":null
      },
      {
        "label":"Ediacaran",
        "name":"ediacaran",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Crygenian",
        "name":"crygenian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Tonian",
        "name":"tonian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Stenian",
        "name":"stenian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Ectasian",
        "name":"ectasian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Calymmian",
        "name":"calymmian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Statherian",
        "name":"statherian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Orosirian",
        "name":"orosirian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Rhyacian",
        "name":"rhyacian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"SIderian",
        "name":"siderian",
        "list name":"yx4re06",
        "order":null
      },
      {
        "label":"Holocene",
        "name":"holocene",
        "list name":"vd9wt91",
        "order":null
      },
      {
        "label":"Pleistocene",
        "name":"pleistocene",
        "list name":"vd9wt91",
        "order":null
      },
      {
        "label":"Pliocene",
        "name":"pliocene",
        "list name":"sw9pw60",
        "order":0
      },
      {
        "label":"Miocene",
        "name":"miocene",
        "list name":"sw9pw60",
        "order":1
      },
      {
        "label":"Oligocene",
        "name":"oligocene",
        "list name":"li0is11",
        "order":null
      },
      {
        "label":"Eocene",
        "name":"eocene",
        "list name":"li0is11",
        "order":null
      },
      {
        "label":"Paleocene",
        "name":"paleocene",
        "list name":"li0is11",
        "order":null
      },
      {
        "label":"Late",
        "name":"late",
        "list name":"ns6qv42",
        "order":null
      },
      {
        "label":"Middle",
        "name":"middle",
        "list name":"ns6qv42",
        "order":null
      },
      {
        "label":"Early",
        "name":"early",
        "list name":"ns6qv42",
        "order":null
      },
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

    factory.contact_survey = [
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
    ];

    factory.contact_choices = [
      {
        "label": "depositional",
        "name": "depositional",
        "order": "0",
        "list name": "lx9ax28"
      },
      {
        "label": "intrusive",
        "name": "intrusive",
        "order": "1",
        "list name": "lx9ax28"
      },
      {
        "label": "metamorphic",
        "name": "metamorphic",
        "order": "2",
        "list name": "lx9ax28"
      },
      {
        "label": "marker layer",
        "name": "marker_layer",
        "order": "3",
        "list name": "lx9ax28"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "order": "4",
        "list name": "lx9ax28"
      },
      {
        "label": "edge of mapping",
        "name": "edge_of_mappin",
        "order": "5",
        "list name": "lx9ax28"
      },
      {
        "label": "other",
        "name": "other",
        "order": "6",
        "list name": "lx9ax28"
      },
      {
        "label": "stratigraphic",
        "name": "stratigraphic",
        "order": "0",
        "list name": "bi4sw60"
      },
      {
        "label": "alluvial",
        "name": "alluvial",
        "order": "1",
        "list name": "bi4sw60"
      },
      {
        "label": "unconformity",
        "name": "unconformity",
        "order": "2",
        "list name": "bi4sw60"
      },
      {
        "label": "volcanic",
        "name": "volcanic",
        "order": "3",
        "list name": "bi4sw60"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "order": "4",
        "list name": "bi4sw60"
      },
      {
        "label": "angular unconformity",
        "name": "angular_unconf",
        "order": "",
        "list name": "dq27t21"
      },
      {
        "label": "nonconformity",
        "name": "nonconformity",
        "order": "",
        "list name": "dq27t21"
      },
      {
        "label": "disconformity",
        "name": "disconformity",
        "order": "",
        "list name": "dq27t21"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "order": "",
        "list name": "dq27t21"
      },
      {
        "label": "dike (cuts fabric)",
        "name": "dike",
        "order": "0",
        "list name": "cj4zw02"
      },
      {
        "label": "sill (conforms to fabric)",
        "name": "sill",
        "order": "1",
        "list name": "cj4zw02"
      },
      {
        "label": "vein",
        "name": "vein",
        "order": "2",
        "list name": "cj4zw02"
      },
      {
        "label": "injectite",
        "name": "injectite",
        "order": "3",
        "list name": "cj4zw02"
      },
      {
        "label": "pluton",
        "name": "pluton",
        "order": "4",
        "list name": "cj4zw02"
      },
      {
        "label": "migmatite",
        "name": "migmatite",
        "order": "",
        "list name": "cj4zw02"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "order": "",
        "list name": "cj4zw02"
      },
      {
        "label": "between two different metamorphic rocks",
        "name": "between_two_di",
        "order": "0",
        "list name": "pb5wo52"
      },
      {
        "label": "isograd",
        "name": "isograd",
        "order": "2",
        "list name": "pb5wo52"
      },
      {
        "label": "other",
        "name": "other",
        "order": "",
        "list name": "pb5wo52"
      },
      {
        "label": "sharp",
        "name": "sharp",
        "order": "0",
        "list name": "vv9tu90"
      },
      {
        "label": "gradational",
        "name": "gradational",
        "order": "1",
        "list name": "vv9tu90"
      },
      {
        "label": "diffuse",
        "name": "diffuse",
        "order": "2",
        "list name": "vv9tu90"
      },
      {
        "label": "chilled",
        "name": "chilled",
        "order": "3",
        "list name": "vv9tu90"
      },
      {
        "label": "brecciated",
        "name": "brecciated",
        "order": "4",
        "list name": "vv9tu90"
      },
      {
        "label": "sheared",
        "name": "sheared",
        "order": "5",
        "list name": "vv9tu90"
      }
    ];

    factory.fault_survey = [
      {
        "name": "thickness_m",
        "type": "integer",
        "label": "Thickness (m)",
        "hint": "What is the thickness of this fault in meters?",
        "required": "true",
        "default": "not_specified",
        "constraint": ". >= 0",
        "constraint_message": "Thickness must be greater than 0.",
        "relevant": ""
      },
      {
        "name": "strike_of_fault",
        "type": "integer",
        "label": "Strike of Fault",
        "hint": "",
        "required": "true",
        "default": "",
        "constraint": ". <= 360 and . >= 0",
        "constraint_message": "Strike must be between 0-360.",
        "relevant": ""
      },
      {
        "name": "dip_of_fault",
        "type": "integer",
        "label": "Dip of Fault",
        "hint": "",
        "required": "true",
        "default": "",
        "constraint": ". >= 0 and . <= 90",
        "constraint_message": "Dip must be between 0-90.",
        "relevant": ""
      },
      {
        "name": "fault_geometry",
        "type": "select_one ku2gk10",
        "label": "Type of Fault",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": ""
      },
      {
        "name": "strike_slip_movement",
        "type": "select_one ww1yf84",
        "label": "Strike-Slip Movement",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": "${fault_geometry} = 'strike_slip'"
      },
      {
        "name": "dip_slip_movement",
        "type": "select_one dr9xt23",
        "label": "Dip-Slip Movement",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": "${fault_geometry} = 'dip_slip'"
      },
      {
        "name": "oblique_movement",
        "type": "select_one os1df47",
        "label": "Oblique Movement",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": "${fault_geometry} = 'oblique'"
      },
      {
        "name": "movement_justification",
        "type": "select_one kt81l04",
        "label": "Movement Justification",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": "${strike_slip_movement} = 'dextral' or ${strike_slip_movement} = 'sinistral' or ${dip_slip_movement} = 'reverse' or ${dip_slip_movement} = 'normal' or ${oblique_movement} = 'dextral_reverse' or ${oblique_movement} = 'dextral_normal' or ${oblique_movement} = 'sinistral_reverse' or ${oblique_movement} = 'sinistral_normal'"
      },
      {
        "name": "offset_markers",
        "type": "select_multiple uh1mv47",
        "label": "Offset Markers",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": "${movement_justification} = 'offset'"
      },
      {
        "name": "marker_detail",
        "type": "text",
        "label": "Marker Detail",
        "hint": "",
        "required": "true",
        "default": "not specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": "selected(${offset_markers}, 'geomorphic_feature') or selected(${offset_markers}, 'other_marker')"
      },
      {
        "name": "directional_indicators",
        "type": "select_multiple xd2fb20",
        "label": "Directional Indicators",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": "${movement_justification} = 'directional_indicator'"
      },
      {
        "name": "feature_asymmetry_detail",
        "type": "text",
        "label": "Asymmetry Details",
        "hint": "porphyroblast/clast, folds, mica fish, etc",
        "required": "true",
        "default": "",
        "constraint": "",
        "constraint_message": "",
        "relevant": "selected(${directional_indicators}, 'shear_sense')"
      },
      {
        "name": "piercing_point_detail",
        "type": "text",
        "label": "Piercing Point Detail",
        "hint": "Specify piercing point.",
        "required": "true",
        "default": "",
        "constraint": "",
        "constraint_message": "",
        "relevant": "selected(${directional_indicators}, 'piercing_point')"
      },
      {
        "name": "mineral_lineation_detail",
        "type": "text",
        "label": "Mineral Lineation Detail",
        "hint": "What is the mineral?",
        "required": "false",
        "default": "",
        "constraint": "",
        "constraint_message": "",
        "relevant": "selected(${directional_indicators}, 'mineral_lineat')"
      },
      {
        "name": "juxtaposes_rocks",
        "type": "select_multiple fq8rt60",
        "label": "Juxtaposes __________ rocks....",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": ""
      },
      {
        "name": "against_rocks",
        "type": "select_multiple kw6tp41",
        "label": "... against ________ rocks.",
        "hint": "",
        "required": "true",
        "default": "not_specified",
        "constraint": "",
        "constraint_message": "",
        "relevant": ""
      },
      {
        "name": "inferred_age_of_faulting_ma",
        "type": "integer",
        "label": "Inferred Age (Ma) of Faulting",
        "hint": "",
        "required": "false",
        "default": "",
        "constraint": "",
        "constraint_message": "",
        "relevant": ""
      },
      {
        "name": "start",
        "type": "start",
        "label": "",
        "hint": "",
        "required": "",
        "default": "",
        "constraint": "",
        "constraint_message": "",
        "relevant": ""
      },
      {
        "name": "end",
        "type": "end",
        "label": "",
        "hint": "",
        "required": "",
        "default": "",
        "constraint": "",
        "constraint_message": "",
        "relevant": ""
      }
    ];

    factory.fault_choices = [
      {
        "label": "strike-slip",
        "name": "strike_slip",
        "list name": "ku2gk10"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "ku2gk10"
      },
      {
        "label": "dip-slip",
        "name": "dip_slip",
        "list name": "ku2gk10"
      },
      {
        "label": "oblique",
        "name": "oblique",
        "list name": "ku2gk10"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "ku2gk10"
      },
      {
        "label": "dextral",
        "name": "dextral",
        "list name": "ww1yf84"
      },
      {
        "label": "sinistral",
        "name": "sinistral",
        "list name": "ww1yf84"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "ww1yf84"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "ww1yf84"
      },
      {
        "label": "reverse",
        "name": "reverse",
        "list name": "dr9xt23"
      },
      {
        "label": "normal",
        "name": "normal",
        "list name": "dr9xt23"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "dr9xt23"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "dr9xt23"
      },
      {
        "label": "dextral reverse",
        "name": "dextral_reverse",
        "list name": "os1df47"
      },
      {
        "label": "dextral normal",
        "name": "dextral_normal",
        "list name": "os1df47"
      },
      {
        "label": "sinistral reverse",
        "name": "sinistral_reverse",
        "list name": "os1df47"
      },
      {
        "label": "sinistral normal",
        "name": "sinistral_normal",
        "list name": "os1df47"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "os1df47"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "os1df47"
      },
      {
        "label": "offset",
        "name": "offset",
        "list name": "kt81l04"
      },
      {
        "label": "directional indicators",
        "name": "directional_indicator",
        "list name": "kt81l04"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "kt81l04"
      },
      {
        "label": "bedding",
        "name": "bedding",
        "list name": "uh1mv47"
      },
      {
        "label": "intrusion",
        "name": "intrusion",
        "list name": "uh1mv47"
      },
      {
        "label": "metamorphic foliation",
        "name": "metamorphic_foliation",
        "list name": "uh1mv47"
      },
      {
        "label": "compositional banding",
        "name": "compositional_banding",
        "list name": "uh1mv47"
      },
      {
        "label": "geomorphic feature",
        "name": "geomorphic_feature",
        "list name": "uh1mv47"
      },
      {
        "label": "other marker",
        "name": "other_marker",
        "list name": "uh1mv47"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "uh1mv47"
      },
      {
        "label": "mineral lineation",
        "name": "mineral_lineat",
        "list name": "xd2fb20"
      },
      {
        "label": "piercing point",
        "name": "piercing_point",
        "list name": "xd2fb20"
      },
      {
        "label": "feature asymmetry",
        "name": "shear_sense",
        "list name": "xd2fb20"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "xd2fb20"
      },
      {
        "label": "This is a list of rock units / descriptions user has made",
        "name": "this_is_a_list",
        "list name": "fq8rt60"
      },
      {
        "label": "More in the list of rock units / descriptions user has made",
        "name": "more_in_the_li",
        "list name": "fq8rt60"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "fq8rt60"
      },
      {
        "label": "This is a list of rock units / descriptions user has made",
        "name": "this_is_a_list",
        "list name": "kw6tp41"
      },
      {
        "label": "More in the list of rock units / descriptions user has made",
        "name": "more_in_the_li",
        "list name": "kw6tp41"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "kw6tp41"
      }
    ];

    factory.fold_survey = [
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
    ];

    factory.fold_choices = [
      {
        "label": "centimeter-scale",
        "name": "centimeter_sca",
        "list name": "zq9sr00",
        "order": ""
      },
      {
        "label": "meter-scale",
        "name": "meter_scale",
        "list name": "zq9sr00",
        "order": ""
      },
      {
        "label": "kilometer-scale",
        "name": "kilometer_scal",
        "list name": "zq9sr00",
        "order": ""
      },
      {
        "label": "synform",
        "name": "synform",
        "list name": "wg6ry31",
        "order": ""
      },
      {
        "label": "antiform",
        "name": "antiform",
        "list name": "wg6ry31",
        "order": ""
      },
      {
        "label": "monocline",
        "name": "monocline",
        "list name": "wg6ry31",
        "order": ""
      },
      {
        "label": "s-fold",
        "name": "s_fold",
        "list name": "wg6ry31",
        "order": ""
      },
      {
        "label": "z-fold",
        "name": "z_fold",
        "list name": "wg6ry31",
        "order": ""
      },
      {
        "label": "m-fold",
        "name": "m_fold",
        "list name": "wg6ry31",
        "order": ""
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "wg6ry31",
        "order": ""
      },
      {
        "label": "chevron",
        "name": "chevron",
        "list name": "fa6tb91",
        "order": "0"
      },
      {
        "label": "cuspate",
        "name": "cuspate",
        "list name": "fa6tb91",
        "order": "1"
      },
      {
        "label": "circular",
        "name": "circular",
        "list name": "fa6tb91",
        "order": "2"
      },
      {
        "label": "elliptical",
        "name": "elliptical",
        "list name": "fa6tb91",
        "order": "3"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "fa6tb91",
        "order": ""
      },
      {
        "label": "upright",
        "name": "upright",
        "list name": "iq4bx64",
        "order": "0"
      },
      {
        "label": "overturned",
        "name": "overturned",
        "list name": "iq4bx64",
        "order": "1"
      },
      {
        "label": "vertical",
        "name": "vertical",
        "list name": "iq4bx64",
        "order": "2"
      },
      {
        "label": "horizontal",
        "name": "horizontal",
        "list name": "iq4bx64",
        "order": "3"
      },
      {
        "label": "recumbent",
        "name": "recumbent",
        "list name": "iq4bx64",
        "order": "4"
      },
      {
        "label": "inclined",
        "name": "inclined",
        "list name": "iq4bx64",
        "order": "5"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "iq4bx64",
        "order": ""
      },
      {
        "label": "gentle   (180\xB0-120\xB0)",
        "name": "gentle",
        "list name": "ao3ks66",
        "order": ""
      },
      {
        "label": "open   (120\xB0-70\xB0)",
        "name": "open",
        "list name": "ao3ks66",
        "order": ""
      },
      {
        "label": "close   (70\xB0-30\xB0)",
        "name": "close",
        "list name": "ao3ks66",
        "order": ""
      },
      {
        "label": "tight   (30\xB0-10\xB0)",
        "name": "tight",
        "list name": "ao3ks66",
        "order": ""
      },
      {
        "label": "isoclinal   (10\xB0-0\xB0)",
        "name": "isoclinal",
        "list name": "ao3ks66",
        "order": ""
      },
      {
        "label": "North",
        "name": "north",
        "list name": "iu9ug45",
        "order": "1"
      },
      {
        "label": "NNE",
        "name": "nne",
        "list name": "iu9ug45",
        "order": "2"
      },
      {
        "label": "NE",
        "name": "ne",
        "list name": "iu9ug45",
        "order": "3"
      },
      {
        "label": "ENE",
        "name": "ene",
        "list name": "iu9ug45",
        "order": "4"
      },
      {
        "label": "East",
        "name": "east",
        "list name": "iu9ug45",
        "order": "5"
      },
      {
        "label": "ESE",
        "name": "ese",
        "list name": "iu9ug45",
        "order": "6"
      },
      {
        "label": "SE",
        "name": "se",
        "list name": "iu9ug45",
        "order": "7"
      },
      {
        "label": "SSE",
        "name": "sse",
        "list name": "iu9ug45",
        "order": "8"
      },
      {
        "label": "South",
        "name": "south",
        "list name": "iu9ug45",
        "order": "9"
      },
      {
        "label": "SSW",
        "name": "ssw",
        "list name": "iu9ug45",
        "order": "10"
      },
      {
        "label": "SW",
        "name": "sw",
        "list name": "iu9ug45",
        "order": "11"
      },
      {
        "label": "WSW",
        "name": "wsw",
        "list name": "iu9ug45",
        "order": "12"
      },
      {
        "label": "West",
        "name": "west",
        "list name": "iu9ug45",
        "order": "13"
      },
      {
        "label": "WNW",
        "name": "wnw",
        "list name": "iu9ug45",
        "order": "14"
      },
      {
        "label": "NW",
        "name": "nw",
        "list name": "iu9ug45",
        "order": "15"
      },
      {
        "label": "NNW",
        "name": "nnw",
        "list name": "iu9ug45",
        "order": "16"
      }
    ];

    factory.orientation_survey = [
      {
        "name": "feature_type",
        "type": "select_one ll25x57",
        "label": "Feature Type",
        "required": "true",
        "default": "bedding",
        "relevant": "",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "other_feature_type",
        "type": "text",
        "label": "Other Feature Type",
        "required": "true",
        "default": "",
        "relevant": "${feature_type} = 'other'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "feature_geometry",
        "type": "select_one du3mh76",
        "label": "Feature Geometry",
        "required": "true",
        "default": "",
        "relevant": "${other_feature_type} != ''",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "strike",
        "type": "integer",
        "label": "Strike",
        "required": "true",
        "default": "",
        "relevant": "${feature_type} = 'bedding' or ${feature_type} = 'flow_layering' or ${feature_type} = 'foliation' or ${feature_type} = 'joint' or ${feature_type} = 'fracture' or ${feature_type} = 'fault_plane' or ${feature_type} = 'axial_surface' or ${feature_type} = 'stylolite' or ${feature_type} = 'bedding' or ${feature_type} = 'shear_zone' or ${feature_type} = 'cleavage' or ${feature_type} = 'striated_surface' or ${feature_type} = 'fold_limb' or ${feature_geometry} = 'plane' or ${feature_type} = 'contact'",
        "hint": "Azimuth in degrees",
        "constraint": ". >= 0 and . <= 360",
        "constraint_message": "Strike must be between 0-360."
      },
      {
        "name": "dip",
        "type": "integer",
        "label": "Dip",
        "required": "true",
        "default": "",
        "relevant": "${feature_type} = 'bedding' or ${feature_type} = 'flow_layering' or ${feature_type} = 'foliation' or ${feature_type} = 'joint' or ${feature_type} = 'fracture' or ${feature_type} = 'axial_surface' or ${feature_type} = 'stylolite' or ${feature_type} = 'fault_plane' or ${feature_type} = 'cleavage' or ${feature_type} = 'shear_zone' or ${feature_type} = 'striated_surface' or ${feature_type} = 'fold_limb' or ${feature_geometry} = 'plane' or ${feature_type} = 'contact'",
        "hint": "",
        "constraint": ". >= 0 and . <= 90",
        "constraint_message": "Dip must be between 0-90."
      },
      {
        "name": "trend",
        "type": "integer",
        "label": "Trend",
        "required": "true",
        "default": "",
        "relevant": "${feature_type} = 'fold_hinge' or ${feature_type} = 'lineation' or ${feature_type} = 'striation' or ${feature_type} = 'direction' or ${feature_type} = 'vector' or ${feature_geometry} = 'line'",
        "hint": "Azimuth in degrees",
        "constraint": ". >= 0 and . <= 360",
        "constraint_message": "Trend must be between 0-360."
      },
      {
        "name": "plunge",
        "type": "integer",
        "label": "Plunge",
        "required": "true",
        "default": "",
        "relevant": "${feature_type} = 'fold_hinge' or ${feature_type} = 'lineation' or ${feature_type} = 'striation' or ${feature_type} = 'direction' or ${feature_type} = 'vector' or ${feature_geometry} = 'line'",
        "hint": "",
        "constraint": ". >= 0 and . <= 90",
        "constraint_message": "Plunge must be between 0-90."
      },
      {
        "name": "vector_magnitude",
        "type": "integer",
        "label": "Vector Magnitude",
        "required": "true",
        "default": "",
        "relevant": "${feature_type} = 'vector'",
        "hint": "",
        "constraint": ". > 0",
        "constraint_message": "Vector Magnitude must be greater than 0."
      },
      {
        "name": "vector_magnitude_units",
        "type": "text",
        "label": "Vector Magnitude Units",
        "required": "true",
        "default": "",
        "relevant": "${feature_type} = 'vector'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "plane_facing",
        "type": "select_one to1en66",
        "label": "Plane Facing",
        "required": "false",
        "default": "not_specified",
        "relevant": "${feature_type} = 'bedding' or ${feature_type} = 'axial_surface' or ${feature_type} = 'fold_limb'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "facing_direction",
        "type": "text",
        "label": "Facing Direction",
        "required": "false",
        "default": "",
        "relevant": "${plane_facing} = 'vertical'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "directed",
        "type": "select_one kn36u14",
        "label": "Directed",
        "required": "false",
        "default": "",
        "relevant": "${feature_type} = 'fold_hinge' or ${feature_type} = 'lineation' or ${feature_type} = 'striation'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "evidence_of_asymmetry",
        "type": "text",
        "label": "Evidence of Asymmetry",
        "required": "true",
        "default": "",
        "relevant": "${directed} = 'yes'",
        "hint": "Explain the sense of shear or vergence.",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "fold_type",
        "type": "select_one oa9ot58",
        "label": "Fold Type",
        "required": "false",
        "default": "not_specified",
        "relevant": "${feature_type} = 'fold_hinge' or ${feature_type} = 'axial_surface'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "fold_detail",
        "type": "select_one eu4ay01",
        "label": "Fold Attitude",
        "required": "false",
        "default": "not_specified",
        "relevant": "${feature_type} = 'fold_hinge' or ${feature_type} = 'axial_surface'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "orientation_quality",
        "type": "select_one gl2mf38",
        "label": "Orientation Quality",
        "required": "true",
        "default": "accurate",
        "relevant": "",
        "hint": "How accurate is the measurement? Irregular means the feature is curviplanar.",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "measurement_quality",
        "type": "select_one xn9nf56",
        "label": "Measurement Quality",
        "required": "false",
        "default": "",
        "relevant": "${strike} != '' or ${trend} != '' or ${dip} != '' or ${plunge} != ''",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "foliation_type",
        "type": "select_one vn7df87",
        "label": "Foliation Type",
        "required": "false",
        "default": "not_specified",
        "relevant": "${feature_type} = 'foliation'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "cleavage_type",
        "type": "select_one dr5ab45",
        "label": "Cleavage Type",
        "required": "false",
        "default": "not_specified",
        "relevant": "${foliation_type} = 'cleavage'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "solid_state_foliation_type",
        "type": "select_one lz7no78",
        "label": "Solid-state Foliation Type",
        "required": "false",
        "default": "not_specified",
        "relevant": "${foliation_type} = 'solid_state'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "spacing_of_gneissic_bands_cm",
        "type": "integer",
        "label": "Spacing of Gneissic Bands (cm)",
        "required": "false",
        "default": "",
        "relevant": "${solid_state_foliation_type} = 'gneissic_banding'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "average_grain_size_mm_in_gne",
        "type": "integer",
        "label": "Average Grain Size (mm) in Gneissic Bands",
        "required": "false",
        "default": "",
        "relevant": "${solid_state_foliation_type} = 'gneissic_banding'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "specific_foliation_element",
        "type": "select_one of53v22",
        "label": "Specific Foliation Element being Measured",
        "required": "false",
        "default": "not_specified",
        "relevant": "${solid_state_foliation_type} = 'mylonitic' or ${solid_state_foliation_type} = 'cataclastic' or ${solid_state_foliation_type} = 'schistosity'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "tectonite_label",
        "type": "select_one su3eo23",
        "label": "Tectonite Label",
        "required": "false",
        "default": "not_specified",
        "relevant": "${feature_type} = 'foliation'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "assoc_linear_feature",
        "type": "select_one gs9eo09",
        "label": "Is there an associated linear feature (e.g., lineation, striation, flow direction)?",
        "required": "false",
        "default": "no",
        "relevant": "${feature_type} = 'foliation' or ${feature_type} = 'flow_layering' or ${feature_type} = 'bedding' or ${feature_type} = 'joint' or ${feature_type} = 'fracture' or ${feature_type} = 'fault_plane' or ${feature_type} = 'axial_surface' or ${feature_type} = 'cleavage' or ${feature_type} = 'shear_zone' or ${feature_type} = 'striated_surface' or ${feature_type} = 'fold_limb' or ${feature_geometry} = 'plane'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "assoc_linear_feature_trend",
        "type": "integer",
        "label": "Associated Linear Feature Trend",
        "required": "true",
        "default": "",
        "relevant": "${assoc_linear_feature} = 'yes'",
        "hint": "Azimuth in degrees",
        "constraint": ". >= 0 and . <= 360",
        "constraint_message": "Trend must be between 0-360."
      },
      {
        "name": "assoc_linear_feature_plunge",
        "type": "integer",
        "label": "Associated Linear Feature Plunge",
        "required": "true",
        "default": "",
        "relevant": "${assoc_linear_feature} = 'yes'",
        "hint": "",
        "constraint": ". >= 0 and . <= 90",
        "constraint_message": "Plunge must be between 0-90."
      },
      {
        "name": "assoc_planar_feature",
        "type": "select_one on2yb53",
        "label": "Is there an associated planar feature (e.g., foliation or axial surface, striated surface)?",
        "required": "false",
        "default": "no",
        "relevant": "${feature_type} = 'lineation' or ${feature_type} = 'fold_hinge' or ${feature_type} = 'striation' or ${feature_type} = 'direction' or ${feature_geometry} = 'line'",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "assoc_planar_feature_strike",
        "type": "integer",
        "label": "Associated Linear Feature Strike",
        "required": "true",
        "default": "",
        "relevant": "${assoc_planar_feature} = 'yes'",
        "hint": "",
        "constraint": ". <= 360 and . >= 0",
        "constraint_message": "Strike must be between 0-360."
      },
      {
        "name": "assoc_linear_feature_dip",
        "type": "integer",
        "label": "Associated Linear Feature Dip",
        "required": "true",
        "default": "",
        "relevant": "${assoc_planar_feature} = 'yes'",
        "hint": "",
        "constraint": ". <= 90 and . >= 0",
        "constraint_message": "Dip must be between 0-90."
      },
      {
        "name": "start",
        "type": "start",
        "label": "",
        "required": "",
        "default": "",
        "relevant": "",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      },
      {
        "name": "end",
        "type": "end",
        "label": "",
        "required": "",
        "default": "",
        "relevant": "",
        "hint": "",
        "constraint": "",
        "constraint_message": ""
      }
    ];

    factory.orientation_choices = [
      {
        "label": "bedding",
        "name": "bedding",
        "order": "0",
        "list name": "ll25x57"
      },
      {
        "label": "foliation",
        "name": "foliation",
        "order": "1",
        "list name": "ll25x57"
      },
      {
        "label": "flow layering",
        "name": "flow_layering",
        "order": "2",
        "list name": "ll25x57"
      },
      {
        "label": "joint",
        "name": "joint",
        "order": "3",
        "list name": "ll25x57"
      },
      {
        "label": "fracture",
        "name": "fracture",
        "order": "4",
        "list name": "ll25x57"
      },
      {
        "label": "fault plane",
        "name": "fault_plane",
        "order": "5",
        "list name": "ll25x57"
      },
      {
        "label": "axial surface",
        "name": "axial_surface",
        "order": "6",
        "list name": "ll25x57"
      },
      {
        "label": "stylolite",
        "name": "stylolite",
        "order": "7",
        "list name": "ll25x57"
      },
      {
        "label": "fold hinge",
        "name": "fold_hinge",
        "order": "8",
        "list name": "ll25x57"
      },
      {
        "label": "lineation",
        "name": "lineation",
        "order": "9",
        "list name": "ll25x57"
      },
      {
        "label": "striation",
        "name": "striation",
        "order": "10",
        "list name": "ll25x57"
      },
      {
        "label": "cleavage",
        "name": "cleavage",
        "order": "11",
        "list name": "ll25x57"
      },
      {
        "label": "shear zone",
        "name": "shear_zone",
        "order": "12",
        "list name": "ll25x57"
      },
      {
        "label": "direction",
        "name": "direction",
        "order": "13",
        "list name": "ll25x57"
      },
      {
        "label": "vector",
        "name": "vector",
        "order": "14",
        "list name": "ll25x57"
      },
      {
        "label": "striated surface",
        "name": "striated_surface",
        "order": "15",
        "list name": "ll25x57"
      },
      {
        "label": "fold limb",
        "name": "fold_limb",
        "order": "16",
        "list name": "ll25x57"
      },
      {
        "label": "other",
        "name": "other",
        "order": "",
        "list name": "ll25x57"
      },
      {
        "label": "contact",
        "name": "contact",
        "order": "",
        "list name": "ll25x57"
      },
      {
        "label": "plane",
        "name": "plane",
        "order": "",
        "list name": "du3mh76"
      },
      {
        "label": "line",
        "name": "line",
        "order": "",
        "list name": "du3mh76"
      },
      {
        "label": "upright",
        "name": "upright",
        "order": "",
        "list name": "to1en66"
      },
      {
        "label": "overturned",
        "name": "overturned",
        "order": "",
        "list name": "to1en66"
      },
      {
        "label": "vertical",
        "name": "vertical",
        "order": "",
        "list name": "to1en66"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "order": "",
        "list name": "to1en66"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "order": "",
        "list name": "to1en66"
      },
      {
        "label": "Yes",
        "name": "yes",
        "order": "",
        "list name": "kn36u14"
      },
      {
        "label": "No",
        "name": "no",
        "order": "",
        "list name": "kn36u14"
      },
      {
        "label": "anticline",
        "name": "anticline",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "monocline",
        "name": "monocline",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "antiformal syncline",
        "name": "antiformal_syn",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "synformal anticline",
        "name": "synformal_anti",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "antiform",
        "name": "antiform",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "synform",
        "name": "synform",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "s-fold",
        "name": "sfold",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "z-fold",
        "name": "zfold",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "m-fold",
        "name": "mfold",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "syncline",
        "name": "syncline",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "order": "",
        "list name": "oa9ot58"
      },
      {
        "label": "overturned",
        "name": "overturned",
        "order": "",
        "list name": "eu4ay01"
      },
      {
        "label": "vertical",
        "name": "vertical",
        "order": "",
        "list name": "eu4ay01"
      },
      {
        "label": "horizontal",
        "name": "horizontal",
        "order": "",
        "list name": "eu4ay01"
      },
      {
        "label": "recumbent",
        "name": "recumbent",
        "order": "",
        "list name": "eu4ay01"
      },
      {
        "label": "inclined",
        "name": "inclined",
        "order": "",
        "list name": "eu4ay01"
      },
      {
        "label": "upright",
        "name": "upright",
        "order": "",
        "list name": "eu4ay01"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "order": "",
        "list name": "eu4ay01"
      },
      {
        "label": "accurate",
        "name": "accurate",
        "order": "",
        "list name": "gl2mf38"
      },
      {
        "label": "approximate",
        "name": "approximate",
        "order": "",
        "list name": "gl2mf38"
      },
      {
        "label": "irregular",
        "name": "irregular",
        "order": "",
        "list name": "gl2mf38"
      },
      {
        "label": "1",
        "name": "1",
        "order": "",
        "list name": "xn9nf56"
      },
      {
        "label": "2",
        "name": "2",
        "order": "",
        "list name": "xn9nf56"
      },
      {
        "label": "3",
        "name": "3",
        "order": "",
        "list name": "xn9nf56"
      },
      {
        "label": "4",
        "name": "4",
        "order": "",
        "list name": "xn9nf56"
      },
      {
        "label": "5",
        "name": "5",
        "order": "",
        "list name": "xn9nf56"
      },
      {
        "label": "solid-state",
        "name": "solid_state",
        "order": "0",
        "list name": "vn7df87"
      },
      {
        "label": "magmatic",
        "name": "magmatic",
        "order": "1",
        "list name": "vn7df87"
      },
      {
        "label": "migmatitic",
        "name": "migmatitic",
        "order": "2",
        "list name": "vn7df87"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "order": "3",
        "list name": "vn7df87"
      },
      {
        "label": "cleavage",
        "name": "cleavage",
        "order": "4",
        "list name": "vn7df87"
      },
      {
        "label": "other",
        "name": "other",
        "order": "5",
        "list name": "vn7df87"
      },
      {
        "label": "slatey",
        "name": "slatey",
        "order": "",
        "list name": "dr5ab45"
      },
      {
        "label": "phyllitic",
        "name": "phyllitic",
        "order": "",
        "list name": "dr5ab45"
      },
      {
        "label": "crenulation",
        "name": "crenulation",
        "order": "",
        "list name": "dr5ab45"
      },
      {
        "label": "phacoidal",
        "name": "phacoidal",
        "order": "",
        "list name": "dr5ab45"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "order": "",
        "list name": "dr5ab45"
      },
      {
        "label": "other / new",
        "name": "other_new",
        "order": "",
        "list name": "dr5ab45"
      },
      {
        "label": "mylonitic",
        "name": "mylonitic",
        "order": "0",
        "list name": "lz7no78"
      },
      {
        "label": "cataclastic",
        "name": "cataclastic",
        "order": "1",
        "list name": "lz7no78"
      },
      {
        "label": "lenticular",
        "name": "lenticular",
        "order": "2",
        "list name": "lz7no78"
      },
      {
        "label": "strain markers (e.g., flattened pebbles)",
        "name": "strain_marker",
        "order": "3",
        "list name": "lz7no78"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "order": "4",
        "list name": "lz7no78"
      },
      {
        "label": "other",
        "name": "other",
        "order": "5",
        "list name": "lz7no78"
      },
      {
        "label": "schistosity",
        "name": "schistosity",
        "order": "",
        "list name": "lz7no78"
      },
      {
        "label": "gneissic banding",
        "name": "gneissic_banding",
        "order": "",
        "list name": "lz7no78"
      },
      {
        "label": "S",
        "name": "s",
        "order": "",
        "list name": "of53v22"
      },
      {
        "label": "C",
        "name": "c",
        "order": "",
        "list name": "of53v22"
      },
      {
        "label": "C'",
        "name": "c_1",
        "order": "",
        "list name": "of53v22"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "order": "",
        "list name": "of53v22"
      },
      {
        "label": "S tectonite",
        "name": "s_tectonite",
        "order": "",
        "list name": "su3eo23"
      },
      {
        "label": "S-L tectonite",
        "name": "s_l_tectonite",
        "order": "",
        "list name": "su3eo23"
      },
      {
        "label": "L-S tectonite",
        "name": "l_s_tectonite",
        "order": "",
        "list name": "su3eo23"
      },
      {
        "label": "L tectonite",
        "name": "l_tectonite",
        "order": "",
        "list name": "su3eo23"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "order": "",
        "list name": "su3eo23"
      },
      {
        "label": "Yes",
        "name": "yes",
        "order": "",
        "list name": "gs9eo09"
      },
      {
        "label": "No",
        "name": "no",
        "order": "",
        "list name": "gs9eo09"
      },
      {
        "label": "Yes",
        "name": "yes",
        "order": "",
        "list name": "on2yb53"
      },
      {
        "label": "No",
        "name": "no",
        "order": "",
        "list name": "on2yb53"
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
        "name":"map_unit_name",
        "type":"text",
        "label":"Map Unit Name",
        "required":"false",
        "appearance":"",
        "relevant":""
      },
      {
        "name":"rock_type",
        "type":"select_one rm0pv08",
        "label":"Rock Type",
        "required":"false",
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
        "name":"phanerozoic_era",
        "type":"select_one vz9ao44",
        "label":"Phanerozoic Era",
        "required":"false",
        "appearance":"",
        "relevant":"${eon} = 'phanerozoic'"
      },
      {
        "name":"proterozoic_era",
        "type":"select_one gr2yp07",
        "label":"Proterozoic Era",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${eon} = 'proterozoic'"
      },
      {
        "name":"archean_era",
        "type":"select_one fz38a59",
        "label":"Archean Era",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${eon} = 'archean'"
      },
      {
        "name":"cenozoic_period",
        "type":"select_one lb7hu27",
        "label":"Cenozoic Period",
        "required":"false",
        "appearance":"",
        "relevant":"${phanerozoic_era} = 'cenozoic'"
      },
      {
        "name":"mesozoic_period",
        "type":"select_one xu87d35",
        "label":"Mesozoic Period",
        "required":"false",
        "appearance":"",
        "relevant":"${phanerozoic_era} = 'mesozoic'"
      },
      {
        "name":"paleozoic_period",
        "type":"select_one vh16g23",
        "label":"Paleozoic Period",
        "required":"false",
        "appearance":"",
        "relevant":"${phanerozoic_era} = 'paleozoic'"
      },
      {
        "name":"proterozoic_and_archean_period",
        "type":"select_one yx4re06",
        "label":"Proterozoic and Archean Period",
        "required":"false",
        "appearance":"horizontal",
        "relevant":"${eon} = 'proterozoic' or ${eon} = 'archean'"
      },
      {
        "name":"quaternary_epoch",
        "type":"select_one vd9wt91",
        "label":"Quaternary Epoch",
        "required":"false",
        "appearance":"horizontal-compact",
        "relevant":"${cenozoic_period} = 'quaternary'"
      },
      {
        "name":"neogene_epoch",
        "type":"select_one sw9pw60",
        "label":"Neogene Epoch",
        "required":"false",
        "appearance":"horizontal-compact",
        "relevant":"${cenozoic_period} = 'neogene'"
      },
      {
        "name":"paleogene_epoch",
        "type":"select_one li0is11",
        "label":"Paleogene Epoch",
        "required":"false",
        "appearance":"horizontal-compact",
        "relevant":"${cenozoic_period} = 'paleogene'"
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
        "label":"other",
        "name":"other",
        "order":12,
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
        "name":"alkali_feldspa",
        "order":1,
        "list name":"pu9hj08"
      },
      {
        "label":"quartz monzonite",
        "name":"quartz_monzoni",
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
        "list name":"vz9ao44"
      },
      {
        "label":"Mesozoic",
        "name":"mesozoic",
        "order":null,
        "list name":"vz9ao44"
      },
      {
        "label":"Paleozoic",
        "name":"paleozoic",
        "order":null,
        "list name":"vz9ao44"
      },
      {
        "label":"Neoproterozoic",
        "name":"neoproterozoic",
        "order":null,
        "list name":"gr2yp07"
      },
      {
        "label":"Mesoproterozoic",
        "name":"mesoproterozoi",
        "order":null,
        "list name":"gr2yp07"
      },
      {
        "label":"Paleoproterozoic",
        "name":"paleoproterozo",
        "order":null,
        "list name":"gr2yp07"
      },
      {
        "label":"Neoarchean",
        "name":"neoarchean",
        "order":null,
        "list name":"fz38a59"
      },
      {
        "label":"Mesoarchean",
        "name":"mesoarchean",
        "order":null,
        "list name":"fz38a59"
      },
      {
        "label":"Paleoarchean",
        "name":"paleoarchean",
        "order":null,
        "list name":"fz38a59"
      },
      {
        "label":"Eoarchean",
        "name":"eoarchean",
        "order":null,
        "list name":"fz38a59"
      },
      {
        "label":"Quaternary",
        "name":"quaternary",
        "order":null,
        "list name":"lb7hu27"
      },
      {
        "label":"Neogene",
        "name":"neogene",
        "order":null,
        "list name":"lb7hu27"
      },
      {
        "label":"Paleogene",
        "name":"paleogene",
        "order":null,
        "list name":"lb7hu27"
      },
      {
        "label":"Cretaceous",
        "name":"cretaceous",
        "order":null,
        "list name":"xu87d35"
      },
      {
        "label":"Jurassic",
        "name":"jurassic",
        "order":null,
        "list name":"xu87d35"
      },
      {
        "label":"Triassic",
        "name":"triassic",
        "order":null,
        "list name":"xu87d35"
      },
      {
        "label":"Permian",
        "name":"permian",
        "order":null,
        "list name":"vh16g23"
      },
      {
        "label":"Carboniferous",
        "name":"carboniferous",
        "order":null,
        "list name":"vh16g23"
      },
      {
        "label":"Pennsylvanian",
        "name":"pennsylvanian",
        "order":null,
        "list name":"vh16g23"
      },
      {
        "label":"Mississippian",
        "name":"mississippian",
        "order":null,
        "list name":"vh16g23"
      },
      {
        "label":"Devonian",
        "name":"devonian",
        "order":null,
        "list name":"vh16g23"
      },
      {
        "label":"Silurian",
        "name":"silurian",
        "order":null,
        "list name":"vh16g23"
      },
      {
        "label":"Ordovician",
        "name":"ordovician",
        "order":null,
        "list name":"vh16g23"
      },
      {
        "label":"Cambrian",
        "name":"cambrian",
        "order":null,
        "list name":"vh16g23"
      },
      {
        "label":"Ediacaran",
        "name":"ediacaran",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Crygenian",
        "name":"crygenian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Tonian",
        "name":"tonian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Stenian",
        "name":"stenian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Ectasian",
        "name":"ectasian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Calymmian",
        "name":"calymmian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Statherian",
        "name":"statherian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Orosirian",
        "name":"orosirian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Rhyacian",
        "name":"rhyacian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"SIderian",
        "name":"siderian",
        "order":null,
        "list name":"yx4re06"
      },
      {
        "label":"Holocene",
        "name":"holocene",
        "order":null,
        "list name":"vd9wt91"
      },
      {
        "label":"Pleistocene",
        "name":"pleistocene",
        "order":null,
        "list name":"vd9wt91"
      },
      {
        "label":"Pliocene",
        "name":"pliocene",
        "order":0,
        "list name":"sw9pw60"
      },
      {
        "label":"Miocene",
        "name":"miocene",
        "order":1,
        "list name":"sw9pw60"
      },
      {
        "label":"Oligocene",
        "name":"oligocene",
        "order":null,
        "list name":"li0is11"
      },
      {
        "label":"Eocene",
        "name":"eocene",
        "order":null,
        "list name":"li0is11"
      },
      {
        "label":"Paleocene",
        "name":"paleocene",
        "order":null,
        "list name":"li0is11"
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

    factory.sample_locality_survey = [
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
    ];

    factory.sample_locality_choices = [
      {
        "label": "Yes",
        "name": "yes",
        "list name": "hz9zw76"
      },
      {
        "label": "No",
        "name": "no",
        "list name": "hz9zw76"
      },
      {
        "label": "intact rock",
        "name": "intact_rock",
        "list name": "jq8qd30"
      },
      {
        "label": "fragmented rock",
        "name": "fragmented_roc",
        "list name": "jq8qd30"
      },
      {
        "label": "sediment",
        "name": "sediment",
        "list name": "jq8qd30"
      },
      {
        "label": "other",
        "name": "other",
        "list name": "jq8qd30"
      },
      {
        "label": "fabric / microstructure",
        "name": "fabric___micro",
        "list name": "to0mv13"
      },
      {
        "label": "petrology",
        "name": "petrology",
        "list name": "to0mv13"
      },
      {
        "label": "geochronology",
        "name": "geochronology",
        "list name": "to0mv13"
      },
      {
        "label": "other",
        "name": "other",
        "list name": "to0mv13"
      }
    ];

    factory.shear_zone_survey = [{
      "name": "thickness_m",
      "type": "integer",
      "label": "Thickness (m)",
      "hint": "What is the thickness of this shear zone in meters?",
      "required": "true",
      "constraint": ". >= 0",
      "constraint_message": "Thickness must be greater than 0.",
      "default": "",
      "relevant": ""
    },
      {
        "name": "strike_of_shear_zone_boundary",
        "type": "integer",
        "label": "Strike of Shear Zone Boundary",
        "hint": "",
        "required": "false",
        "constraint": ". >= 0 and . <= 360",
        "constraint_message": "Strike must be between 0-360.",
        "default": "",
        "relevant": ""
      },
      {
        "name": "dip_of_shear_zone_boundary",
        "type": "integer",
        "label": "Dip of Shear Zone Boundary",
        "hint": "",
        "required": "false",
        "constraint": ". >= 0 and . <= 90",
        "constraint_message": "Dip must be between 0-360.",
        "default": "",
        "relevant": ""
      },
      {
        "name": "fault_geometry",
        "type": "select_one ku2gk10",
        "label": "Shear Zone Movement Type",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": ""
      },
      {
        "name": "Movement",
        "type": "select_one ww1yf84",
        "label": "Strike-Slip Movement",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "${fault_geometry} = 'strike_slip'"
      },
      {
        "name": "dip_slip_movement",
        "type": "select_one dr9xt23",
        "label": "Dip-Slip Movement",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "${fault_geometry} = 'dip_slip'"
      },
      {
        "name": "oblique_movement",
        "type": "select_one os1df47",
        "label": "Oblique Movement",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "${fault_geometry} = 'oblique'"
      },
      {
        "name": "movement_justification",
        "type": "select_one kt81l04",
        "label": "Movement Justification",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "${fault_geometry} != ''"
      },
      {
        "name": "offset_markers",
        "type": "select_multiple uh1mv47",
        "label": "Offset Markers",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "${movement_justification} = 'offset'"
      },
      {
        "name": "piercing_point_detail",
        "type": "text",
        "label": "Piercing Point Description",
        "hint": "Specify piercing point.",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "selected(${offset_markers}, 'piercing_point')"
      },
      {
        "name": "marker_detail",
        "type": "text",
        "label": "Marker Type",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "selected(${offset_markers}, 'other_marker')"
      },
      {
        "name": "directional_indicators",
        "type": "select_multiple xd2fb20",
        "label": "Directional Indicators",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "${movement_justification} = 'directional_indicator'"
      },
      {
        "name": "feature_asymmetry_detail",
        "type": "text",
        "label": "Asymmetry Details",
        "hint": "porphyroblast/clast, folds, mica fish, etc",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": "selected(${directional_indicators}, 'shear_sense')"
      },
      {
        "name": "mineral_lineation_detail",
        "type": "text",
        "label": "Mineral Lineation Detail",
        "hint": "What is the mineral?",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "",
        "relevant": "selected(${directional_indicators}, 'mineral_lineat')"
      },
      {
        "name": "juxtaposes_rocks",
        "type": "select_multiple fq8rt60",
        "label": "Juxtaposes __________ rocks....",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": ""
      },
      {
        "name": "against_rocks",
        "type": "select_multiple kw6tp41",
        "label": "... against ________ rocks.",
        "hint": "",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "not_specified",
        "relevant": ""
      },
      {
        "name": "inferred_age_of_shear_zone_ma",
        "type": "integer",
        "label": "Inferred Age (Ma) of Shear Zone Activity",
        "hint": "Do you know when the shear zone was active?",
        "required": "false",
        "constraint": "",
        "constraint_message": "",
        "default": "",
        "relevant": ""
      },
      {
        "name": "start",
        "type": "start",
        "label": "",
        "hint": "",
        "required": "",
        "constraint": "",
        "constraint_message": "",
        "default": "",
        "relevant": ""
      },
      {
        "name": "end",
        "type": "end",
        "label": "",
        "hint": "",
        "required": "",
        "constraint": "",
        "constraint_message": "",
        "default": "",
        "relevant": ""
      }
    ];

    factory.shear_zone_choices = [
      {
        "label": "strike-slip",
        "name": "strike_slip",
        "list name": "ku2gk10"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "ku2gk10"
      },
      {
        "label": "dip-slip",
        "name": "dip_slip",
        "list name": "ku2gk10"
      },
      {
        "label": "oblique",
        "name": "oblique",
        "list name": "ku2gk10"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "ku2gk10"
      },
      {
        "label": "dextral",
        "name": "dextral",
        "list name": "ww1yf84"
      },
      {
        "label": "sinistral",
        "name": "sinistral",
        "list name": "ww1yf84"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "ww1yf84"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "ww1yf84"
      },
      {
        "label": "reverse",
        "name": "reverse",
        "list name": "dr9xt23"
      },
      {
        "label": "normal",
        "name": "normal",
        "list name": "dr9xt23"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "dr9xt23"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "dr9xt23"
      },
      {
        "label": "dextral reverse",
        "name": "dextral_reverse",
        "list name": "os1df47"
      },
      {
        "label": "dextral normal",
        "name": "dextral_normal",
        "list name": "os1df47"
      },
      {
        "label": "sinistral reverse",
        "name": "sinistral_reverse",
        "list name": "os1df47"
      },
      {
        "label": "sinistral normal",
        "name": "sinistral_normal",
        "list name": "os1df47"
      },
      {
        "label": "unknown",
        "name": "unknown",
        "list name": "os1df47"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "os1df47"
      },
      {
        "label": "offset",
        "name": "offset",
        "list name": "kt81l04"
      },
      {
        "label": "directional indicators",
        "name": "directional_indicator",
        "list name": "kt81l04"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "kt81l04"
      },
      {
        "label": "bedding",
        "name": "bedding",
        "list name": "uh1mv47"
      },
      {
        "label": "intrusion",
        "name": "intrusion",
        "list name": "uh1mv47"
      },
      {
        "label": "metamorphic foliation",
        "name": "metamorphic_foliation",
        "list name": "uh1mv47"
      },
      {
        "label": "compositional banding",
        "name": "compositional_banding",
        "list name": "uh1mv47"
      },
      {
        "label": "geomorphic feature",
        "name": "geomorphic_feature",
        "list name": "uh1mv47"
      },
      {
        "label": "other marker",
        "name": "other_marker",
        "list name": "uh1mv47"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "uh1mv47"
      },
      {
        "label": "piercing point",
        "name": "piercing_point",
        "list name": "uh1mv47"
      },
      {
        "label": "mineral lineation",
        "name": "mineral_lineat",
        "list name": "xd2fb20"
      },
      {
        "label": "feature asymmetry",
        "name": "shear_sense",
        "list name": "xd2fb20"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "xd2fb20"
      },
      {
        "label": "This is a list of rock units / descriptions user has made",
        "name": "this_is_a_list",
        "list name": "fq8rt60"
      },
      {
        "label": "More in the list of rock units / descriptions user has made",
        "name": "more_in_the_li",
        "list name": "fq8rt60"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "fq8rt60"
      },
      {
        "label": "This is a list of rock units / descriptions user has made",
        "name": "this_is_a_list",
        "list name": "kw6tp41"
      },
      {
        "label": "More in the list of rock units / descriptions user has made",
        "name": "more_in_the_li",
        "list name": "kw6tp41"
      },
      {
        "label": "not specified",
        "name": "not_specified",
        "list name": "kw6tp41"
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
