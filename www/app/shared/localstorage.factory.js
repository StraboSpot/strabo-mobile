(function () {
  'use strict';

  angular
    .module('app')
    .factory('LocalStorageFactory', LocalStorageFactory);

  function LocalStorageFactory() {
    var configDb = {};        // global LocalForage for configuration data
    var config2Db = {};       // global LocalForage for user and project data
    var mapNamesDb = {};      // global LocalForage for map names
    var mapTilesDb = {};      // global LocalForage for offline map tiles
    var projectDb = {};       // global LocalForage for configuration data
    var spotsDb = {};         // global LocalForage for spot data

    activate();

    return {
      'configDb': configDb,
      'config2Db': config2Db,
      'mapNamesDb': mapNamesDb,
      'mapTilesDb': mapTilesDb,
      'projectDb': projectDb,
      'spotsDb': spotsDb
    };

    function activate() {
      setConfigDb();
      setConfig2Db();
      setMapNamesDb();
      setMapTilesDb();
      setProjectDb();
      setSpotsDb();
    }

    function setConfigDb() {
      configDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'Config'
      });
    }

    function setConfig2Db() {
      config2Db = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'Config2'
      });
    }

    function setMapNamesDb() {
      mapNamesDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'MapNames'
      });
    }

    function setMapTilesDb() {
      mapTilesDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'offlineMapTiles',
        'size': 2000000000              // Default size is just under 5MB, changed here to 2GB
      });
    }

    function setProjectDb() {
      projectDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'Project'
      });
    }

    function setSpotsDb() {
      spotsDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'Spots',
        'size': 2000000000              // Default size is just under 5MB, changed here to 2GB
      });
    }
  }
}());
