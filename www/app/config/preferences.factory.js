(function () {
  'use strict';

  angular
    .module('app')
    .factory('PreferencesFactory', PreferencesFactory);

  PreferencesFactory.$inject = ['$log', '$q', 'DataModelsFactory', 'LocalStorageFactory'];

  function PreferencesFactory($log, $q, DataModelsFactory, LocalStorageFactory) {
    var csvFile = 'app/data-models/Preferences.csv';
    var data = {};
    var survey = {};

    return {
      'getPreferencesData': getPreferencesData,
      'getSurvey': getSurvey,
      'loadPreferences': loadPreferences,         // Run from app config
      'save': save
    };

    /**
     * Private Functions
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

    function setSurvey(inSurvey) {
      survey = inSurvey;
      $log.log('Finished loading preferences survey: ', survey);
    }

    /**
     * Public Functions
     */

    function getPreferencesData() {
      return data;
    }

    function getSurvey() {
      return survey;
    }

    // Load the preferences data and survey
    function loadPreferences() {
      $log.log('Loading preferences ....');
      var dataPromise = all().then(function (savedData) {
        data = savedData;
        $log.log('Finished loading preferences: ', data);
      });
      $log.log('Loading preferences survey ....');
      DataModelsFactory.readCSV(csvFile, setSurvey);
      return dataPromise;
    }

    function save(newData) {
      LocalStorageFactory.configDb.clear().then(function () {
        data = newData;
        _.forEach(data, function (value, key, list) {
          LocalStorageFactory.configDb.setItem(key, value);
        });
        $log.log('Saved preferences: ', data);
      });
    }
  }
}());
