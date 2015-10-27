(function () {
  'use strict';

  angular
    .module('app')
    .service('LocalStorage', LocalStorage);

  function LocalStorage() {
    // localforage is the global for offline map tiles
    var mapTilesDb = localforage.createInstance({
      // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
      'name': 'offlineMapTiles'
    });

    // global LF for map names
    var mapNamesDb = localforage.createInstance({
      // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
      'name': 'MapNames'
    });

    // global LF for spot data
    var spotsDb = localforage.createInstance({
      // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
      'name': 'Spots'
    });

    // global LF for configuration data
    var configDb = localforage.createInstance({
      // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
      'name': 'Config'
    });

    return {
      'mapTilesDb': mapTilesDb,
      'mapNamesDb': mapNamesDb,
      'spotsDb': spotsDb,
      'configDb': configDb
    };
  }
}());
