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
    var spotDataModel = {};
    var surfaceFeatureTypeLabels = {};
    var traceTypeLabels = {};

    return {
      'getDataModel': getDataModel,
      'getFeatureTypeLabel': getFeatureTypeLabel,
      'getSpotDataModel': getSpotDataModel,
      'getSurfaceFeatureTypeLabel': getSurfaceFeatureTypeLabel,
      'getTraceTypeLabel': getTraceTypeLabel,
      'loadDataModels': loadDataModels,
      'readCSV': readCSV
    };

    /**
     * Private Functions
     */

    // Remove the default start and end objects
    function cleanJson(json) {
      return _.reject(json.data, function (obj) {
        return ((obj.name === 'start' && obj.type === 'start') || (obj.name === 'end' && obj.type === 'end'));
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
          'inferences': {
            'description_of_outcrop': 'Type: text',
            'notes': 'Type: text',
            'outcrop_in_place': 'one of [5 - definitely in place, 4, 3, 2, 1 - float]',
            'related_rosetta_outcrop': 'id of spot',
            'rosetta_outcrop': 'true/false'
          },
          'modified_timestamp': 'timestamp',
          'name': 'Type: text; REQUIRED',
          'notes': 'Type: text',
          'orientation_data': [],
          'samples': [],
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
        'trace': dataModels.trace
      };
      _.each(models, function (model, key) {
        var description = {};
        _.each(model.survey, function (field) {
          if (field.type.split(' ')[0] !== 'end' && field.type.split(' ')[0] !== 'begin') {
            var type = getType(field.type, model);
            var hint = field.hint ? '; Hint: ' + field.hint : '';
            var required = field.required === 'true' ? '; REQUIRED' : '';
            description[field.name] = 'Type: ' + type + required + '; Label: ' + field.label + hint;
          }
        });
        description = sortby(description);
        if (key === 'linear_orientation' || key === 'planar_orientation' || key === 'tabular_orientation') {
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id); REQUIRED';
          description.type = key + '; REQUIRED';
          description.associated_orientation = [];
          description = sortby(description);
          spotDataModel.properties.orientation_data.push(description);
        }
        else if (key === 'fabric' || key === 'fold' || key === 'other' || key === 'tensor') {
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id); REQUIRED';
          description.type = key + '; REQUIRED';
          description = sortby(description);
          spotDataModel.properties._3d_structures.push(description);
        }
        else if (key === 'samples') {
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id); REQUIRED';
          spotDataModel.properties[key].push(description);
        }
        else if (key === 'trace') {
          _.extend(spotDataModel.properties[key], description);
        }
        else if (key === 'images') {
          description.annotated = 'true/false for whether or not the image is used as an Image Basemap';
          description.id = 'Type: number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id); REQUIRED';
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
            return choice['list name'] === list;
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
          return choice['list name'] === type.split(' ')[1];
        });
        type = 'select one [' + _.pluck(choices, 'name').join(', ') + ']';
      }
      return type;
    }

    function loadDataModel(dataModel) {
      var deferred = $q.defer(); // init promise
      // Load the survey
      readCSV(dataModel.survey_file, function (surveyFields) {
        dataModel.survey = surveyFields;
        // Load the choices
        if (dataModel.choices_file) {
          readCSV(dataModel.choices_file, function (choicesFields) {
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
        if (key === 'orientation_data' || key === '_3d_structures') {
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
