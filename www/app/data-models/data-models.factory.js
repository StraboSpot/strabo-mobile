(function () {
  'use strict';

  angular
    .module('app')
    .factory('DataModelsFactory', DataModelsFactory);

  DataModelsFactory.$inject = ['$log', '$http', '$q'];

  function DataModelsFactory($log, $http, $q) {
    var dataModels2 = {
      '_3d_structures': {
        'survey_file': 'app/data-models/Tab3DStructures.csv',
        'choices_file': 'app/data-models/Tab3DStructures-choices.csv'
      },
      'orientation_data': {
        'linear_orientation': {
          'survey_file': 'app/data-models/linear-orientation-survey.csv',
          'choices_file': 'app/data-models/linear-orientation-choices.csv'
        },
        'planar_orientation': {
          'survey_file': 'app/data-models/planar-orientation-survey.csv',
          'choices_file': 'app/data-models/planar-orientation-choices.csv'
        },
        'tabular_orientation': {
          'survey_file': 'app/data-models/tabular-zone-orientation-survey.csv',
          'choices_file': 'app/data-models/tabular-zone-orientation-choices.csv'
        }
      },
      'preferences': {
        'survey_file': 'app/data-models/Preferences.csv'
      },
      'project': {
        'survey_file': 'app/data-models/ProjectsPage.csv'
      },
      'rock_unit': {
        'survey_file': 'app/data-models/rock-unit.csv',
        'choices_file': 'app/data-models/rock-unit-choices.csv'
      },
      'sample': {
        'survey_file': 'app/data-models/TabSample.csv',
        'choices_file': 'app/data-models/TabSample-choices.csv'
      },
      'tools': {
        'survey_file': 'app/data-models/Tools.csv'
      },
      'traces': {
        'survey_file': 'app/data-models/traces.csv',
        'choices_file': 'app/data-models/traces-choices.csv'
      }
    };

    var dataModels = {
      '_3dstructures_survey': 'app/data-models/Tab3DStructures.csv',
      '_3dstructures_choices': 'app/data-models/Tab3DStructures-choices.csv',
      'linear_orientation_survey': 'app/data-models/linear-orientation-survey.csv',
      'linear_orientation_choices': 'app/data-models/linear-orientation-choices.csv',
      'orientation_survey': 'app/data-models/orientation.csv',
      'orientation_choices': 'app/data-models/orientation-choices.csv',
      'planar_orientation_survey': 'app/data-models/planar-orientation-survey.csv',
      'planar_orientation_choices': 'app/data-models/planar-orientation-choices.csv',
      'preferences': 'app/data-models/Preferences.csv',
      'project': 'app/data-models/ProjectsPage.csv',
      'rock_unit_survey': 'app/data-models/rock-unit.csv',
      'rock_unit_choices': 'app/data-models/rock-unit-choices.csv',
      'sample_survey': 'app/data-models/TabSample.csv',
      'sample_choices': 'app/data-models/TabSample-choices.csv',
      'tabular_orientation_survey': 'app/data-models/tabular-zone-orientation-survey.csv',
      'tabular_orientation_choices': 'app/data-models/tabular-zone-orientation-choices.csv',
      'tools': 'app/data-models/Tools.csv',
      'traces_survey': 'app/data-models/traces.csv',
      'traces_choices': 'app/data-models/traces-choices.csv'
    };

    var spotDataModel = {};

    return {
      'getSpotDataModel': getSpotDataModel,
      'dataModels': dataModels,
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

    function createSpotDataModel() {
      spotDataModel = {
        'geometry': {
          'coordinates': {},
          'type': 'one of [Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon'
        },
        'properties': {
          '_3d_structures': [],
          'date': 'datetime',
          'id': 'number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)',
          'modified_timestamp': 'timestamp',
          'name': 'Type: text; REQUIRED',
          'orientation_data': [],
          'rock_unit': {},
          'samples': [],
          'time': 'datetime',
          'trace': {}
        },
        'images': [{
          'annotated': 'true/false for whether or not the image is used as an Image Basemap',
          'caption': 'string for the description of the image',
          'height': 'number in pixels',
          'id': 'number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)',
          'orientation_of_view_subject': 'string',
          'scale_of_object': 'string',
          'scale_of_image': 'string',
          'src': 'string for base64 image',
          'title': 'string',
          'view_angle_plunge': 'number',
          'view_angle_trend': 'number',
          'width': 'number in pixels'
        }]
      };

      var models = {
        '_3d_structures': dataModels2._3d_structures,
        'linear_orientation': dataModels2.orientation_data.linear_orientation,
        'planar_orientation': dataModels2.orientation_data.planar_orientation,
        'tabular_orientation': dataModels2.orientation_data.tabular_orientation,
        'rock_unit': dataModels2.rock_unit,
        'samples': dataModels2.sample,
        'trace': dataModels2.traces
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
          description.orientation_type = key;
          description.associated_orientation = [];
          description = sortby(description);
          spotDataModel.properties.orientation_data.push(description);
        }
        else if (key === 'trace' || key === 'rock_unit') {
          _.extend(spotDataModel.properties[key], description);
        }
        else spotDataModel.properties[key].push(description);
      });
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

    function getSpotDataModel() {
      return spotDataModel;
    }

    function loadDataModels() {
      var deferred = $q.defer(); // init promise
      var promises = [];

      $log.log('Loading data models ...');
      _.each(dataModels2, function (dataModel, key) {
        if (key === 'orientation_data') {
          _.each(dataModel, function (orientationDataModel, orientationKey) {
            $log.log('Loading', key, orientationKey, ' ...');
            promises.push(loadDataModel(orientationDataModel));
          });
        }
        else {
          $log.log('Loading', key, ' ...');
          promises.push(loadDataModel(dataModel));
        }
      });
      $q.all(promises).then(function () {
        $log.log('Finished loading all data models', dataModels2);
        createSpotDataModel();
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
