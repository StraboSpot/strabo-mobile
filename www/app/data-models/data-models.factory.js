(function () {
  'use strict';

  angular
    .module('app')
    .factory('DataModelsFactory', DataModelsFactory);

  DataModelsFactory.$inject = ['$log', '$http'];

  function DataModelsFactory($log, $http) {
    return {
      'readCSV': readCSV
    };

    /**
     * Private Functions
     */

    // Remove objects created without a label and name (that is objects created from blank lines
    // as well as the default start and end objects)
    function cleanJson(json) {
      return _.filter(json.data, function (obj) {
        return obj.name && obj.label;
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
              'complete': function (json) {
                $log.log('Parsed csv: ', json);
                callback(cleanJson(json));
              }
            });
          }
        }
      );
    }
  }
}());
