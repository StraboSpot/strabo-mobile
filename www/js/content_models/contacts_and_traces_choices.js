angular.module('app')
  .addContactsAndTracesChoices = function($scope) {

  $scope.contacts_and_traces_choices = [
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
      "name":"option_11",
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
      "name":"edge_of_mappin",
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
      "name":"between_two_di",
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
      "label":"oblique",
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
      "name":"directional_indicator",
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
      "name":"metamorphic_fo",
      "order":null,
      "list name":"gs8tm04"
    },
    {
      "label":"compositional banding",
      "name":"compositional_",
      "order":null,
      "list name":"gs8tm04"
    },
    {
      "label":"geomorphic feature",
      "name":"geomorphic_fea",
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
      "name":"metamorphic_foliation",
      "order":3,
      "list name":"uh1mv47"
    },
    {
      "label":"compositional banding",
      "name":"compositional_banding",
      "order":4,
      "list name":"uh1mv47"
    },
    {
      "label":"other",
      "name":"other_marker",
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
      "name":"crescentic_fractures",
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
      "name":"oblique_foliation",
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
      "name":"asymmetric_folds",
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
      "name":"oblique_foliat",
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
      "name":"asymmetric_fol",
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
      "name":"rotated_porphy",
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
      "name":"this_is_a_list",
      "order":null,
      "list name":"fq8rt60"
    },
    {
      "label":"More in the list of rock units / descriptions user has made",
      "name":"more_in_the_li",
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
      "name":"this_is_a_list",
      "order":null,
      "list name":"kw6tp41"
    },
    {
      "label":"More in the list of rock units / descriptions user has made",
      "name":"more_in_the_li",
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
      "label":"gentle   (180\xB0-120\xB0)",
      "name":"gentle",
      "order":null,
      "list name":"ao3ks66"
    },
    {
      "label":"open   (120\xB0-70\xB0)",
      "name":"open",
      "order":null,
      "list name":"ao3ks66"
    },
    {
      "label":"close   (70\xB0-30\xB0)",
      "name":"close",
      "order":null,
      "list name":"ao3ks66"
    },
    {
      "label":"tight   (30\xB0-10\xB0)",
      "name":"tight",
      "order":null,
      "list name":"ao3ks66"
    },
    {
      "label":"isoclinal   (10\xB0-0\xB0)",
      "name":"isoclinal",
      "order":null,
      "list name":"ao3ks66"
    },
    {
      "label":"None",
      "name":"option_9",
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
      "name":"questionable_a",
      "order":null,
      "list name":"wb5nf41"
    },
    {
      "label":"questionable inferred",
      "name":"questionable_i",
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
  ]
};