'use strict';

angular.module('app')
  .controller('ArchiveTilesCtrl', function(
    $scope,
    ViewExtentFactory,
    SlippyTileNamesFactory) {

    var mapExtent = ViewExtentFactory.getExtent();

    // is the map zoom greater or equal to 15?
    if (mapExtent.zoom >= 15) {
      // yes, then we can allow the user to download inner zoomed tiles
      $scope.showDownload = true;
    } else {
      // no, because the download would be too much to handle
      $scope.showDownload = false;
    }

    // name of the map
    $scope.mapName;

    // is the user choosing to download inner zooms?  default is false
    $scope.downloadZooms = {
      checked: false
    };

    // an estimation of the cost to download tiles
    $scope.estimate = {
      numberOfTiles: null,
      byteSize: null
    };

    // the maximum allowable zoom download for any given map
    var maxZoomToDownload = 18;



    // estimates how many tiles would be downloaded
    var estimateArchiveTile = function() {

      var tileArray = [];
      var zoom = mapExtent.zoom;

      if ($scope.downloadZooms.checked) {

        while (zoom <= maxZoomToDownload) {
          var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft, zoom);
          tileArray.push(currentZoomTileArray)

          zoom++;
        }

      } else {
        tileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft, zoom);
      }

      $scope.estimate.numberOfTiles = _.flatten(tileArray).length;
      $scope.estimate.byteSize = (_.flatten(tileArray).length) * SlippyTileNamesFactory.getAvgTileBytes();

    }

    estimateArchiveTile();



    var archiveTiles = function() {

      console.log(mapExtent);

      // updateCurrentVisibleLayer();


      // var zoom = mapViewExtent.zoom;

      // // we shouldn't cache when the zoom is less than 17 due to possible usage restrictions
      // if (mapViewExtent.zoom >= 15) {

      //   // lets download from the current zoom all the way to the maximum zoom
      //   while (zoom <= maxZoomToDownload) {
      //     var tileArray = SlippyTileNamesFactory.getTileIds(mapViewExtent.topRight, mapViewExtent.bottomLeft, zoom);
      //     tileArray.forEach(function(tileId) {
      //       OfflineTilesFactory.downloadTileToStorage(currentVisibleLayer, tileId, function() {
      //         // update the tile count
      //         $scope.updateOfflineTileCount();
      //       });
      //     });

      //     zoom++;
      //   }
      // } else {
      //   alert("Zoom in closer to download tiles");
      // }


    }




    $scope.onChangeDownloadZooms = function() {
      // update the estimation
      estimateArchiveTile();
    }


    $scope.submit = function() {
      console.log("submit");

      // TODO: do the actual download
    }

  });