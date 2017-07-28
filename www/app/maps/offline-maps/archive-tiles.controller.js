(function () {
  'use strict';

  angular
    .module('app')
    .controller('ArchiveTilesController', ArchiveTilesController);

  ArchiveTilesController.$inject = ['$ionicLoading', '$ionicPopup', '$log', '$q', '$state', 'LocalStorageFactory',
    'MapFactory', 'MapLayerFactory', 'MapViewFactory', 'OfflineTilesFactory', 'SlippyTileNamesFactory'];

  function ArchiveTilesController($ionicLoading, $ionicPopup, $log, $q, $state, LocalStorageFactory, MapFactory,
                                  MapLayerFactory, MapViewFactory, OfflineTilesFactory, SlippyTileNamesFactory) {
    var vm = this;
    var mapExtent;
    var mapLayer;

    vm.checkedZooms = [];
    vm.downloading = false;
    vm.maps = [];
    vm.selectedName = {};
    vm.showNameField = false;
    vm.showSelectName = false;
    vm.submitBtnText = '0 Tiles Selected To Download';
    vm.zoomOptions = [];

    vm.countTiles = countTiles;
    vm.goToMap = goToMap;
    vm.nameSelectChanged = nameSelectChanged;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      mapExtent = MapViewFactory.getMapViewExtent();
      if (!mapExtent) goToMap();
      else {
        var mapLayers = MapLayerFactory.getVisibleLayers();
        mapLayer = mapLayers.baselayer;
        if (!_.isEmpty(mapLayers.overlays)) {
          $ionicPopup.alert({
            'title': 'Overlay Warning!',
            'template': 'Only the map baselayer will be saved for offline use. Change an overlay to baselayer to save.'
          });
        }

        vm.map = angular.fromJson(angular.toJson(_.find(MapFactory.getMaps(), function (gotMap) {
          return gotMap.id === mapLayer.get('id');
        })));
        _.extend(vm.map, {
          'currentZoom': mapExtent.zoom,
          'percentDownload': -1,
          'progress': {},
          'status': '',
          'tiles': {
            'need': [],
            'saved': []
          }
        });

        var zoomLevels = vm.map.maxZoom ? Math.min(vm.map.maxZoom - Math.round(vm.map.currentZoom) + 1, 5) : 5;
        _.times(zoomLevels, function (n) {
          var zoom = Math.round(vm.map.currentZoom) + n;
          vm.zoomOptions.push({
            'zoom': zoom,
            'tilesNeed': [],
            'tilesHave': []
          });
        });
        loadSavedMaps();
      }
    }

    function continueDownload() {
      OfflineTilesFactory.checkValidMapName(vm.map).then(function () {
        vm.submitBtnText = 'Saving map . . . please wait.';
        vm.downloading = true;
        saveMap(vm.map).then(function (statusMsg) {
          $ionicPopup.alert({
            'title': 'Download Finished!',
            'template': statusMsg
          }).then(function () {
            $state.reload();
          });
        }, function (statusMsg) {
          $ionicPopup.alert({
            'title': 'Download Failed!',
            'template': statusMsg
          }).then(function () {
            $state.reload();
          });
        });
      });
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

    /**
     * Public Functions
     */

    function countTiles(i) {
      if (vm.zoomOptions[i].tilesNeed.length === 0 && vm.zoomOptions[i].tilesHave.length === 0) {
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Calculating Tiles...'});
        var promises = [];
        var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft,
          vm.zoomOptions[i].zoom);
        var tilesSaved = {};
        _.each(_.flatten(currentZoomTileArray), function (tile) {
          var promise = LocalStorageFactory.getDb().mapTilesDb.getItem(mapLayer.get('id') + '/' + tile).then(
            function (savedTile) {
              if (savedTile) vm.zoomOptions[i].tilesHave.push(savedTile);
              else vm.zoomOptions[i].tilesNeed.push(tile);
            });
          promises.push(promise);
        });

        $q.all(promises).then(function () {
            updateSelectedDownloads();
          }
        );
      }
      else updateSelectedDownloads();
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

      if (vm.map.tiles.need.length > 3000) {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Download Warning!',
          template: 'Attempting to download such a large number of tiles at once may cause the app to become <span style="color:red">UNSTABLE</span>. Continue anyway?',
          'cssClass': 'warning-popup'
        });

        confirmPopup.then(function (res) {
          if (res) continueDownload();
        });
      }
      else continueDownload();
    }

    function updateSelectedDownloads() {
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Calculating Total Tiles...'});
      vm.map.tiles.need = [];
      vm.map.tiles.saved = [];
      _.each(vm.checkedZooms, function (checkedZoom, i) {
        if (checkedZoom) {
          vm.map.tiles.need.push(vm.zoomOptions[i].tilesNeed);
          vm.map.tiles.saved.push(vm.zoomOptions[i].tilesHave);
        }
      });
      vm.map.tiles.need = _.flatten(vm.map.tiles.need);
      vm.map.tiles.saved = _.flatten(vm.map.tiles.saved);
      if (vm.map.tiles.need.length === 0) vm.submitBtnText = '0 Tiles Selected To Download';
      else vm.submitBtnText = 'Download ' + vm.map.tiles.need.length + ' Tiles';
      $ionicLoading.hide();
    }
  }
}());
