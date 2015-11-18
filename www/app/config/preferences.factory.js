(function () {
  'use strict';

  angular
    .module('app')
    .factory('PreferencesFactory', PreferencesFactory);

  PreferencesFactory.$inject = ['$log', '$q', 'DataModelsFactory', 'LocalStorageFactory'];

  function PreferencesFactory($log, $q, DataModelsFactory, LocalStorageFactory) {
    var csvFile = 'app/data-models/Preferences.csv';
    var data = {};
    var dataPromise;
    var survey = {};
    var surveyPromise;

    activate();

    return {
      'all': all,
      'dataPromise': dataPromise,
      'getPreferencesData': getPreferencesData,
      'getSurvey': getSurvey,
      'save': save,
      'surveyPromise': surveyPromise
    };

    /**
     * Private Functions
     */

    // Load the preferences data and survey
    function activate() {
      $log.log('Loading preferences ....');
      dataPromise = all().then(function (savedData) {
        data = savedData;
        $log.log('Finished loading preferences: ', data);
      });
      $log.log('Loading preferences survey ....');
      surveyPromise = DataModelsFactory.readCSV(csvFile, setSurvey);
    }

    function setSurvey(inSurvey) {
      survey = inSurvey;
      $log.log('Finished loading preferences survey: ', survey);
    }

    /**
     * Public Functions
     */

    function all() {
      var deferred = $q.defer(); // init promise
      var config = {};

      LocalStorageFactory.configDb.iterate(function (value, key) {
        config[key] = value;
      }, function () {
        deferred.resolve(config);
      });
      return deferred.promise;
    }

    function getPreferencesData() {
      return data;
    }

    function getSurvey() {
      return survey;
    }

    function save(newData) {
      LocalStorageFactory.configDb.clear().then(
        function () {
          data = newData;
          _.forEach(data, function (value, key, list) {
            LocalStorageFactory.configDb.setItem(key, value);
          });
          $log.log('Saved preferences: ', data);
        }
      );
    }
  }
}());
