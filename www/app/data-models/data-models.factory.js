(function () {
  'use strict';

  angular
    .module('app')
    .factory('DataModelsFactory', DataModelsFactory);

  DataModelsFactory.$inject = ['$log', '$http'];

  function DataModelsFactory($log, $http) {
    var dataModels = {
      '_3dstructures_survey': 'app/data-models/Tab3DStructures.csv',
      '_3dstructures_choices': 'app/data-models/Tab3DStructures-choices.csv',
      'preferences': 'app/data-models/Preferences.csv',
      'project': 'app/data-models/ProjectsPage.csv',
      'rock_description_survey': 'app/data-models/rockdescription.csv',
      'rock_description_choices': 'app/data-models/rockdescription-choices.csv',
      'sample_survey': 'app/data-models/TabSample.csv',
      'sample_choices': 'app/data-models/TabSample-choices.csv',
      'tools': 'app/data-models/Tools.csv',
      'traces_survey': 'app/data-models/traces.csv',
      'traces_choices': 'app/data-models/traces-choices.csv'
    };

    return {
      'dataModels': dataModels,
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

    /**
     * Public Functions
     */

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
