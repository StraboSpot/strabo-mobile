(function () {
  'use strict';

  angular
    .module('app')
    .factory('OfflineTilesFactory', OfflineTilesFactory);

  OfflineTilesFactory.$inject = ['$http', '$log', '$q', 'LocalStorageFactory'];

  // used to determine what the map provider is before we archive a tileset
  function OfflineTilesFactory($http, $log, $q, LocalStorageFactory) {
    var currentMapProvider = null;
    var mapProviders;
    var downloadErrors = 0;

    activate();

    return {
      'clear': clear,
      'deleteMap': deleteMap,
      'downloadTileToStorage': downloadTileToStorage,
      'getCurrentMapProvider': getCurrentMapProvider,
      'getMapProviders': getMapProviders,
      'getMaps': getMaps,
      'getOfflineTileCount': getOfflineTileCount,
      'getOfflineTileSize': getOfflineTileSize,
      'read': read,
      'renameMap': renameMap,
      'setCurrentMapProvider': setCurrentMapProvider,
      'write': write
    };

    /**
     *  Private Functions
     */

    function activate() {
      setMapProviders();
    }

    function downloadAndSave(mapProviderInfo, tile) {
      var deferred = $q.defer(); // init promise

      var url = _.sample(mapProviderInfo.url);
      var imageUrl = url + tile + '.' + mapProviderInfo.imageType;
      if (mapProviderInfo.key) imageUrl = imageUrl + '?' + mapProviderInfo.key;

      var request = $http({
        'method': 'get',
        'url': imageUrl,
        'responseType': 'arraybuffer'
      });
      request.then(function (response) {
        // Request Success
        // $log.log('Downloaded tile', mapProviderInfo.id + '/' + tile, 'Response: ', response);
        var blob = new Blob([response.data], {
          'type': mapProviderInfo.mime
        });
        write(mapProviderInfo.id, tile, blob).then(function (size) {
          deferred.resolve(size);
        });
      }, function (response) {
        // Request Failure
        downloadErrors += 1;
        deferred.reject(response);
      });
      return deferred.promise;
    }

    function mapNameWrite(mapName, tileProvider, allTiles) {
      var deferred = $q.defer(); // init promise

      // Get map tiles requested only for this provider
      var thisMapTiles = _.filter(allTiles, function (tile) {
        return tile.tile_provider === tileProvider;
      });
      // Get map tiles for this provider that are actually in storage (this is, have the 'save' key)
      var savedMapTiles = _.filter(thisMapTiles, function (tile) {
        return _.has(tile, 'size');
      });
      // Calculate the size of tiles we have in storage for this map
      var totalSize = _.reduce(_.pluck(savedMapTiles, 'size'), function (memo, num) {
        return memo + num;
      }, 0);

      var mapNameData = {
        'mapProvider': tileProvider,
        'tileArray': savedMapTiles,
        'size': totalSize,
        'date': new Date().toLocaleString()
      };

      LocalStorageFactory.getDb().mapNamesDb.setItem(mapName, mapNameData).then(function () {
        $log.log('saved map name ', mapName);
        deferred.resolve();
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

    /**
     * Public Functions
     */

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

    function downloadTileToStorage(options, callback) {
      var deferred = $q.defer(); // init promise
      var tiles = options.tiles;
      $log.log('Requesting to download', tiles.need.length, 'tiles ...');

      var tilesSuccess = [];
      var tilesFailed = [];
      downloadErrors = 0;

      // array of promises
      var promises = [];
      _.each(tiles.need, function (tile) {
        var deferred2 = $q.defer(); // init promise
        var mapProviderInfo = _.findWhere(mapProviders, {'id': tile.tile_provider});
        // now save all the tiles -- loop through the tiles arrays
        // stash each tile download as a promise
        var promise = downloadAndSave(mapProviderInfo, tile.tile_id).then(function (size) {
          tile.size = size;
          // $log.log('Finished downloading and saving tile', tile.tile_id + '/' + tile.tile_id, 'size:', tile.size);
          tilesSuccess.push(tile);
          deferred.notify({'success': tilesSuccess.length, 'failed': tilesFailed.length});
          deferred2.resolve();
        }, function (err) {
          $log.log('Error downloading tile:', err);
          tilesFailed.push(tile);
          deferred.notify({'success': tilesSuccess.length, 'failed': tilesFailed.length});
          deferred2.reject(err);
        });
        // our promise is now built -- push this promise onto the promises array
        promises.push(promise);
      });

      // When all promises have been fulfilled
      $q.all(promises).then(function () {
        if (downloadErrors > 0) $log.log('Number of errors:', downloadErrors);
        var downloaded = _.compact(_.pluck(tiles.need, 'size'));
        if (!_.isEmpty(downloaded)) {
          var allTiles = _.union(tiles.need, tiles.saved);
          var tileProviders = _.uniq(_.pluck(allTiles, 'tile_provider'));
          _.each(tileProviders, function (tileProvider) {
            var mapName = (tileProvider === 'macrostratGeologic') ? options.mapName + '-macrostratGeologic' : options.mapName;

            LocalStorageFactory.getDb().mapNamesDb.getItem(mapName).then(function (value) {
              if (value) {
                // Delete the map of the same name first then write the new map properties
                value.name = mapName;
                deleteMap(value).then(function () {
                  mapNameWrite(mapName, tileProvider, allTiles)
                    .then(function () {
                      // Everything is fully downloaded
                      deferred.resolve();
                    });
                });
              }
              else {
                // Write the new map properties
                mapNameWrite(mapName, tileProvider, allTiles)
                  .then(function () {
                    // Everything is fully downloaded
                    deferred.resolve();
                  });
              }
            });
          });
        }
        else {
          deferred.reject();
        }
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

    function setCurrentMapProvider(mapProvider) {
      currentMapProvider = mapProvider;
    }

    // Write to storage
    function write(mapProvider, tile, blob) {
      var deferred = $q.defer(); // init promise

      // note that tileId is prefixed with mapProvider, tile itself is not
      var tileId = mapProvider + '/' + tile;
      LocalStorageFactory.getDb().mapTilesDb.setItem(tileId, blob).then(function () {
        deferred.resolve(blob.size);
      });
      return deferred.promise;
    }
  }
}());
