(function () {
  'use strict';

  angular
    .module('app')
    .factory('DataModelsFactory', DataModelsFactory);

  DataModelsFactory.$inject = ['$log', '$http', '$q'];

  function DataModelsFactory($log, $http, $q) {
    var dataModels = {
      '_3d_structures': {
        'fabric': {
          'survey': {},
          'survey_file': 'app/data-models/fabric-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/fabric-choices.csv'
        },
        'fold': {
          'survey': {},
          'survey_file': 'app/data-models/fold-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/fold-choices.csv'
        },
        'other': {
          'survey': {},
          'survey_file': 'app/data-models/other_3d_structure-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/other_3d_structure-choices.csv'
        },
        'tensor': {
          'survey': {},
          'survey_file': 'app/data-models/tensor-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/tensor-choices.csv'
        }
      },
      'image': {
        'survey': {},
        'survey_file': 'app/data-models/image_properties-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/image_properties-choices.csv'
      },
      'micro': {
        'experimental_apparatus': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-apparatus-tag-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-apparatus-tag-choices.csv'
        },
        'experimental_assembly': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-assembly-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-assembly-choices.csv'
        },
        'experimental_general': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-general-survey.csv'
        },
        'experimental_general_results': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-general-testing-results-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-general-testing-results-choices.csv'
        },
        'experimental_general_conditions': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-general-testing-conditions-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-general-testing-conditions-choices.csv'
        },
        'experimental_griggs_conditions': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-griggs-conditions-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-griggs-conditions-choices.csv'
        },
        'experimental_griggs_results': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-griggs-results-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-griggs-results-choices.csv'
        },
        'experimental_heard_conditions': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-heard-conditions-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-heard-conditions-choices.csv'
        },
        'experimental_heard_results': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-heard-results-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-heard-results-choices.csv'
        },
        'experimental_paterson_conditions': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-paterson-conditions-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-paterson-conditions-choices.csv'
        },
        'experimental_paterson_results': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-paterson-results-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-paterson-results-choices.csv'
        },
        'experimental_results': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-results-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-results-choices.csv'
        },
        'experimental_sample': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-sample-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-sample-choices.csv'
        },
        'experimental_set_up': {
          'survey': {},
          'survey_file': 'app/data-models/micro/experimental-set-up-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/micro/experimental-set-up-choices.csv'
        }
      },
      'orientation_data': {
        'linear_orientation': {
          'survey': {},
          'survey_file': 'app/data-models/linear_orientation-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/linear_orientation-choices.csv'
        },
        'planar_orientation': {
          'survey': {},
          'survey_file': 'app/data-models/planar_orientation-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/planar_orientation-choices.csv'
        },
        'tabular_orientation': {
          'survey': {},
          'survey_file': 'app/data-models/tabular_zone_orientation-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/tabular_zone_orientation-choices.csv'
        }
      },
      'pet': {
        'rock': {
          'survey': {},
          'survey_file': 'app/data-models/pet/rock-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/pet/rock-choices.csv'
        },
        'minerals': {
          'survey': {},
          'survey_file': 'app/data-models/pet/minerals-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/pet/minerals-choices.csv'
        },
        'reactions': {
          'survey': {},
          'survey_file': 'app/data-models/pet/reactions-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/pet/reactions-choices.csv'
        }
      },
      'preferences': {
        'survey': {},
        'survey_file': 'app/data-models/project_preferences-survey.csv'
      },
      'project': {
        'survey': {},
        'survey_file': 'app/data-models/project_description-survey.csv'
      },
      'rock_unit': {
        'survey': {},
        'survey_file': 'app/data-models/rock_unit-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/rock_unit-choices.csv'
      },
      'sample': {
        'survey': {},
        'survey_file': 'app/data-models/sample-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/sample-choices.csv'
      },
      'sed': {
        'add_interval': {
          'survey': {},
          'survey_file': 'app/data-models/sed/add-interval-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/add-interval-choices.csv'
        },
        'interpretations_architecture': {
          'survey': {},
          'survey_file': 'app/data-models/sed/interpretations-architecture-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/interpretations-architecture-choices.csv'
        },
        'interpretations_environment': {
          'survey': {},
          'survey_file': 'app/data-models/sed/interpretations-environment-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/interpretations-environment-choices.csv'
        },
        'interpretations_process': {
          'survey': {},
          'survey_file': 'app/data-models/sed/interpretations-process-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/interpretations-process-choices.csv'
        },
        'bedding': {
          'survey': {},
          'survey_file': 'app/data-models/sed/bedding-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/bedding-choices.csv'
        },
        'bedding_shared': {
          'survey': {},
          'survey_file': 'app/data-models/sed/bedding-shared-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/bedding-shared-choices.csv'
        },
        'diagenesis': {
          'survey': {},
          'survey_file': 'app/data-models/sed/diagenesis-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/diagenesis-choices.csv'
        },
        'fossils': {
          'survey': {},
          'survey_file': 'app/data-models/sed/fossils-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/fossils-choices.csv'
        },
        'interpretations_surfaces': {
          'survey': {},
          'survey_file': 'app/data-models/sed/interpretations-surfaces-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/interpretations-surfaces-choices.csv'
        },
        'interval': {
          'survey': {},
          'survey_file': 'app/data-models/sed/interval-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/interval-choices.csv'
        },
        'lithologies_composition': {
          'survey': {},
          'survey_file': 'app/data-models/sed/lithologies-composition-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/lithologies-composition-choices.csv'
        },
        'lithologies_lithology': {
          'survey': {},
          'survey_file': 'app/data-models/sed/lithologies-lithology-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/lithologies-lithology-choices.csv'
        },
        'lithologies_texture': {
          'survey': {},
          'survey_file': 'app/data-models/sed/lithologies-texture-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/lithologies-texture-choices.csv'
        },
        'strat_section': {
          'survey': {},
          'survey_file': 'app/data-models/sed/strat-section-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/strat-section-choices.csv'
        },
        'structures_bioturbation': {
          'survey': {},
          'survey_file': 'app/data-models/sed/structures-bioturbation-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/structures-bioturbation-choices.csv'
        },
        'structures_bedding_plane': {
          'survey': {},
          'survey_file': 'app/data-models/sed/structures-bedding-plane-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/structures-bedding-plane-choices.csv'
        },
        'structures_pedogenic': {
          'survey': {},
          'survey_file': 'app/data-models/sed/structures-pedogenic-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/structures-pedogenic-choices.csv'
        },
        'structures_physical': {
          'survey': {},
          'survey_file': 'app/data-models/sed/structures-physical-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/structures-physical-choices.csv'
        }
      },
      'surface_feature': {
        'survey': {},
        'survey_file': 'app/data-models/surface_feature-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/surface_feature-choices.csv'
      },
      'tools': {
        'survey': {},
        'survey_file': 'app/data-models/tools-survey.csv'
      },
      'trace': {
        'survey': {},
        'survey_file': 'app/data-models/trace-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/trace-choices.csv'
      }
    };
    var featureTypeLabels = {};
    var labelsDictionary = {};
    var labelsDictionaryNew = {};
    var sedLabelsDictionary = {};
    var fieldsToGetLabel = [];
    var spotDataModel = {};
    var surfaceFeatureTypeLabels = {};
    var traceTypeLabels = {};

    return {
      'getDataModel': getDataModel,
      'getFeatureTypeLabel': getFeatureTypeLabel,
      'getLabel': getLabel,
      'getLabelFromNewDictionary': getLabelFromNewDictionary,
      'getSedLabel': getSedLabel,
      'getSedLabelsDictionary': getSedLabelsDictionary,
      'getSpotDataModel': getSpotDataModel,
      'getSurfaceFeatureTypeLabel': getSurfaceFeatureTypeLabel,
      'getTraceTypeLabel': getTraceTypeLabel,
      'loadDataModels': loadDataModels,
      'readCSV': readCSV
    };

    /**
     * Private Functions
     */

    // Create a new dictionary for ALL values with their labels across ALL data models
    function addFieldsToLabelsDictionary(fields) {
      _.each(fields, function (field) {
        // ToDo: Find duplicates that don't match and fix
        // if (labelsDictionaryNew[field.name] && labelsDictionaryNew[field.name] !== field.label) {
        // if (labelsDictionaryNew[field.name] && labelsDictionaryNew[field.name].toLowerCase() !== field.label.toLowerCase()) {
        //   $log.error('Unmatched Labels!', field.name, ': ', labelsDictionaryNew[field.name], '!==', field.label);
        // }
        labelsDictionaryNew[field.name] = field.label;
        // Make a list of all fields that are are select one or select multiple or are choices
        if (!field.type) {
          fieldsToGetLabel.push(field.name);
        }
        else {
          var fieldType = field.type.split(" ")[0];
          if (fieldType === 'select_one' || fieldType === 'select_multiple') fieldsToGetLabel.push(field.name);
        }
      });
    }

    // Remove the default start, end and calculate objects
    function cleanJson(json) {
      return _.reject(json.data, function (obj) {
        return ((obj.name === 'start' && obj.type === 'start') ||
          (obj.name === 'end' && obj.type === 'end') ||
          (obj.name === '__version__' && obj.type === 'calculate') ||
          (obj.name === '_version_' && obj.type === 'calculate'));
      });
    }

    function createFeatureTypesDictionary() {
      var models = [dataModels.orientation_data.linear_orientation,
        dataModels.orientation_data.planar_orientation,
        dataModels.orientation_data.tabular_orientation,
        dataModels._3d_structures.fabric,
        dataModels._3d_structures.fold,
        dataModels._3d_structures.other,
        dataModels._3d_structures.tensor];

      featureTypeLabels = gatherTypeLabels(models, 'feature_type');
      $log.log('Feature Types:', featureTypeLabels);
      traceTypeLabels = gatherTypeLabels([dataModels.trace], 'trace_type');
      $log.log('Trace Feature Types:', traceTypeLabels);
      surfaceFeatureTypeLabels = gatherTypeLabels([dataModels.surface_feature], 'surface_feature_type');
      $log.log('Surface Feature Types:', surfaceFeatureTypeLabels);
    }

    function createOtherLabelsDictionary() {
      var models = {
        'images': dataModels.image,
        'samples': dataModels.sample
      };
      _.each(models, function (model) {
        _.each(model.choices, function (field) {
          if (labelsDictionary[field.name] && labelsDictionary[field.name] !== field.label) {
            $log.error('Dup label!', field.name, labelsDictionary[field.name], field.label);
          }
          labelsDictionary[field.name] = field.label;
        });
      });
      $log.log('Original Labels Dictionary (Subset of Labels):', labelsDictionary);
    }

    function createSedLabelsDictionary() {
      sedLabelsDictionary = {'clastic': [], 'carbonate': [], 'lithologies': [], 'weathering': []};
      var survey = dataModels.sed.add_interval.survey;
      var clastic = _.filter(survey, function (field) {
        return field.name === 'mud_silt_grain_size' || field.name === 'sand_grain_size' ||
          field.name === 'congl_grain_size' || field.name === 'breccia_grain_size';
      });
      var carbonate = _.find(survey, function (field) {
        return field.name === 'dunham_classification';
      });
      var lithologies = _.find(survey, function (field) {
        return field.name === 'primary_lithology';
      });
      var weathering = _.find(survey, function (field) {
        return field.name === 'relative_resistance_weather';
      });
      var clasticChoices = [];
      _.each(clastic, function (c) {
        var clasticChoicesTemp = _.filter(dataModels.sed.add_interval.choices, function (choice) {
          return choice.list_name === c.type.split(' ')[1]
        });
        clasticChoices.push(clasticChoicesTemp);
      });
      clasticChoices = _.uniq(_.flatten(clasticChoices));
      var carbonateChoices = _.filter(dataModels.sed.add_interval.choices, function (choice) {
        return choice.list_name === carbonate.type.split(' ')[1]
      });
      var lithologiesChoices = _.filter(dataModels.sed.add_interval.choices, function (choice) {
        return choice.list_name === lithologies.type.split(' ')[1]
      });
      var weatheringChoices = _.filter(dataModels.sed.add_interval.choices, function (choice) {
        return choice.list_name === weathering.type.split(' ')[1]
      });
      _.each(clasticChoices, function (choice, i) {
        sedLabelsDictionary.clastic.push({'value': choice.name, 'label': choice.label});
        //sedLabelsDictionary.clastic[choice.name] = {'label': choice.label, 'order': i};
      });
      _.each(carbonateChoices, function (choice, i) {
        sedLabelsDictionary.carbonate.push({'value': choice.name, 'label': choice.label});
        //sedLabelsDictionary.carbonate[choice.name] = {'label': choice.label, 'order': i};
      });
      _.each(lithologiesChoices, function (choice, i) {
        sedLabelsDictionary.lithologies.push({'value': choice.name, 'label': choice.label});
        //sedLabelsDictionary.lithologies[choice.name] = {'label': choice.label, 'order': i};
      });
      _.each(weatheringChoices, function (choice, i) {
        sedLabelsDictionary.weathering.push({'value': choice.name, 'label': choice.label});
        //sedLabelsDictionary.weathering[choice.name] = {'label': choice.label, 'order': i};
      });
    }

    function createSpotDataModel() {
      spotDataModel = {
        'geometry': {
          'coordinates': {},
          'type': 'one of [Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon, GeometryCollection]'
        },
        'properties': {
          '_3d_structures': [],
          'altitude': 'Type: number; Label: Altitude (m); Hint: Height of the position in meters above the ellipsoid of the earth.',
          'date': 'Type: datetime; Label: Date',
          'gps_accuracy': 'Type: number; Label: GPS Accuracy (m); Hint: Accuracy level of the latitude and longitude coordinates in meters.',
          'id': 'number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)',
          'images': [],
          'modified_timestamp': 'timestamp',
          'name': 'Type: text; Label: Spot Name; REQUIRED',
          'notes': 'Type: text; Label: Notes',
          'orientation_data': [],
          'pet': {'minerals': [], 'reactions': []},
          'samples': [],
          'sed': {
            'bedding': {'beds': []},
            'character': 'one of [bed, bed_mixed_lit, interbedded, not_measured, other, package_succe, unexposed_cove]',
            'diagenesis': [{}], 'fossils': [{}], 'interpretations': [{}], 'interval': {}, 'lithologies': [{}],
            'other_character': 'text', 'structures': [{}]
          },
          'time': 'datetime',
          'trace': {}
        }
      };

      var models = {
        'fabric': dataModels._3d_structures.fabric,
        'fold': dataModels._3d_structures.fold,
        'other': dataModels._3d_structures.other,
        'tensor': dataModels._3d_structures.tensor,
        'images': dataModels.image,
        'linear_orientation': dataModels.orientation_data.linear_orientation,
        'planar_orientation': dataModels.orientation_data.planar_orientation,
        'tabular_orientation': dataModels.orientation_data.tabular_orientation,
        'samples': dataModels.sample,
        'sed_bedding': dataModels.sed.bedding,
        'sed_bedding_shared': dataModels.sed.bedding_shared,
        'sed_diagenesis': dataModels.sed.diagenesis,
        'sed_fossils': dataModels.sed.fossils,
        'sed_interpretations_architecture': dataModels.sed.interpretations_architecture,
        'sed_interpretations_environment': dataModels.sed.interpretations_environment,
        'sed_interpretations_process': dataModels.sed.interpretations_process,
        'sed_interpretations_surfaces': dataModels.sed.interpretations_surfaces,
        'sed_interval': dataModels.sed.interval,
        'sed_lithologies_composition': dataModels.sed.lithologies_composition,
        'sed_lithologies_lithology': dataModels.sed.lithologies_lithology,
        'sed_lithologies_texture': dataModels.sed.lithologies_texture,
        'sed_structures_bioturbation': dataModels.sed.structures_bioturbation,
        'sed_structures_bedding_plane': dataModels.sed.structures_bedding_plane,
        'sed_structures_pedogenic': dataModels.sed.structures_pedogenic,
        'sed_structures_physical': dataModels.sed.structures_physical,
        'trace': dataModels.trace,
        'pet_rock': dataModels.pet.rock,
        'pet_minerals': dataModels.pet.minerals,
        'pet_reactions': dataModels.pet.reactions
      };
      _.each(models, function (model, key) {
        var description = {};
        _.each(model.survey, function (field) {
          if (field.type.split('_')[0] !== 'end' && field.type.split('_')[0] !== 'begin' && field.type !== 'calculate'
            && field.name !== 'interval_type') {
            var type = getType(field.type, model);
            var hint = field.hint ? '; Hint: ' + field.hint : '';
            var required = field.required === 'true' ? '; REQUIRED' : '';
            description[field.name] = 'Type: ' + type + required + '; Label: ' + field.label + hint;
          }
        });
        description = sortby(description);
        if (key === 'linear_orientation' || key === 'planar_orientation' || key === 'tabular_orientation') {
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number ' +
            'appended (= 14 digit id); REQUIRED';
          description.type = key + '; REQUIRED';
          description.associated_orientation = [];
          description = sortby(description);
          spotDataModel.properties.orientation_data.push(description);
        }
        else if (key === 'fabric' || key === 'fold' || key === 'other' || key === 'tensor') {
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number ' +
            'appended (= 14 digit id); REQUIRED';
          description.type = key + '; REQUIRED';
          description = sortby(description);
          spotDataModel.properties._3d_structures.push(description);
        }
        else if (key === 'samples') {
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number ' +
            'appended (= 14 digit id); REQUIRED';
          spotDataModel.properties[key].push(description);
        }
        else if (key === 'sed_bedding') spotDataModel.properties.sed.bedding.beds = [description];
        else if (key === 'sed_bedding_shared') _.extend(spotDataModel.properties.sed.bedding, description);
        else if (key === 'sed_diagenesis') _.extend(spotDataModel.properties.sed.diagenesis[0], description);
        else if (key === 'sed_fossils') _.extend(spotDataModel.properties.sed.fossils[0], description);
        else if (key === 'sed_interval') _.extend(spotDataModel.properties.sed.interval, description);
        else if (key === 'sed_lithologies_composition' || key === 'sed_lithologies_lithology' ||
          key === 'sed_lithologies_texture') {
          _.extend(spotDataModel.properties.sed.lithologies[0], description);
        }
        else if (key === 'sed_structures_bioturbation' || key === 'sed_structures_bedding_plane' ||
          key === 'sed_structures_pedogenic' || key === 'sed_structures_physical') {
          _.extend(spotDataModel.properties.sed.structures[0], description);
        }
        else if (key === 'sed_interpretations_process' || key === 'sed_interpretations_environment'
          || key === 'sed_interpretations_surfaces' || key === 'sed_interpretations_architecture') {
          _.extend(spotDataModel.properties.sed.interpretations[0], description);
        }
        else if (key === 'trace') _.extend(spotDataModel.properties[key], description);
        else if (key === 'images') {
          description.annotated = 'true/false for whether or not the image is used as an Image Basemap';
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number ' +
            'appended (= 14 digit id); REQUIRED';
          description = sortby(description);
          spotDataModel.properties.images.push(description);
        }
        else if (key === 'pet_rock') _.extend(spotDataModel.properties.pet, description);
        else if (key === 'pet_minerals') spotDataModel.properties.pet.minerals = [description];
        else if (key === 'pet_reactions') spotDataModel.properties.pet.reactions = [description];
        else spotDataModel.properties[key].push(description);
      });
    }


    function gatherTypeLabels(models, typeField) {
      var tempTypeLabels = {};
      _.each(models, function (model) {
        var type = _.findWhere(model.survey, {'name': typeField});
        if (type) {
          var list = type.type.split(' ')[1];
          var choices = _.filter(model.choices, function (choice) {
            return choice['list_name'] === list;
          });
          _.each(choices, function (choice) {
            if (tempTypeLabels[choice.name] && tempTypeLabels[choice.name] !== choice.label) {
              $log.error('Dup feature type!', choice.name, tempTypeLabels[choice.name], choice.label);
            }
            tempTypeLabels[choice.name] = choice.label;
          });
        }
      });
      return tempTypeLabels;
    }

    function getType(type, model) {
      var choices = {};
      if (type.split(' ')[0] === 'select_one') {
        choices = _.filter(model.choices, function (choice) {
          return choice['list_name'] === type.split(' ')[1];
        });
        type = 'select one [' + _.pluck(choices, 'name').join(', ') + ']';
      }
      else if (type.split(' ')[0] === 'select_multiple') {
        choices = _.filter(model.choices, function (choice) {
          return choice['list_name'] === type.split(' ')[1];
        });
        type = 'select multiple [' + _.pluck(choices, 'name').join(', ') + ']';
      }
      return type;
    }

    function loadDataModel(dataModel) {
      var deferred = $q.defer(); // init promise
      // Load the survey
      readCSV(dataModel.survey_file, function (surveyFields) {
        /*surveyFields = _.each(surveyFields, function (surveyField) {
          surveyField.name = surveyField.name.toLowerCase();
          if (surveyField.relevant) surveyField.relevant = surveyField.relevant.toLowerCase();
        });*/
        dataModel.survey = surveyFields;
        addFieldsToLabelsDictionary(surveyFields);
        // Load the choices
        if (dataModel.choices_file) {
          readCSV(dataModel.choices_file, function (choicesFields) {
            /*choicesFields = _.each(choicesFields, function (choicesField) {
              choicesField.name = choicesField.name.toLowerCase();
            });*/
            dataModel.choices = choicesFields;
            addFieldsToLabelsDictionary(choicesFields);
            deferred.resolve();
          });
        }
        else deferred.resolve();
      });
      return deferred.promise;
    }

    // Sort an arry of objects by key
    function sortby(obj, comparator) {
      var keys = _.sortBy(_.keys(obj), function (key) {
        return comparator ? comparator(obj[key], key) : key;
      });

      return _.object(keys, _.map(keys, function (key) {
        return obj[key];
      }));
    }

    /**
     * Public Functions
     */

    function getDataModel(model) {
      return dataModels[model];
    }

    function getFeatureTypeLabel(type) {
      return featureTypeLabels[type];
    }

    function getLabel(label) {
      return labelsDictionary[label] || undefined;
    }

    // Only get labels for data that is a key or for data that came from a select field or are a choice
    function getLabelFromNewDictionary(key, data) {
      if (key === data || _.contains(fieldsToGetLabel, key)) return labelsDictionaryNew[data] || undefined;
      return undefined;
    }

    function getSedLabel(value) {
      var matchedSedLabelsSet = _.find(sedLabelsDictionary, function (sedLabelsSet) {
        return _.find(sedLabelsSet, function (sedLabel) {
          return sedLabel.value === value;
        });
      });
      var matchedLabel = _.find(matchedSedLabelsSet, function (sedLabel) {
        return sedLabel.value === value;
      });
      return matchedLabel.label;
    }

    function getSedLabelsDictionary() {
      return sedLabelsDictionary;
    }

    function getSpotDataModel() {
      return spotDataModel;
    }

    function getSurfaceFeatureTypeLabel(type) {
      return surfaceFeatureTypeLabels[type];
    }

    function getTraceTypeLabel(type) {
      return traceTypeLabels[type];
    }

    function loadDataModels() {
      var deferred = $q.defer(); // init promise
      var promises = [];

      $log.log('Loading data models ...');
      _.each(dataModels, function (dataModel, key) {
        if (key === 'orientation_data' || key === '_3d_structures' || key === 'sed' || key === 'micro'
          || key === 'pet') {
          _.each(dataModel, function (childDataModel, childKey) {
            //$log.log('Loading', key, childKey, ' ...');
            promises.push(loadDataModel(childDataModel));
          });
        }
        else {
          // $log.log('Loading', key, ' ...');
          promises.push(loadDataModel(dataModel));
        }
      });
      $q.all(promises).then(function () {
        $log.log('Finished loading all data models', dataModels);
        createSpotDataModel();
        createFeatureTypesDictionary();
        createOtherLabelsDictionary();
        createSedLabelsDictionary();
        $log.log('New Labels Dictionary (All Labels):', labelsDictionaryNew);
        deferred.resolve();
      });
      return deferred.promise;
    }

    function readCSV(csvFile, callback) {
      $http.get(
        csvFile, {
          'transformResponse': function (csv) {
            Papa.parse(csv, {
              'header': true,
              'skipEmptyLines': true,
              'complete': function (json) {
                // $log.log('Parsed csv: ', json);
                callback(cleanJson(json));
              }
            });
          }
        }
      );
    }
  }
}());
