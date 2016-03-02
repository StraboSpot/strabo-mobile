(function () {
  'use strict';

  angular
    .module('app')
    .factory('PreferencesFactory', PreferencesFactory);

  PreferencesFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function PreferencesFactory($log, $q, LocalStorageFactory) {
    var data = {};
    var survey = {};

    return {
      'getPreferencesData': getPreferencesData,
      'getSurvey': getSurvey,
      'loadPreferences': loadPreferences,         // Run from app config
      'save': save
    };

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
        LocalStorageFactory.getDb().projectDb.getItem('preferences').then(function (savedPreferences) {
          if (savedPreferences) {
            data = savedPreferences;
            $log.log('Finished loading preferences: ', savedPreferences);
          }
          else $log.log('No saved preferences.');
          deferred.resolve();
        });
      }
      else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function save(newData) {
      data = newData;
      LocalStorageFactory.getDb().projectDb.setItem('preferences', data).then(function () {
        $log.log('Saved preferences: ', data);
      });
    }
  }
}());
