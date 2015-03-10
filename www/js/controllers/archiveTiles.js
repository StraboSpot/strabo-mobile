'use strict';

angular.module('app')
  .controller('ArchiveTilesCtrl', function(
    $scope,
    $ionicHistory,
    ViewExtentFactory,
    SlippyTileNamesFactory,
    OfflineTilesFactory) {

    // get the mapExtent from its service upon entering this script
    var mapExtent = ViewExtentFactory.getExtent();

    // is the map zoom greater or equal to 15?
    if (mapExtent.zoom >= 15) {
      // yes, then we can allow the user to download inner zoomed tiles
      $scope.showDownload = true;
    } else {
      // no, because the download would be too much to handle
      $scope.showDownload = false;
    }

    // map variables
    $scope.map = {
      // name of the map
      name: null,
      // tiles array of the map region
      tiles: null,
      tilesSizeString: null,
      downloadZooms: false,
      percentDownload: 0,
      overLayPercentDownload: 0,
      showProgressBar: false
    };

    // number of tiles we have in offline storage
    $scope.numOfflineTiles = 0;

    // the maximum allowable zoom download for any given map
    var maxZoomToDownload = 18;

    // estimates how many tiles would be downloaded
    var estimateArchiveTile = function() {

      var tileArray = [];
      var zoom = mapExtent.zoom;

      // are we downloading inner zooms?
      if ($scope.map.downloadZooms) {
        // yes, then loop through all the zoom levels and build our tile array
        while (zoom <= maxZoomToDownload) {
          var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft, zoom);
          tileArray.push(currentZoomTileArray)
          zoom++;
        }

      } else {
        // no, get just this zoom level
        tileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft, zoom);
      }

      // update the tile array to the scope
      $scope.map.tiles = _.flatten(tileArray);

      // get average tile byte size
      $scope.map.tilesSizeString = bytesToSize($scope.map.tiles.length * SlippyTileNamesFactory.getAvgTileBytes());
    }

    // run the estimate right now
    estimateArchiveTile();

    $scope.updateOfflineTileCount = function() {
      // get the image count
      OfflineTilesFactory.getOfflineTileCount(function(count) {
        $scope.$apply(function() {
          // update the number of offline tiles to scope
          $scope.numOfflineTiles = count;
        });

      });
    };

    // lets update the count right now
    $scope.updateOfflineTileCount();

    $scope.onChangeDownloadZooms = function() {
      // update the estimation when the user toggles whether to download inner zooms
      estimateArchiveTile();
    };

    $scope.submit = function(event) {

      // tell the user that we're downloading tiles
      event.target.innerHTML = "Download tiles... please wait";
      // disable the download button
      event.target.disabled = true;

      $scope.map.showProgressBar = true;

      if (!$scope.map.name) {
        alert('Name required.');
        return;
      }

      var downloadTileOptions = {
        mapName: $scope.map.name,
        mapProvider: mapExtent.mapProvider,
        tiles: $scope.map.tiles
      };

      var downloadMacrostratGeologicOptions = {
        mapName: $scope.map.name + '-macrostratGeologic',
        mapProvider: 'macrostratGeologic',
        tiles: $scope.map.tiles
      };

      // start the download
      // OfflineTilesFactory.downloadTileToStorage(downloadTileOptions).then(function() {
      //   // console.log("***archiveTiles-done: archiving tiles all completed");
      //   // everything has been downloaded, so lets go back a screen
      //   var backView = $ionicHistory.backView();
      //   backView.go();
      // }, function(error) {
      //   console.log("error at OfflineTilesFactory.downloadTileToStorage", error);
      // }, function(notify) {
      //   // console.log("***archiveTiles-notify: ", notify);
      //
      //   // update the progress bar once we receive notifications
      //   $scope.map.percentDownload = Math.ceil((notify[0] / notify[1]) * 100);
      //
      // });


      var downloadMapTile = function() {
        return OfflineTilesFactory.downloadTileToStorage(downloadTileOptions);
      };

      var downloadMacrostratGeologic = function() {
        return OfflineTilesFactory.downloadTileToStorage(downloadMacrostratGeologicOptions);
      };

      downloadMapTile()
        .then(downloadMacrostratGeologic, null, function(notify1) {
          // console.log("notify1 ", notify1);
          // console.log("***archiveTiles-notify: ", notify);
          // update the progress bar once we receive notifications
          $scope.map.percentDownload = Math.ceil((notify1[0] / notify1[1]) * 100);
        })
        .then(function() {
          // everything has been downloaded, so lets go back a screen
          var backView = $ionicHistory.backView();
          backView.go();
        }, null, function(notify2) {
          // console.log("***archiveTiles-notify: ", notify);
          // has the second notification kicked in yet?
          if (notify2) {
            // update the progress bar once we receive notifications
            $scope.map.overLayPercentDownload = Math.ceil((notify2[0] / notify2[1]) * 100);
          }
        });








    };

  });
