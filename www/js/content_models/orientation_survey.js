angular.module('app')
  .addOrientationSurvey = function($scope) {

  $scope.orientation_survey = [
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
  ]
};