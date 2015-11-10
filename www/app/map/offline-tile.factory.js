(function () {
  'use strict';

  angular
    .module('app')
    .factory('OfflineTilesFactory', OfflineTilesFactory);

  OfflineTilesFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  // used to determine what the map provider is before we archive a tileset
  function OfflineTilesFactory($log, $q, LocalStorageFactory) {
    var currentMapProvider = null;
    var mapProviders;

    activate();

    return {
      'clear': clear,
      'deleteMap': deleteMap,
      'downloadTileToStorage': downloadTileToStorage,
      'getCurrentMapProvider': getCurrentMapProvider,
      'getMaps': getMaps,
      'getOfflineTileCount': getOfflineTileCount,
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

    function downloadAndSave(mapProvider, tile) {
      var deferred = $q.defer(); // init promise

      // first we download
      var download = downloadInternetMapTile(mapProvider, tile);
      download.then(function (blob) {
        // the download was successful, so we should save next
        var save = write(mapProvider, tile, blob);
        save.then(function (size) {
          deferred.resolve(size);
        });
      }, function (error) {
        // the download failed (network error), but we still want to resolve
        $log.log(error);
        deferred.resolve();
      }, function (tileId) {
        // passing the notification up the promise chain
        deferred.notify(tileId);
      });

      return deferred.promise;
    }

    // Download from internet
    function downloadInternetMapTile(mapProvider, tile) {
      var deferred = $q.defer(); // init promise

      var mapTileProvider = getMapTileProvider(mapProvider);
      var url = getRandomElement(mapTileProvider.url);
      var mime = mapTileProvider.mime;

      var imageUrl = url + tile + '.' + mapTileProvider.imageType;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', imageUrl, true);
      xhr.responseType = 'arraybuffer';

      // test that the network is accessible
      xhr.onload = function (e) {
        // $log.log('status is', this.status);

        if (this.status === 200) {
          // Note: .response instead of .responseText
          var blob = new Blob([this.response], {
            'type': mime
          });
          // $log.log('downloaded tile ', tile);
          deferred.resolve(blob);
        }
        else {
          // uh oh, we shouldn't even be here -- this should be captured by the onerror handler
          $log.log('xhr network was ok but status was not 200 - critical error');
          deferred.reject('xhr network was ok but status was not 200 - critical error');
        }
      };

      // 404 errors and other network errors
      xhr.onerror = function (e) {
        $log.log('on error triggered');
        deferred.reject('could not download due to 404 or other network error');
      };

      xhr.onprogress = function (e) {
        // Notify that we are downloading the tile
        deferred.notify(tile);
      };

      xhr.send();

      return deferred.promise;
    }

    function getMapTileProvider(id) {
      return _.find(mapProviders, function (provider) {
        return provider.id === id;
      });
    }

    // Randomly select an element from an array
    function getRandomElement(ary) {
      var num = _.random(0, ary.length - 1);
      return ary[num];
    }

    function mapNameWrite(mapName, mapProvider, data, size) {
      var deferred = $q.defer(); // init promise

      var mapNameData = {
        'mapProvider': mapProvider,
        'tileArray': data,
        'size': size
      };

      LocalStorageFactory.mapNamesDb.setItem(mapName, mapNameData).then(function () {
        // $log.log('saved map name ', mapName);
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
        'mime': 'image/png'
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
        'mime': 'image/jpeg'
      }, {
        'id': 'macrostratGeologic',
        'name': 'Macrostrat - Geologic',
        'url': [
          'http://macrostrat.org/tiles/geologic/'
        ],
        'imageType': 'png',
        'mime': 'image/png'
      }];
    }

    /**
     * Public Functions
     */

    // Wipe the offline database
    function clear(callback) {
      // deletes all offline tiles
      LocalStorageFactory.mapTilesDb.clear(function (err) {
        if (err) {
          callback(err);
        }
        else {
          // then delete all map names
          LocalStorageFactory.mapNamesDb.clear(function (err) {
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

      // $log.log('map: ', map);

      // first get all the tiles associated with this map name
      var tiles = map.tileArray;

      // an array of promises
      var promises = [];

      // loop through the tiles and build an delete promise for each tile
      tiles.forEach(function (tile) {
        var tileId = map.mapProvider + '/' + tile;
        var promise = LocalStorageFactory.mapTilesDb.removeItem(tileId);
        promises.push(promise);
      });

      $q.all(promises).then(function () {
        // all the tile associated with this map name has been deleted

        // now delete the actual map name
        LocalStorageFactory.mapNamesDb.removeItem(map.name)
          .then(function () {
            // map is deleted, and this is now fully resolved
            deferred.resolve();
          });
      });
      return deferred.promise;
    }

    function downloadTileToStorage(options, callback) {
      var deferred = $q.defer(); // init promise

      var mapName = options.mapName;
      var mapProvider = options.mapProvider;
      var tiles = options.tiles;

      // clone the tiles array, we use this to determine what tiles are left to download
      // so we can notify back to the deferral
      var tilesRemainingToBeDownload = tiles.slice();

      // the size of our total tile download
      var tileSize = 0;

      // array of promises
      var promises = [];

      // now save all the tiles -- loop through the tiles array
      tiles.forEach(function (tile, index, ary) {
        // stash each tile download as a promise
        var promise = downloadAndSave(mapProvider, tile);
        promise.then(function (size) {
          // $log.log('downloadTileTostorage size:', size);
          tileSize += size;
        }, function (err) {
          $log.log('error: downloadTileToStorage-tiles', err);
        }, function (tileId) {
          // notify

          // update the tilesRemainingToBeDownload based on what has just been downloaded
          tilesRemainingToBeDownload = _.filter(tilesRemainingToBeDownload, function (elem) {
            return elem !== tileId;
          });

          // we notify what tile number has been completed, as well as the total num of tiles
          deferred.notify([
            tiles.length - tilesRemainingToBeDownload.length,
            tiles.length
          ]);
        });

        // our promise is now built -- push this promise onto the promises array
        promises.push(promise);
      });

      // check that all promises have been fulfilled
      $q.all(promises)
        .then(function () {
          // now save the map name, passing in the tileSize
          mapNameWrite(mapName, mapProvider, tiles, tileSize)
            .then(function () {
              // everything is fully downloaded
              deferred.resolve();
            });
        }, function (err) {
          $log.log('error: downloadTileToStorage-all', err);
        });

      return deferred.promise;
    }

    function getCurrentMapProvider() {
      return currentMapProvider;
    }

    function getMaps() {
      var deferred = $q.defer();

      var maps = [];

      LocalStorageFactory.mapNamesDb.iterate(function (value, key) {
        maps.push({
          'name': key,
          'mapProvider': value.mapProvider,
          'tileArray': value.tileArray,
          'size': value.size
        });
      }, function () {
        deferred.resolve(maps);
      });
      return deferred.promise;
    }

    // Get the number of tiles from offline storage
    function getOfflineTileCount(callback) {
      LocalStorageFactory.mapTilesDb.length(function (err, numberOfKeys) {
        callback(err || numberOfKeys);
      });
    }

    // Read from storage
    function read(mapProvider, tile, callback) {
      // note that tileId is prefixed with mapProvider, tile itself is not
      var tileId = mapProvider + '/' + tile;
      $log.log('factory, ', tileId);

      LocalStorageFactory.mapTilesDb.getItem(tileId).then(function (blob) {
        callback(blob);
      });
    }

    function renameMap(mapName, newMapName) {
      var deferred = $q.defer();

      // the new map tileIds that we will copy into from the current map
      var newMapTileIds;

      // get the existing mapname
      LocalStorageFactory.mapNamesDb.getItem(mapName).then(function (tileIds) {
        // create a new map name, with the existing mapname contents
        LocalStorageFactory.mapNamesDb.setItem(newMapName, tileIds).then(function () {
          // now delete the actual map name
          LocalStorageFactory.mapNamesDb.removeItem(mapName).then(function () {
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

      LocalStorageFactory.mapTilesDb.setItem(tileId, blob).then(function () {
        // $log.log('wrote tileId ', tileId, blob.size);
        deferred.resolve(blob.size);
      });
      return deferred.promise;
    }
  }
}());
