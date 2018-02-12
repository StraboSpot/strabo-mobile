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
        'biogenic_structures': {
          'survey': {},
          'survey_file': 'app/data-models/sed/biogenic-structures-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/biogenic-structures-choices.csv'
        },
        'chemogenic_structures': {
          'survey': {},
          'survey_file': 'app/data-models/sed/chemogenic-structures-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/chemogenic-structures-choices.csv'
        },
        'composition': {
          'survey': {},
          'survey_file': 'app/data-models/sed/composition-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/composition-choices.csv'
        },
        'interpretations': {
          'survey': {},
          'survey_file': 'app/data-models/sed/interpretations-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/interpretations-choices.csv'
        },
        'interval_basics': {
          'survey': {},
          'survey_file': 'app/data-models/sed/interval-basics-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/interval-basics-choices.csv'
        },
        'stratification': {
          'survey': {},
          'survey_file': 'app/data-models/sed/stratification-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/stratification-choices.csv'
        },
        'pedogenic_structures': {
          'survey': {},
          'survey_file': 'app/data-models/sed/pedogenic-structures-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/pedogenic-structures-choices.csv'
        },
        'physical_structures': {
          'survey': {},
          'survey_file': 'app/data-models/sed/physical-structures-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/physical-structures-choices.csv'
        },
        'texture': {
          'survey': {},
          'survey_file': 'app/data-models/sed/texture-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/sed/texture-choices.csv'
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
    var sedLabelsDictionary = {};
    var spotDataModel = {};
    var surfaceFeatureTypeLabels = {};
    var traceTypeLabels = {};

    return {
      'getDataModel': getDataModel,
      'getFeatureTypeLabel': getFeatureTypeLabel,
      'getLabel': getLabel,
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

    // Remove the default start, end and calculate objects
    function cleanJson(json) {
      return _.reject(json.data, function (obj) {
        return ((obj.name === 'start' && obj.type === 'start') ||
          (obj.name === 'end' && obj.type === 'end') ||
          (obj.name === '__version__' && obj.type === 'calculate'));
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
      $log.log('Labels Dictionary:', labelsDictionary);
    }

    function createSedLabelsDictionary() {
      sedLabelsDictionary = {'clastic': [], 'carbonate': [], 'lithologies': [], 'weathering': []};
      var survey = dataModels.sed.add_interval.survey;
      var clastic = _.filter(survey, function (field) {
        return field.name === 'mud_silt_principal_grain_size' ||
          field.name === 'sand_principal_grain_size' ||
          field.name === 'congl_breccia_principal_grain_size';
      });
      var carbonate = _.find(survey, function (field) {
        return field.name === 'principal_dunham_class';
      });
      var lithologies = _.find(survey, function (field) {
        return field.name === 'primary_lithology';
      });
      var weathering = _.find(survey, function (field) {
        return field.name === 'relative_resistance_weathering';
      });
      var clasticChoices = [];
      _.each(clastic, function (c) {
        var clasticChoicesTemp = _.filter(dataModels.sed.add_interval.choices, function (choice) {
          return choice.list_name === c.type.split(' ')[1]
        });
        clasticChoices.push(clasticChoicesTemp);
      });
      clasticChoices = _.flatten(clasticChoices);
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
          'type': 'one of [Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon]'
        },
        'properties': {
          '_3d_structures': [],
          'date': 'datetime',
          'id': 'number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)',
          'images': [],
          'modified_timestamp': 'timestamp',
          'name': 'Type: text; REQUIRED',
          'notes': 'Type: text',
          'orientation_data': [],
          'samples': [],
          'sed': {'lithologies': {}, 'structures': {}, 'interpretations': {}},
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
        'sed_composition': dataModels.sed.composition,
        'sed_interval_basics': dataModels.sed.interval_basics,
        'sed_stratification': dataModels.sed.stratification,
        'sed_texture': dataModels.sed.texture,
        'sed_biogenic_structures': dataModels.sed.biogenic_structures,
        'sed_chemogenic_structures': dataModels.sed.chemogenic_structures,
        'sed_pedogenic_structures': dataModels.sed.pedogenic_structures,
        'sed_physical_structures': dataModels.sed.physical_structures,
        'sed_interpretations': dataModels.sed.interpretations,
        'trace': dataModels.trace
      };
      _.each(models, function (model, key) {
        var description = {};
        _.each(model.survey, function (field) {
          if (field.type.split('_')[0] !== 'end' && field.type.split(
              '_')[0] !== 'begin' && field.type !== 'calculate') {
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
        else if (key === 'sed_composition' || key === 'sed_interval_basics' || key === 'sed_stratification' ||
          key === 'sed_texture') {
          _.extend(spotDataModel.properties.sed.lithologies, description);
        }
        else if (key === 'sed_biogenic_structures' || key === 'sed_chemogenic_structures' ||
          key === 'sed_pedogenic_structures' || key === 'sed_physical_structures') {
          _.extend(spotDataModel.properties.sed.structures, description);
        }
        else if (key === 'sed_interpretations') _.extend(spotDataModel.properties.sed.interpretations, description);
        else if (key === 'trace') _.extend(spotDataModel.properties[key], description);
        else if (key === 'images') {
          description.annotated = 'true/false for whether or not the image is used as an Image Basemap';
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number ' +
            'appended (= 14 digit id); REQUIRED';
          description = sortby(description);
          spotDataModel.properties.images.push(description);
        }
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
      if (type.split(' ')[0] === 'select_one') {
        var choices = _.filter(model.choices, function (choice) {
          return choice['list_name'] === type.split(' ')[1];
        });
        type = 'select one [' + _.pluck(choices, 'name').join(', ') + ']';
      }
      return type;
    }

    function loadDataModel(dataModel) {
      var deferred = $q.defer(); // init promise
      // Load the survey
      readCSV(dataModel.survey_file, function (surveyFields) {
        surveyFields = _.each(surveyFields, function (surveyField) {
          surveyField.name = surveyField.name.toLowerCase();
          if (surveyField.relevant) surveyField.relevant = surveyField.relevant.toLowerCase();
        });
        dataModel.survey = surveyFields;
        // Load the choices
        if (dataModel.choices_file) {
          readCSV(dataModel.choices_file, function (choicesFields) {
            choicesFields = _.each(choicesFields, function (choicesField) {
              choicesField.name = choicesField.name.toLowerCase();
            });
            dataModel.choices = choicesFields;
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
        if (key === 'orientation_data' || key === '_3d_structures' || key === 'sed') {
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
