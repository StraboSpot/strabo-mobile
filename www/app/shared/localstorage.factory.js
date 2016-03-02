(function () {
  'use strict';

  angular
    .module('app')
    .factory('LocalStorageFactory', LocalStorageFactory);

  LocalStorageFactory.$inject = ['$log', '$q'];

  function LocalStorageFactory($log, $q) {
    var dbs = {};
    dbs.configDb = {};        // global LocalForage for configuration and user data
    dbs.mapNamesDb = {};      // global LocalForage for map names
    dbs.mapTilesDb = {};      // global LocalForage for offline map tiles
    dbs.projectDb = {};       // global LocalForage for project data
    dbs.spotsDb = {};         // global LocalForage for spot data

    return {
      'setupLocalforage': setupLocalforage,
      'getDb': getDb
    };

    function getDb() {
      return dbs;
    }

    function setupLocalforage() {
      var deferred = $q.defer(); // init promise
      var doInitialize = _.some(dbs, function (db) {
        return _.isEmpty(db);
      });
      if (doInitialize) {
        try {
          localforage.defineDriver(window.cordovaSQLiteDriver).then(function () {
            return localforage.setDriver([
              window.cordovaSQLiteDriver._driver,
              localforage.INDEXEDDB,
              localforage.WEBSQL,
              localforage.LOCALSTORAGE
            ]);
          }).then(function () {
            $log.log('Creating', localforage.driver(), 'databases ... ');
            _.each(dbs, function (db, key) {
              dbs[key] = localforage.createInstance({
                'driver': localforage.driver(),
                'name': key
              });
              $log.log('Created db', key, ':', dbs[key]);
            });
            deferred.resolve(true);
          }).catch(function (err) {
            $log.log(err);
            deferred.resolve(false);
          });
        }
        catch (e) {
          $log.log(e);
          deferred.resolve(false);
        }
      }
      else deferred.resolve(true);

      return deferred.promise;
    }
  }
}());
