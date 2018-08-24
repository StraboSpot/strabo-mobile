(function () {
  'use strict';

  angular
    .module('app')
    .controller('ArchiveTilesController', ArchiveTilesController);

  ArchiveTilesController.$inject = ['$ionicLoading', '$ionicModal', '$ionicPopup', '$log', '$q', '$scope', '$state',
    'LocalStorageFactory', 'MapFactory', 'MapLayerFactory', 'MapViewFactory', 'OfflineTilesFactory', 'SlippyTileNamesFactory'];

  function ArchiveTilesController($ionicLoading, $ionicModal, $ionicPopup, $log, $q, $scope, $state,
                                  LocalStorageFactory, MapFactory, MapLayerFactory, MapViewFactory, OfflineTilesFactory,
                                  SlippyTileNamesFactory) {
    var vm = this;
    var mapExtent;
    var mapLayer;

    vm.checkedZooms = [];
    vm.downloading = false;
    vm.downloadingModal = {};
    vm.map = {};
    vm.maps = [];
    vm.outerZoomMax = 0;
    vm.outerZoomsAll = {'tilesNeed': [], 'tilesHave': []};
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
          'currentZoom': Math.round(mapExtent.zoom),
          'percentDownload': -1,
          'progress': {},
          'status': '',
          'tiles': {
            'need': [],
            'saved': []
          }
        });

        vm.outerZoomMax = vm.map.currentZoom - 1;
        var zoomLevels = vm.map.maxZoom ? Math.min(vm.map.maxZoom - vm.map.currentZoom + 1, 5) : 5;
        _.times(zoomLevels, function (n) {
          var zoom = vm.map.currentZoom + n;
          vm.zoomOptions.push({
            'zoom': zoom,
            'tilesNeed': [],
            'tilesHave': []
          });
        });
        loadSavedMaps();
        countOuterZooms();
      }

      //here

      $ionicModal.fromTemplateUrl('app/maps/offline-maps/downloading-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.downloadingModal = modal;
      });
    }

    function checkForSavedTile(tileId) {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().mapTilesDb.getItem(mapLayer.get('id') + '/' + tileId)
        .then(function (savedTile) {
          if (savedTile) vm.outerZoomsAll.tilesHave.push({'tile': tileId, 'size': savedTile.size});
          else vm.outerZoomsAll.tilesNeed.push(tileId);
          deferred.resolve();
        });
      return deferred.promise;
    }

    function continueDownload() {
      OfflineTilesFactory.checkValidMapName(vm.map).then(function () {
        vm.downloadingModal.show();
        vm.submitBtnText = 'Saving map . . . please wait.';
        vm.downloading = true;
        saveMap(vm.map).then(function (statusMsg) {
          $ionicLoading.hide();
          vm.downloading = false;
          $ionicPopup.alert({
            'title': 'Download Finished!',
            'template': statusMsg
          }).then(function () {
            resetZoomOptions();
          });
        }, function (statusMsg) {
          $ionicLoading.hide();
          vm.downloading = false;
          $ionicPopup.alert({
            'title': 'Download Failed!',
            'template': statusMsg
          }).then(function () {
            resetZoomOptions();
          });
        });
      });
    }

    function countOuterZooms() {
      var promises = [];
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Calculating Outer Zoom Tiles...'});

      var currentZoom = vm.zoomOptions[0].zoom;
      var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft,
        currentZoom);

      var tilesToCheck = ['0/0/0'];
      var x = 0;
      var y = 0;
      var z = 0;
      promises.push(checkForSavedTile('0/0/0'));
      _.each(currentZoomTileArray, function (currentTile) {
        x = 0;
        y = 0;
        z = 0;
        while (z < vm.outerZoomMax) {
          var regex = /(\d*)\/(\d*)\/(\d*)/g;
          var match = regex.exec(currentTile);
          var endX = match[2];
          var endY = match[3];

          var zDiff = currentZoom - z;      // Difference btwn current zoom of map and zoom of tiles being checked
          var d = Math.pow(2, zDiff);       // Dimension of the tile grid
          var col = endX - d * x;           // Column number
          var row = endY - d * y;           // Row number
          x = col < (d / 2) ? 2 * x : 2 * x + 1;
          y = row < (d / 2) ? 2 * y : 2 * y + 1;
          z++;
          var tileId = z + '/' + x + '/' + y;
          if (!_.contains(tilesToCheck, tileId)) {
            tilesToCheck.push(tileId);
            promises.push(checkForSavedTile(tileId));
          }
        }
      });

      $q.all(promises).then(function () {
        //$log.log(vm.outerZoomsAll);
        updateSelectedDownloads();
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

    function resetZoomOptions() {
      vm.outerZoomsAll.tilesHave = [];
      vm.outerZoomsAll.tilesNeed = [];
      countOuterZooms();
      _.each(vm.zoomOptions, function (z, i) {
        if (vm.checkedZooms[i]) countTiles(i);
      });
      vm.checkedZooms = [];
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
      if (vm.checkedZooms[i]) {
        vm.zoomOptions[i].tilesNeed = [];
        vm.zoomOptions[i].tilesHave = [];
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Calculating Tiles...'});
        var promises = [];
        var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft,
          vm.zoomOptions[i].zoom);
        _.each(_.flatten(currentZoomTileArray), function (tile) {
          var promise = LocalStorageFactory.getDb().mapTilesDb.getItem(mapLayer.get('id') + '/' + tile).then(
            function (savedTile) {
              if (savedTile) vm.zoomOptions[i].tilesHave.push(savedTile);
              else vm.zoomOptions[i].tilesNeed.push(tile);
            });
          promises.push(promise);
        });

        $q.all(promises).then(function () {
            //$log.log(vm.zoomOptions);
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
      vm.map.tiles.need = vm.outerZoomsAll.tilesNeed;
      vm.map.tiles.saved = vm.outerZoomsAll.tilesHave;
      _.each(vm.checkedZooms, function (checkedZoom, i) {
        if (checkedZoom) {
          vm.map.tiles.need = _.union(vm.map.tiles.need, vm.zoomOptions[i].tilesNeed);
          vm.map.tiles.saved = _.union(vm.map.tiles.saved, vm.zoomOptions[i].tilesHave);
        }
      });
      if (vm.map.tiles.need.length === 0) vm.submitBtnText = '0 Tiles Selected To Download';
      else vm.submitBtnText = 'Download ' + vm.map.tiles.need.length + ' Tiles';
      $ionicLoading.hide();
    }
  }
}());
