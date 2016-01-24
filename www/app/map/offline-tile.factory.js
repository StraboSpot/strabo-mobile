(function () {
  'use strict';

  angular
    .module('app')
    .factory('OfflineTilesFactory', OfflineTilesFactory);

  OfflineTilesFactory.$inject = ['$http', '$ionicPopup', '$log', '$q', 'LocalStorageFactory'];

  // used to determine what the map provider is before we archive a tileset
  function OfflineTilesFactory($http, $ionicPopup, $log, $q, LocalStorageFactory) {
    var currentMapProvider = null;
    var mapProviders;
    var downloadErrors = 0;

    activate();

    return {
      'checkValidMapName': checkValidMapName,
      'clear': clear,
      'deleteMap': deleteMap,
      'getCurrentMapProvider': getCurrentMapProvider,
      'getMapProviders': getMapProviders,
      'getMaps': getMaps,
      'getOfflineTileCount': getOfflineTileCount,
      'getOfflineTileSize': getOfflineTileSize,
      'read': read,
      'renameMap': renameMap,
      'saveMaps': saveMaps,
      'setCurrentMapProvider': setCurrentMapProvider
    };

    /**
     *  Private Functions
     */

    function activate() {
      setMapProviders();
    }

    function downloadTile(tile) {
      var deferred = $q.defer(); // init promise

      var mapProviderInfo = _.findWhere(mapProviders, {'id': tile.tile_provider});
      var url = _.sample(mapProviderInfo.url);
      var imageUrl = url + tile.tile_id + '.' + mapProviderInfo.imageType;
      if (mapProviderInfo.key) imageUrl = imageUrl + '?' + mapProviderInfo.key;

      var request = $http({
        'method': 'get',
        'url': imageUrl,
        'responseType': 'arraybuffer'
      });
      request.then(function (response) {
        // Request Success
        // $log.log('Downloaded tile', mapProviderInfo.id + '/' + tile.tile_id, 'Response: ', response);
        var blob = new Blob([response.data], {
          'type': mapProviderInfo.mime
        });
        writeTile(mapProviderInfo.id, tile.tile_id, blob).then(function (size) {
          deferred.resolve(size);
        });
      }, function (response) {
        // Request Failure
        downloadErrors += 1;
        deferred.reject(response);
      });
      return deferred.promise;
    }

    function setMapProviders() {
      mapProviders = [{
        'id': 'osm',
        'name': 'OSM Standard',
        'url': [
          'http://a.tile.openstreetmap.org/',
          'http://b.tile.openstreetmap.org/',
          'http://c.tile.openstreetmap.org/'
        ],
        'imageType': 'png',
        'mime': 'image/png',
        'maxZoom': 18
      }, {
        'id': 'mqSat',
        'name': 'MapQuest - Satellite',
        'url': [
          'http://otile1-s.mqcdn.com/tiles/1.0.0/sat/',
          'http://otile2-s.mqcdn.com/tiles/1.0.0/sat/',
          'http://otile3-s.mqcdn.com/tiles/1.0.0/sat/',
          'http://otile4-s.mqcdn.com/tiles/1.0.0/sat/'
        ],
        'imageType': 'jpg',
        'mime': 'image/jpeg'
      }, {
        'id': 'mqOsm',
        'name': 'MapQuest - OSM',
        'url': [
          'http://otile1-s.mqcdn.com/tiles/1.0.0/osm/',
          'http://otile2-s.mqcdn.com/tiles/1.0.0/osm/',
          'http://otile3-s.mqcdn.com/tiles/1.0.0/osm/',
          'http://otile4-s.mqcdn.com/tiles/1.0.0/osm/'
        ],
        'imageType': 'jpg',
        'mime': 'image/jpeg',
        'maxZoom': 18
      }, {
        'id': 'macrostratGeologic',
        'name': 'Macrostrat - Geologic',
        'url': [
          'http://macrostrat.org/tiles/geologic/'
        ],
        'imageType': 'png',
        'mime': 'image/png',
        'maxZoom': 13
      }, {
        'id': 'mbSat',
        'name': 'Mapbox Satellite',
        'url': [
          'http://a.tiles.mapbox.com/v4/mapbox.satellite/',
          'http://b.tiles.mapbox.com/v4/mapbox.satellite/',
          'http://c.tiles.mapbox.com/v4/mapbox.satellite/',
          'http://d.tiles.mapbox.com/v4/mapbox.satellite/'
        ],
        'imageType': 'jpg',
        'mime': 'image/jpeg',
        'maxZoom': 19,
        'key': 'access_token=pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg'
      }, {
        'id': 'mbTopo',
        'name': 'Mapbox Topo',
        'url': [
          'http://a.tiles.mapbox.com/v4/mapbox.outdoors/',
          'http://b.tiles.mapbox.com/v4/mapbox.outdoors/',
          'http://c.tiles.mapbox.com/v4/mapbox.outdoors/',
          'http://d.tiles.mapbox.com/v4/mapbox.outdoors/'
        ],
        'imageType': 'jpg',
        'mime': 'image/jpeg',
        'maxZoom': 19,
        'key': 'access_token=pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg'
      }];
    }

    function writeMap(mapName, mapProvider, mapSize, tiles) {
      var deferred = $q.defer(); // init promise
      var mapNameData = {
        'mapProvider': mapProvider,
        'tileArray': tiles,
        'size': mapSize,
        'date': new Date().toLocaleString()
      };

      LocalStorageFactory.getDb().mapNamesDb.setItem(mapName, mapNameData).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    // Write tile to storage
    function writeTile(mapProvider, tile, blob) {
      var deferred = $q.defer(); // init promise

      // note that tileId is prefixed with mapProvider, tile itself is not
      var tileId = mapProvider + '/' + tile;
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
      LocalStorageFactory.getDb().mapNamesDb.getItem(map.name).then(function (savedMap) {
        if (!savedMap) deferred.resolve(true, null);
        else if (savedMap && map.mapProvider !== savedMap.mapProvider) {
          $ionicPopup.alert({
            'title': 'Duplicate Map Name!',
            'template': 'There is already a saved map with the name ' + map.name + ' and this map uses a different ' +
            'tile provider. Delete the saved map  ' + map.name + ' before trying to save a map with the same name.'
          });
          deferred.resolve(false, null);
        }
        else {
          var confirmPopup = $ionicPopup.confirm({
            'title': 'Duplicate Map Name!',
            'template': 'There is already a saved map with the name ' + map.name + '. Append the current tiles to saved map?'
          });
          confirmPopup.then(function (res) {
            if (res) {
              // console.log(savedMap.tileArray);
              // $log.log(map.tiles.saved);
              var savedTilesUnion = _.union(map.tiles.saved, savedMap.tileArray);
              map.tiles.saved = _.uniq(savedTilesUnion, false, 'tile_id');
              // $log.log(map.tiles.saved);
              deferred.resolve(true, map.tiles.saved);
            }
            else deferred.resolve(false, null);
          });
        }
      });
      return deferred.promise;
    }

    // Wipe the offline database
    function clear(callback) {
      // deletes all offline tiles
      LocalStorageFactory.getDb().mapTilesDb.clear(function (err) {
        if (err) {
          callback(err);
        }
        else {
          // then delete all map names
          LocalStorageFactory.getDb().mapNamesDb.clear(function (err) {
            if (err) {
              callback(err);
            }
            else {
              callback();
            }
          });
        }
      });
    }

    function deleteMap(map) {
      var deferred = $q.defer();
      var promises = [];
      var tiles = map.tileArray;
      var tilesStillUsed = [];

      LocalStorageFactory.getDb().mapNamesDb.iterate(function (value, key) {
        if (map.name !== key) tilesStillUsed.push(value.tileArray);
      }).then(function () {
        tilesStillUsed = _.uniq(_.flatten(tilesStillUsed));
        // Loop through the tiles and build an delete promise for each tile we no longer need
        tiles.forEach(function (tile) {
          var deferred2 = $q.defer();
          if (!_.findWhere(tilesStillUsed, tile)) {
            LocalStorageFactory.getDb().mapTilesDb.removeItem(tile.tile_provider + '/' + tile.tile_id).then(
              function () {
                deferred2.resolve();
              });
            promises.push(deferred2.promise);
          }
        });
      });

      // All tiles associated with this map name and not used in another map have been deleted
      // now delete the actual map name if there were actually any tiles deleted
      $q.all(promises).then(function () {
        LocalStorageFactory.getDb().mapNamesDb.removeItem(map.name)
          .then(function () {
            // Map is deleted, and this is now fully resolved
            deferred.resolve();
          });
      });
      return deferred.promise;
    }

    function getCurrentMapProvider() {
      return currentMapProvider;
    }

    function getMapProviders() {
      return mapProviders;
    }

    function getMaps() {
      var deferred = $q.defer();

      var maps = [];

      LocalStorageFactory.getDb().mapNamesDb.iterate(function (value, key) {
        maps.push({
          'name': key,
          'mapProvider': value.mapProvider,
          'tileArray': value.tileArray,
          'size': value.size,
          'date': value.date
        });
      }, function () {
        deferred.resolve(maps);
      });
      return deferred.promise;
    }

    // Get the number of tiles from offline storage
    function getOfflineTileCount(callback) {
      LocalStorageFactory.getDb().mapTilesDb.length(function (err, numberOfKeys) {
        callback(err || numberOfKeys);
      });
    }

    // Get the number of tiles from offline storage
    function getOfflineTileSize(callback) {
      var size = 0;
      LocalStorageFactory.getDb().mapTilesDb.iterate(function (value) {
        size += value.size;
      }).then(function () {
        callback(size);
      });
    }

    // Read from storage
    function read(mapProvider, tile, callback) {
      var tileId = mapProvider + '/' + tile;
      LocalStorageFactory.getDb().mapTilesDb.getItem(tileId).then(function (blob) {
        callback(blob);
      });
    }

    function renameMap(mapName, newMapName) {
      var deferred = $q.defer();
      // get the existing mapname
      LocalStorageFactory.getDb().mapNamesDb.getItem(mapName).then(function (tileIds) {
        // create a new map name, with the existing mapname contents
        LocalStorageFactory.getDb().mapNamesDb.setItem(newMapName, tileIds).then(function () {
          // now delete the actual map name
          LocalStorageFactory.getDb().mapNamesDb.removeItem(mapName).then(function () {
            // map is deleted, and this is now fully resolved
            deferred.resolve();
          });
        });
      });
      return deferred.promise;
    }

    function saveMaps(mapsToSave) {
      var deferred = $q.defer(); // init promise

      // array of promises
      var promises = [];
      _.each(mapsToSave, function (mapToSave) {
        if (mapToSave.tiles.need.length > 0) {
          $log.log('Requesting to download', mapToSave.tiles.need.length, 'tiles from ', mapToSave.mapProvider, 'for map', mapToSave.name);
          mapToSave.tiles.downloaded = {'success': [], 'failed': []};
          _.each(mapToSave.tiles.need, function (tile) {
            var deferred2 = $q.defer(); // init promise
            var promise = downloadTile(tile).then(function (size) {
              tile.size = size;
              // $log.log('Finished downloading and saving tile', tile.tile_id + '/' + tile.tile_id, 'size:', tile.size);
              mapToSave.tiles.downloaded.success.push(tile);
              mapToSave.tiles.saved.push(tile);
              deferred.notify(mapToSave.tiles.downloaded);
              deferred2.resolve();
            }, function (err) {
              $log.log('Error downloading tile:', err);
              mapToSave.tiles.downloaded.failed.push(tile);
              deferred.notify(mapToSave.tiles.downloaded);
              deferred2.reject(err);
            });
            promises.push(promise);
          });
        }
      });

      // When all promises have been fulfilled
      $q.all(promises).then(function () {
        if (downloadErrors > 0) $log.log('Number of errors:', downloadErrors);
        _.each(mapsToSave, function (mapToSave) {
          // Calculate the size of tiles we have in storage for this map
          var mapSize = _.reduce(_.pluck(mapToSave.tiles.saved, 'size'), function (memo, num) {
            return memo + num;
          }, 0);
          writeMap(mapToSave.name, mapToSave.mapProvider, mapSize, mapToSave.tiles.saved).then(function () {
            $log.log('Saved map:', mapToSave.name, 'from', mapToSave.mapProvider, 'with size', mapSize, ':', mapToSave.tiles.saved);
            deferred.resolve();
          });
        });
      });
      return deferred.promise;
    }

    function setCurrentMapProvider(mapProvider) {
      currentMapProvider = mapProvider;
    }
  }
}());
