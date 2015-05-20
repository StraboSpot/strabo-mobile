angular.module('app')
  .addRockDescriptionSurvey = function ($scope) {

  $scope.rock_description_survey = [
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
  ]
};