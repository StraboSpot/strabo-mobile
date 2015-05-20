angular.module('app')
  .addRockDescriptionChoices = function($scope) {

  $scope.rock_description_choices = [
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
  ]
};