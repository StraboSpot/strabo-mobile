angular.module('app')
  .addOrientationChoices = function($scope) {

  $scope.orientation_choices = [
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
      "label": "other / new",
      "name": "other___new",
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
      "label": "Yes",
      "name": "yes",
      "order": "",
      "list name": "pk6nu99"
    },
    {
      "label": "Yes",
      "name": "yes",
      "order": "",
      "list name": "jt5sj80"
    },
    {
      "label": "Yes",
      "name": "yes",
      "order": "",
      "list name": "qe5jp53"
    },
    {
      "label": "Yes",
      "name": "yes",
      "order": "",
      "list name": "wa8up41"
    },
    {
      "label": "the fault description/form should open",
      "name": "fault_desc",
      "order": "",
      "list name": "oe1jo33"
    },
    {
      "label": "the contact description/form should open",
      "name": "contact_desc",
      "order": "",
      "list name": "yf8xk95"
    },
    {
      "label": "the fold description/form should open",
      "name": "fold_desc",
      "order": "",
      "list name": "ai64o12"
    },
    {
      "label": "the shear zone description/form should open",
      "name": "shear_zone_des",
      "order": "",
      "list name": "bs7tp75"
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
      "name": "other___new",
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
      "label": "Yes",
      "name": "yes",
      "order": "",
      "list name": "on2yb53"
    }
  ]
};