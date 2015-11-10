(function () {
  'use strict';

  angular
    .module('app')
    .controller('ArchiveTilesController', ArchiveTilesController);

  ArchiveTilesController.$inject = ['$ionicHistory', '$log', '$state', 'MapViewFactory', 'OfflineTilesFactory',
    'SlippyTileNamesFactory'];

  function ArchiveTilesController($ionicHistory, $log, $state, MapViewFactory, OfflineTilesFactory,
                                  SlippyTileNamesFactory) {
    var vm = this;
    var maxZoomToDownload = 18;  // the maximum allowable zoom download for any given map
    var mapExtent = MapViewFactory.getExtent();

    vm.goToMap = goToMap;
    vm.map = {
      'name': null,             // name of the map
      'tiles': null,            // tiles array of the map region
      'showDownloadMacrostrat': mapExtent.zoom >= 4 && mapExtent.zoom <= 12,
      'downloadMacrostrat': false,
      'showDownloadInnerZooms': mapExtent.zoom >= 12, // Too much data if allow download of inner zooms less than 12
      'downloadZooms': false,
      'percentDownload': 0,
      'overLayPercentDownload': 0,
      'showProgressBar': false,
      'showOverlayProgressBar': false
    };
    vm.numOfflineTiles = 0;  // number of tiles we have in offline storage
    vm.onChangeDownloadZooms = estimateArchiveTile;
    vm.submit = submit;
    vm.updateOfflineTileCount = updateOfflineTileCount;

    activate();

    function activate() {
      estimateArchiveTile();
      updateOfflineTileCount();
    }

    function goToMap() {
      $state.go('app.map');
    }

    function submit(event) {
      // tell the user that we're downloading tiles
      event.target.innerHTML = 'Downloading tiles . . . please wait.';
      // disable the download button
      event.target.disabled = true;

      vm.map.showProgressBar = true;

      if (vm.map.downloadMacrostrat) {
        vm.map.showOverlayProgressBar = true;
      }

      var downloadTileOptions = {
        'mapName': vm.map.name,
        'mapProvider': mapExtent.mapProvider,
        'tiles': vm.map.tiles
      };

      var downloadMacrostratGeologicOptions = {
        'mapName': vm.map.name + '-macrostratGeologic',
        'mapProvider': 'macrostratGeologic',
        'tiles': vm.map.tiles
      };

      function downloadMapTile() {
        return OfflineTilesFactory.downloadTileToStorage(downloadTileOptions);
      }

      function downloadMacrostratGeologic() {
        return OfflineTilesFactory.downloadTileToStorage(downloadMacrostratGeologicOptions);
      }

      // are we downloading macrostrat tiles?
      if (vm.map.downloadMacrostrat) {
        // yes
        downloadMapTile()
          .then(downloadMacrostratGeologic, null, function (notify1) {
            // $log.log('notify1 ', notify1);
            // $log.log('***archiveTiles-notify: ', notify);
            // update the progress bar once we receive notifications
            vm.map.percentDownload = Math.ceil((notify1[0] / notify1[1]) * 100);
          })
          .then(function () {
            // everything has been downloaded, so lets go back a screen
            var backView = $ionicHistory.backView();
            backView.go();
          }, null, function (notify2) {
            // $log.log('***archiveTiles-notify: ', notify);
            // has the second notification kicked in yet?
            if (notify2) {
              // update the progress bar once we receive notifications
              vm.map.overLayPercentDownload = Math.ceil((notify2[0] / notify2[1]) * 100);
            }
          });
      }
      else {
        // no -- are not downloading macrostrat tiles
        downloadMapTile()
          .then(function () {
            // everything has been downloaded, so lets go back a screen
            var backView = $ionicHistory.backView();
            backView.go();
          }, function (error) {
            $log.log('error at downloadMapTile', error);
          }, function (notify) {
            // update the progress bar once we receive notifications
            vm.map.percentDownload = Math.ceil((notify[0] / notify[1]) * 100);
          });
      }
    }

    function updateOfflineTileCount() {
      // get the image count
      OfflineTilesFactory.getOfflineTileCount(function (count) {
        // update the number of offline tiles to scope
        vm.numOfflineTiles = count;
      });
    }

    /* *********************** LOCAL FUNCTIONS *********************** */

    // Estimate how many tiles would be downloaded
    function estimateArchiveTile() {
      var tileArray = [];
      var zoom = mapExtent.zoom;

      // are we downloading inner zooms?
      if (vm.map.downloadZooms) {
        // yes, then loop through all the zoom levels and build our tile array
        while (zoom <= maxZoomToDownload) {
          var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft, zoom);
          tileArray.push(currentZoomTileArray);
          zoom++;
        }
      }
      else {
        // no, get just this zoom level
        tileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft, zoom);
      }
      // update the tile array to the scope
      vm.map.tiles = _.flatten(tileArray);
    }
  }
}());
