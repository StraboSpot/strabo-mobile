angular.module('app')
  .addMeasurementsAndObservationsChoices = function($scope) {

  $scope.measurements_and_observations_choices = [
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
      "label":"gentle   (180º –120º)",
      "name":"gentle",
      "list name":"ao3ks66",
      "order":null
    },
    {
      "label":"open   (120º–70º)",
      "name":"open",
      "list name":"ao3ks66",
      "order":null
    },
    {
      "label":"close   (70º–30º)",
      "name":"close",
      "list name":"ao3ks66",
      "order":null
    },
    {
      "label":"tight   (30º–10º)",
      "name":"tight",
      "list name":"ao3ks66",
      "order":null
    },
    {
      "label":"isoclinal   (10º–0º)",
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
  ]
};