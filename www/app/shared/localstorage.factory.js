(function () {
  'use strict';

  angular
    .module('app')
    .factory('LocalStorageFactory', LocalStorageFactory);

  function LocalStorageFactory() {
    var mapTilesDb = {};       // LocalForage is the global for offline map tiles
    var mapNamesDb = {};       // global LF for map names
    var spotsDb = {};          // global LF for spot data
    var configDb = {};         // global LF for configuration data
    var projectDb = {};         // global LF for configuration data

    activate();

    return {
      'mapTilesDb': mapTilesDb,
      'mapNamesDb': mapNamesDb,
      'spotsDb': spotsDb,
      'configDb': configDb,
      'projectDb': projectDb
    };

    function activate() {
      setMapTilesDb();
      setMapNamesDb();
      setSpotsDb();
      setConfigDb();
      setProjectDb();
    }

    function setMapTilesDb() {
      mapTilesDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'offlineMapTiles'
      });
    }

    function setMapNamesDb() {
      mapNamesDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'MapNames'
      });
    }

    function setSpotsDb() {
      spotsDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'Spots'
      });
    }

    function setConfigDb() {
      configDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'Config'
      });
    }

    function setProjectDb() {
      projectDb = localforage.createInstance({
        // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
        'name': 'Project'
      });
    }
  }
}());
