(function () {
  'use strict';

  angular
    .module('app')
    .controller('ArchiveTilesController', ArchiveTilesController);

  ArchiveTilesController.$inject = ['$ionicPopup', '$log', '$q', '$state', 'LocalStorageFactory', 'MapFactory',
    'MapLayerFactory', 'MapViewFactory', 'OfflineTilesFactory', 'SlippyTileNamesFactory'];

  function ArchiveTilesController($ionicPopup, $log, $q, $state, LocalStorageFactory, MapFactory, MapLayerFactory,
                                  MapViewFactory, OfflineTilesFactory, SlippyTileNamesFactory) {
    var vm = this;
    var mapExtent;
    var mapLayer;

    vm.downloading = false;
    vm.estimateArchiveTile = estimateArchiveTile;
    vm.goToMap = goToMap;
    vm.maps = [];
    vm.nameSelectChanged = nameSelectChanged;
    vm.numOfflineTiles = 0;  // number of tiles we have in offline storage
    vm.selectedName = {};
    vm.showNameField = false;
    vm.showSelectName = false;
    vm.submit = submit;
    vm.submitBtnText = '';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.downloading = false;

      mapExtent = MapViewFactory.getMapViewExtent();
      mapLayer = MapLayerFactory.getVisibleLayer();

      vm.map = angular.fromJson(angular.toJson(_.find(MapFactory.getMaps(), function (gotMap) {
        return gotMap.id === mapLayer.get('id');
      })));
      _.extend(vm.map, {
        'currentZoom': mapExtent.zoom,
        'showDownloadInnerZooms': mapExtent.zoom >= 14 && mapExtent.zoom < vm.map.maxZoom,
        'downloadZooms': false,
        'percentDownload': -1,
        'progress': {},
        'status': '',
        'tiles': {
          'need': [],
          'saved': []
        }
      });
      if (!vm.map.maxZoom) vm.map.maxZoom = 19;

      loadSavedMaps();
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

    function loadSavedMaps() {
      OfflineTilesFactory.getOfflineMaps().then(function (maps) {
        vm.maps = angular.fromJson(angular.toJson(maps));
        vm.selectedName = _.last(_.sortBy(vm.maps, 'date'));
        if (vm.selectedName) vm.map.name = vm.selectedName.name;
        vm.showNameField = _.isEmpty(vm.maps);
        vm.showSelectName = !_.isEmpty(vm.maps);
        vm.maps.push({'name': '-- New Offline Map --', 'date': new Date(1970, 1, 1)});
      });
    }

    function saveMap(mapToSave) {
      var deferred = $q.defer(); // init promise

      OfflineTilesFactory.saveMap(mapToSave).then(function () {
        var statusMsg;
        if (_.isEmpty(vm.map.progress) || vm.map.progress.failed === 0) statusMsg = 'SUCCESS! Map saved!';
        else if (vm.map.progress.failed === 1) {
          statusMsg = 'Map saved, however 1 tile was not downloaded. ' +
            'Try saving the map again with the same name to download the missing tile.';
        }
        else if (vm.map.progress.failed > 1) {
          statusMsg = 'Map saved, however ' + vm.map.progress.failed + ' tiles were not downloaded. ' +
            'Try saving the map again with the same name to download the missing tiles.';
        }
        deferred.resolve(statusMsg);
      }, function () {
        deferred.reject('ERROR! No tiles successfully downloaded. Strabo may be unable to contact the tile host' +
          ' or unable to write to local storage.');
      }, function (notify) {
        // Update the progress bar once we receive notifications
        vm.map.percentDownload = Math.ceil(
            ((notify.success.length + notify.failed.length) / vm.map.tiles.need.length) * 100) || 0;
        vm.map.progress = {
          'success': notify.success.length,
          'failed': notify.failed.length,
          'total': vm.map.tiles.need.length
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
      vm.map.tiles.need = [];
      vm.map.tiles.saved = [];

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
        isSavedTile(mapLayer.get('id') + '/' + tile).then(function (savedTileSize) {
          if (savedTileSize) vm.map.tiles.saved.push({'tile': tile, 'size': savedTileSize});
          else vm.map.tiles.need.push(tile);
          deferred.resolve();
        });
        promises.push(deferred.promise);
      });

      $q.all(promises).then(function () {
        if (!_.isEmpty(vm.map.tiles.saved)) {
          $log.log('Have', vm.map.tiles.saved.length, 'of these tiles already:', vm.map.tiles.saved);
        }
        if (!_.isEmpty(vm.map.tiles.need)) {
          $log.log('Need', vm.map.tiles.need.length, 'of these tiles:', vm.map.tiles.need);
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
      if (!vm.map.name) {
        $ionicPopup.alert({
          'title': 'No Name Entered!',
          'template': 'Please give the map a name.'
        });
        return;
      }

      _.extend(vm.map, {
        'tiles': {
          'need': vm.map.tiles.need,
          'saved': vm.map.tiles.saved
        }
      });

      OfflineTilesFactory.checkValidMapName(vm.map).then(function () {
        vm.submitBtnText = 'Saving map . . . please wait.';
        vm.downloading = true;
        saveMap(vm.map).then(function (statusMsg) {
          $ionicPopup.alert({
            'title': 'Download Finished!',
            'template': statusMsg
          }).then(function () {
            activate();
          });
        }, function (statusMsg) {
          $ionicPopup.alert({
            'title': 'Download Failed!',
            'template': statusMsg
          }).then(function () {
            activate();
          });
        });
      });
    }
  }
}());
