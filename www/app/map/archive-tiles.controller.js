(function () {
  'use strict';

  angular
    .module('app')
    .controller('ArchiveTilesController', ArchiveTilesController);

  ArchiveTilesController.$inject = ['$ionicPopup', '$log', '$q', '$state', 'LocalStorageFactory', 'MapViewFactory',
    'OfflineTilesFactory', 'SlippyTileNamesFactory'];

  function ArchiveTilesController($ionicPopup, $log, $q, $state, LocalStorageFactory, MapViewFactory,
                                  OfflineTilesFactory, SlippyTileNamesFactory) {
    var vm = this;
    var mapExtent = MapViewFactory.getExtent();

    vm.downloading = false;
    vm.estimateArchiveTile = estimateArchiveTile;
    vm.goToMap = goToMap;
    vm.map = {
      'curentZoom': undefined,
      'name': null,               // name of the map
      'showDownloadMacrostrat': mapExtent.zoom >= 4 && mapExtent.zoom <= 12,
      'downloadMacrostrat': false,
      'showDownloadInnerZooms': false,
      'downloadZooms': false,
      'percentDownload': -1,
      'progress': {},
      'status': ''
    };
    vm.maps = {};
    vm.nameSelectChanged = nameSelectChanged;
    vm.numOfflineTiles = 0;  // number of tiles we have in offline storage
    vm.selectedName = {};
    vm.showNameField = false;
    vm.showSelectName = false;
    vm.submit = submit;
    vm.submitBtnText = '';
    vm.tiles = {};

    activate();

    /**
     * Private Functions
     */

    function activate() {
      OfflineTilesFactory.getMaps().then(function (maps) {
        vm.maps = maps;
        vm.selectedName = _.last(_.sortBy(vm.maps, 'date'));
        if (vm.selectedName) vm.map.name = vm.selectedName.name;
        vm.showNameField = _.isEmpty(vm.maps);
        vm.showSelectName = !_.isEmpty(vm.maps);
        vm.maps.push({'name': '-- New Offline Map --', 'date': new Date(1970, 1, 1)});
      });
      vm.downloading = false;
      vm.map.currentZoom = mapExtent.zoom;
      vm.map.maxZoom = _.findWhere(OfflineTilesFactory.getMapProviders(), {'id': mapExtent.mapProvider}).maxZoom;
      vm.map.showDownloadInnerZooms = mapExtent.zoom >= 14 && mapExtent.zoom < vm.map.maxZoom;
      estimateArchiveTile();
      updateOfflineTileCount();
    }

    function isSavedTile(namedTile) {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().mapTilesDb.getItem(namedTile).then(function (savedTile) {
        if (savedTile) deferred.resolve(savedTile.size);
        else deferred.resolve(undefined);
      });
      return deferred.promise;
    }

    function saveMaps(mapsToSave) {
      var deferred = $q.defer(); // init promise
      OfflineTilesFactory.saveMaps(mapsToSave).then(function () {
        if (mapsToSave.length === 1 && vm.map.progress.failed === 0) vm.map.saveStatus = 'SUCCESS! Map saved!';
        else if (mapsToSave.length > 1 && vm.map.progress.failed === 0) vm.map.saveStatus = 'SUCCESS! Maps saved!';
        else if (mapsToSave.length === 1 && vm.map.progress.failed === 1) {
          vm.map.saveStatus = 'Map saved, however 1 tile was not downloaded. ' +
            'Try saving the map again with the same name to download the missing tile.';
        }
        else if (mapsToSave.length === 1 && vm.map.progress.failed > 1) {
          vm.map.saveStatus = 'Map saved, however ' + vm.map.progress.failed + ' tiles were not downloaded. ' +
            'Try saving the map again with the same name to download the missing tiles.';
        }
        else if (mapsToSave.length > 1 && vm.map.progress.failed === 1) {
          vm.map.saveStatus = 'Maps saved, however 1 tile was not downloaded. ' +
            'Try saving the maps again with the same name to download the missing tile.';
        }
        else if (mapsToSave.length > 1 && vm.map.progress.failed > 1) {
          vm.map.saveStatus = 'Maps saved, however, ' + vm.map.progress.failed + ' tiles were not downloaded.' +
            'Try saving the maps again with the same name to download the missing tiles.';
        }
        deferred.resolve();
      }, function () {
        vm.map.saveStatus = 'ERROR! No tiles successfully downloaded. Strabo may be unable to contact the tile host or unable to write to local storage.';
        deferred.resolve();
      }, function (notify) {
        // Update the progress bar once we receive notifications
        vm.map.percentDownload = Math.ceil(
            ((notify.success.length + notify.failed.length) / vm.tiles.need.length) * 100) || 0;
        vm.map.progress = {
          'success': notify.success.length,
          'failed': notify.failed.length,
          'total': vm.tiles.need.length
        };
      });
      return deferred.promise;
    }

    function updateOfflineTileCount() {
      // get the image count
      OfflineTilesFactory.getOfflineTileCount(function (count) {
        // update the number of offline tiles to scope
        vm.numOfflineTiles = count;
      });
    }

    /**
     * Public Functions
     */

    // Determine tiles to be downloaded
    function estimateArchiveTile() {
      var promises = [];
      var tileArray = [];
      var zoom = mapExtent.zoom;
      vm.tiles.need = [];
      vm.tiles.saved = [];

      // are we downloading inner zooms?
      if (vm.map.downloadZooms) {
        // yes, then loop through all the zoom levels and build our tile array
        while (zoom <= vm.map.maxZoom) {
          var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft, zoom);
          tileArray.push(currentZoomTileArray);
          zoom++;
        }
      }
      else {
        // no, get just this zoom level
        tileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft, zoom);
      }

      _.each(_.flatten(tileArray), function (tile) {
        var deferred = $q.defer(); // init promise
        isSavedTile(mapExtent.mapProvider + '/' + tile).then(function (savedTileSize) {
          if (savedTileSize) vm.tiles.saved.push(
            {'tile_provider': mapExtent.mapProvider, 'tile_id': tile, 'size': savedTileSize});
          else vm.tiles.need.push({'tile_provider': mapExtent.mapProvider, 'tile_id': tile});
          if (vm.map.downloadMacrostrat) {
            isSavedTile('macrostratGeologic/' + tile).then(function (savedGeologicTileSize) {
              if (savedGeologicTileSize) vm.tiles.saved.push(
                {'tile_provider': 'macrostratGeologic', 'tile_id': tile, 'size': savedGeologicTileSize});
              else vm.tiles.need.push({'tile_provider': 'macrostratGeologic', 'tile_id': tile});
              deferred.resolve();
            });
          }
          else deferred.resolve();
        });
        promises.push(deferred.promise);
      });

      $q.all(promises).then(function () {
        if (!_.isEmpty(vm.tiles.saved)) {
          $log.log('Have', vm.tiles.saved.length, 'of these tiles already:', vm.tiles.saved);
        }
        if (!_.isEmpty(vm.tiles.need)) {
          $log.log('Need', vm.tiles.need.length, 'of these tiles:', vm.tiles.need);
        }
        vm.submitBtnText = 'Save this Map';
      });
    }

    function goToMap() {
      $state.go('app.map');
    }

    function nameSelectChanged() {
      if (vm.selectedName.name === '-- New Offline Map --') {
        vm.showNameField = true;
        vm.map.name = '';
      }
      else {
        vm.showNameField = false;
        vm.map.name = vm.selectedName.name;
      }
    }

    function submit() {
      if (vm.map.name) {
        var mapsToSave = [];
        mapsToSave.push({
          'name': vm.map.name,
          'mapProvider': mapExtent.mapProvider,
          'tiles': {
            'need': _.filter(vm.tiles.need, function (tile) {
              return tile.tile_provider === mapExtent.mapProvider;
            }),
            'saved': _.filter(vm.tiles.saved, function (tile) {
              return tile.tile_provider === mapExtent.mapProvider;
            })
          }
        });
        if (vm.map.downloadMacrostrat) {
          mapsToSave.push({
            'name': vm.map.name + '-macrostratGeologic',
            'mapProvider': 'macrostratGeologic',
            'tiles': {
              'need': _.filter(vm.tiles.need, function (tile) {
                return tile.tile_provider === 'macrostratGeologic';
              }),
              'saved': _.filter(vm.tiles.saved, function (tile) {
                return tile.tile_provider === 'macrostratGeologic';
              })
            }
          });
        }

        var promises = [];
        _.each(mapsToSave, function (mapToSave, i) {
          var deferred = $q.defer(); // init promise
          OfflineTilesFactory.checkValidMapName(mapToSave).then(function (valid, newTiles) {
            if (!valid) mapsToSave.splice(i, 1);
            else if (valid && newTiles) mapToSave.tiles.saved = newTiles;
            deferred.resolve();
          });
          promises.push(deferred.promise);
        });

        $q.all(promises).then(function () {
          if (_.size(mapsToSave) > 0) {
            // tell the user that we're saving the map
            vm.submitBtnText = 'Saving map . . . please wait.';
            vm.map.progress = '';
            vm.downloading = true;
            saveMaps(mapsToSave).then(function () {
              activate();
            });
          }
        });
      }
      else {
        $ionicPopup.alert({
          'title': 'No Name Entered!',
          'template': 'Please give the map a name.'
        });
      }
    }
  }
}());
