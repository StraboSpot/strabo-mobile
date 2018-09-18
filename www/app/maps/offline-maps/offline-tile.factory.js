(function () {
  'use strict';

  angular
    .module('app')
    .factory('OfflineTilesFactory', OfflineTilesFactory);

  OfflineTilesFactory.$inject = ['$cordovaFileTransfer', '$http', '$ionicLoading', '$ionicPopup', '$log', '$q', '$timeout', 'LocalStorageFactory'];

  // used to determine what the map provider is before we archive a tileset
  function OfflineTilesFactory($cordovaFileTransfer, $http, $ionicLoading, $ionicPopup, $log, $q, $timeout, LocalStorageFactory) {
    var downloadErrors = 0;
    var offlineMaps = [];

    return {
      'checkValidMapName': checkValidMapName,
      'clear': clear,
      'deleteMap': deleteMap,
      'getMapCenterTile': getMapCenterTile,
      'getOfflineMaps': getOfflineMaps,
      'getOfflineTileCount': getOfflineTileCount,
      'read': read,
      'renameMap': renameMap,
      'writeMap': writeMap
    };

    /**
     *  Private Functions
     */

    function writeMap(mapToSave, mapSize) {
      var deferred = $q.defer(); // init promise
      var mapNameData = {
        'source': mapToSave.source,
        'id': mapToSave.id,
        'title': mapToSave.title,
        'size': mapSize,
        'mapid': mapToSave.mapid,
        'existCount': mapToSave.existCount,
        'date': new Date().toLocaleString()
      };

      // If there's already a maps with this name (if appending) remove maps first
      offlineMaps = _.reject(offlineMaps, function (offlineMap) {
        return offlineMap.name === mapToSave.name;
      });

      LocalStorageFactory.getDb().mapNamesDb.setItem(mapToSave.name, mapNameData).then(function () {
        offlineMaps.push(_.extend(mapNameData, {'name': mapToSave.name}));
        deferred.resolve();
      });
      return deferred.promise;
    }


    /**
     * Public Functions
     */
    function checkValidMapName(map) {
      var deferred = $q.defer(); // init promise
      var foundOfflineMap = _.find(offlineMaps, function (offlineMap) {
        return offlineMap.name === map.name;
      });
      if (foundOfflineMap && map.id === foundOfflineMap.id) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Append Tiles?',
          'template': 'Append the current tiles to saved map <b>' + map.name + '</b>?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            $ionicLoading.show({'template': '<ion-spinner></ion-spinner>'});
            deferred.resolve();
          }
          else deferred.reject();
        });
      }
      else if (foundOfflineMap && map.id !== foundOfflineMap.id) {
        $ionicPopup.alert({
          'title': 'Append Error!',
          'template': 'Cannot append the selected new tiles to the saved map <b>' + map.name + '</b> since the map' +
          ' tile provider is not the same. A new map name must be given if you wish to use a different tile provider.'
        });
        deferred.reject();
      }
      // If the map name doesn't exist yet, create it with a size 0
      else {
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner>'});
        //create a unique id to use when storing tiles:
        map.mapid = new Date().valueOf();
        map.existCount = 0;
        writeMap(map, 0).then(function () {
          deferred.resolve();
        });
      }
      return deferred.promise;
    }

    // Wipe the offline database
    function clear(maps) {
      // deletes all offline tiles
      var deferred = $q.defer();
      offlineMaps = [];
      LocalStorageFactory.clearFiles(maps).then(function(){ //clear tile zips and caches
        // then delete all map names
        LocalStorageFactory.getDb().mapNamesDb.clear(function (err) {
          if (err) deferred.reject(err);
        else deferred.resolve();
        });
      },function(error){
        deferred.resolve(error);
      });
      return deferred.promise;
    }

    function deleteMap(mapToDelete) {
      var deferred = $q.defer();
      LocalStorageFactory.deleteMapFiles(mapToDelete).then(function() {
        LocalStorageFactory.getDb().mapNamesDb.removeItem(mapToDelete.name).then(function () {
          // Map is deleted, and this is now fully resolved
          offlineMaps = _.reject(offlineMaps, function (offlineMap) {
            return offlineMap.name === mapToDelete.name;
          });
          deferred.resolve();
        });
      },function(){
        $log.log('LocalStorageFactory.deleteMapFiles failed to resolve.');
        deferred.resolve();
      });
      return deferred.promise;
    }

    // Get the center of the map based on offline tiles
    function getMapCenterTile(mapid) {
      return LocalStorageFactory.getMapCenterTile(mapid);
    }

    function getOfflineMaps() {
      var deferred = $q.defer();
      if (_.isEmpty(offlineMaps)) {
        LocalStorageFactory.getDb().mapNamesDb.iterate(function (value, key) {
          var map = _.extend(value, {'name': key});
          offlineMaps.push(map);
        }, function () {
          deferred.resolve(offlineMaps);
        });
      }
      else deferred.resolve(offlineMaps);
      return deferred.promise;
    }

    // Get the number of tiles from offline maps
    function getOfflineTileCount() {
      var deferred = $q.defer();
      var totalcount = 0;
      LocalStorageFactory.getDb().mapNamesDb.iterate(function (value, key) {
        if(value.existCount) {

          totalcount = totalcount + value.existCount;

        }
      }, function () {
        deferred.resolve(totalcount);
      });
      return deferred.promise;
    }

    // Read from storage
    function read(mapProvider, tile, callback) {
      tile=tile.replace(/\//g,'_');
      var tileId = tile + '.png';
      LocalStorageFactory.getTile(mapProvider, tileId).then(function (blob) {
        callback(blob);
      });
    }

    function renameMap(mapToRename, newMapName) {
      var deferred = $q.defer();
      offlineMaps = _.reject(offlineMaps, function (offlineMap) {
        return offlineMap.name === mapToRename.name;
      });
      LocalStorageFactory.getDb().mapNamesDb.removeItem(mapToRename.name).then(function () {
        delete mapToRename.name;
        LocalStorageFactory.getDb().mapNamesDb.setItem(newMapName, mapToRename).then(function () {
          offlineMaps.push(_.extend(mapToRename, {'name': newMapName}));
          deferred.resolve();
        });
      });
      return deferred.promise;
    }
  }
}());
