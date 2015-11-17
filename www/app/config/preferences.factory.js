(function () {
  'use strict';

  angular
    .module('app')
    .factory('PreferencesFactory', PreferencesFactory);

  PreferencesFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function PreferencesFactory($log, $q, LocalStorageFactory) {
    return {
      'all': all,
      'save': save
    };

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

    function save(data) {
      $log.log('Save: ', data);
      LocalStorageFactory.configDb.clear().then(
        function () {
          _.forEach(data, function (value, key, list) {
            LocalStorageFactory.configDb.setItem(key, value);
          });
        }
      );
    }
  }
}());
