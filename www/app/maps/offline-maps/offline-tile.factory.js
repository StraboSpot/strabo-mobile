(function () {
  'use strict';

  angular
    .module('app')
    .factory('OfflineTilesFactory', OfflineTilesFactory);

  OfflineTilesFactory.$inject = ['$http', '$ionicPopup', '$log', '$q', 'LocalStorageFactory'];

  // used to determine what the map provider is before we archive a tileset
  function OfflineTilesFactory($http, $ionicPopup, $log, $q, LocalStorageFactory) {
    var downloadErrors = 0;
    var offlineMaps = [];

    return {
      'checkValidMapName': checkValidMapName,
      'clear': clear,
      'deleteMap': deleteMap,
      'getOfflineMaps': getOfflineMaps,
      'getOfflineTileCount': getOfflineTileCount,
      'read': read,
      'renameMap': renameMap,
      'saveMap': saveMap
    };

    /**
     *  Private Functions
     */

    function downloadTile(mapToSave, tile) {
      var deferred = $q.defer(); // init promise

      var url = _.sample(mapToSave.url);
      if (mapToSave.source === 'mapbox_classic') url = url + mapToSave.id + '/';
      else if (mapToSave.source === 'mapbox_styles') url = url + mapToSave.id + '/tiles/256/';
      else if (mapToSave.source === 'map_warper') url = url + mapToSave.id + '/';
      var imageUrl = url + tile;
      if (mapToSave.imageType) imageUrl += '.' + mapToSave.imageType;
      if (mapToSave.key) imageUrl = imageUrl + '?access_token=' + mapToSave.key;

      var request = $http({
        'method': 'get',
        'url': imageUrl,
        'responseType': 'arraybuffer'
      });
      request.then(function (response) {
        var blob = new Blob([response.data], {
          'type': mapToSave.mime
        });
        writeTile(mapToSave, tile, blob).then(function (size) {
          deferred.resolve(size);
        });
      }, function (response) {
        // Request Failure
        downloadErrors += 1;
        deferred.reject(response);
      });
      return deferred.promise;
    }

    function writeMap(mapToSave, mapSize) {
      var deferred = $q.defer(); // init promise
      var mapNameData = {
        'source': mapToSave.source,
        'id': mapToSave.id,
        'title': mapToSave.title,
        'tileArray': mapToSave.tiles.saved,
        'size': mapSize,
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

    // Write tile to storage
    function writeTile(mapToSave, tile, blob) {
      var deferred = $q.defer(); // init promise

      // note that tileId is prefixed with map_id, tile itself is not
      var tileId = mapToSave.id + '/' + tile;
      LocalStorageFactory.getDb().mapTilesDb.setItem(tileId, blob).then(function () {
        deferred.resolve(blob.size);
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
            var savedTilesUnion = _.union(map.tiles.saved, foundOfflineMap.tileArray);
            map.tiles.saved = _.uniq(savedTilesUnion, false, 'tile');
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
      else deferred.resolve();
      return deferred.promise;
    }

    // Wipe the offline database
    function clear(callback) {
      // deletes all offline tiles
      offlineMaps = [];
      LocalStorageFactory.getDb().mapTilesDb.clear(function (err) {
        if (err) callback(err);
        else {
          // then delete all map names
          LocalStorageFactory.getDb().mapNamesDb.clear(function (err) {
            if (err) callback(err);
            else callback();
          });
        }
      });
    }

    function deleteTile(tile) {
      var deferred = $q.defer();
      LocalStorageFactory.getDb().mapTilesDb.removeItem(tile).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function deleteMap(mapToDelete) {
      var deferred = $q.defer();
      var promises = [];
      var tiles = mapToDelete.tileArray;
      var tilesStillUsed = [];

      _.each(offlineMaps, function (offlineMap) {
        if (mapToDelete.name !== offlineMap.name) {
          var offlineMapTiles = angular.fromJson(angular.toJson(offlineMap.tileArray));
          _.each(offlineMapTiles, function (offlineMapTile) {
            offlineMapTile.map_id = offlineMap.id;
          });
          _.extend(tilesStillUsed, offlineMapTiles);
        }
      });
      _.uniq(tilesStillUsed);

      _.each(tiles, function (tile) {
        var found = _.find(tilesStillUsed, function (tileStillUsed) {
          return (tileStillUsed.id === mapToDelete.id && tileStillUsed.tile === tile.tile);
        });
        if (!found) promises.push(deleteTile(mapToDelete.id + '/' + tile.tile));
      });

      // All tiles associated with this maps name and not used in another maps have been deleted
      // now delete the actual map name if there were actually any tiles deleted
      $q.all(promises).then(function () {
        LocalStorageFactory.getDb().mapNamesDb.removeItem(mapToDelete.name).then(function () {
          // Map is deleted, and this is now fully resolved
          offlineMaps = _.reject(offlineMaps, function (offlineMap) {
            return offlineMap.name === mapToDelete.name;
          });
          deferred.resolve();
        });
      });
      return deferred.promise;
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

    // Get the number of tiles from offline storage
    function getOfflineTileCount(callback) {
      LocalStorageFactory.getDb().mapTilesDb.length(function (err, numberOfKeys) {
        callback(err || numberOfKeys);
      });
    }

    // Read from storage
    function read(mapProvider, tile, callback) {
      var tileId = mapProvider + '/' + tile;
      LocalStorageFactory.getDb().mapTilesDb.getItem(tileId).then(function (blob) {
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

    function saveMap(mapToSave) {
      var deferred = $q.defer(); // init promise
      downloadErrors = 0;
      var tilesDownloaded = {'success': [], 'failed': []};
      var promises = [];

      if (mapToSave.tiles.need.length > 0) {
        $log.log('Requesting to download', mapToSave.tiles.need.length, 'tiles from ', mapToSave.id,
          'for map', mapToSave.name);
        _.each(mapToSave.tiles.need, function (tile) {
          var promise = downloadTile(mapToSave, tile).then(function (size) {
            tilesDownloaded.success.push(tile);
            mapToSave.tiles.saved.push({'tile': tile, 'size': size});
            deferred.notify(tilesDownloaded);
          }, function (err) {
            $log.log('Error downloading tile:', err);
            tilesDownloaded.failed.push(tile);
            deferred.notify(tilesDownloaded);
          });
          promises.push(promise);
        });
      }

      $q.all(promises).then(function () {
        $log.log('Number of errors:', downloadErrors);
        if (downloadErrors !== 0 && downloadErrors === mapToSave.tiles.need.length) deferred.reject();
        else {
          // Calculate the size of tiles we have in storage for this map
          var mapSize = _.reduce(_.pluck(mapToSave.tiles.saved, 'size'), function (memo, num) {
            return memo + num;
          }, 0);
          writeMap(mapToSave, mapSize).then(function () {
            $log.log('Saved map:', mapToSave.name, 'with tiles from', mapToSave.title, 'of size',
              mapSize, ':',
              mapToSave.tiles.saved);
            deferred.resolve();
          });
        }
      });
      return deferred.promise;
    }
  }
}());
