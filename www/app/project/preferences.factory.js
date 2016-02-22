(function () {
  'use strict';

  angular
    .module('app')
    .factory('PreferencesFactory', PreferencesFactory);

  PreferencesFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function PreferencesFactory($log, $q, LocalStorageFactory) {
    var data;
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

      LocalStorageFactory.getDb().configDb.iterate(function (value, key) {
        config[key] = value;
      }, function () {
        deferred.resolve(config);
      });
      return deferred.promise;
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

    // Load the preferences data
    function loadPreferences() {
      var deferred = $q.defer(); // init promise
      if (_.isEmpty(data)) {
        $log.log('Loading preferences ....');
        all().then(function (savedData) {
          data = savedData;
          $log.log('Finished loading preferences: ', data);
          deferred.resolve();
        });
      }
      else deferred.resolve();
      return deferred.promise;
    }

    function save(newData) {
      LocalStorageFactory.getDb().configDb.clear().then(function () {
        data = newData;
        _.forEach(data, function (value, key, list) {
          LocalStorageFactory.getDb().configDb.setItem(key, value);
        });
        $log.log('Saved preferences: ', data);
      });
    }
  }
}());
