angular.module('app')

.controller("OfflineMapCtrl", function(
  $scope,
  OfflineTilesFactory,
  SlippyTileNamesFactory,
  $ionicPopup) {

  // number of tiles we have in offline storage
  $scope.numOfflineTiles = 0;

  // a collection of maps
  $scope.maps;

  var refreshOfflineMapList = function() {
    OfflineTilesFactory.getMaps().then(function(maps) {
      maps.forEach(function(map) {
        // update each map with its map provider
        map.mapProvider = map.tileIds[0].split('/')[0];

        // get all the zooms for each map
        var zooms = _.map(map.tileIds, function(tileId) {
          // return just the zoom
          return tileId.split('/')[1];
        });

        // assign min/max zooms for each map
        map.minZoom = _.min(zooms);
        map.maxZoom = _.max(zooms);

        // get the tile that matches the minimum zoom
        var mapViewTile = _.find(map.tileIds, function(tileId) {
          return tileId.split('/')[1] == map.minZoom;
        });

        // convert the tile X/Y into coordinates
        var mapViewTileSplitArray = mapViewTile.split('/');
        mapViewTile = [
          SlippyTileNamesFactory.tile2long(parseInt(mapViewTileSplitArray[2]), map.minZoom),
          SlippyTileNamesFactory.tile2lat(parseInt(mapViewTileSplitArray[3]), map.minZoom),
          parseInt(map.minZoom)
        ];

        // assign mapViewTile for each map
        map.mapViewTile = mapViewTile;
      });
      $scope.maps = maps;
    });
  }

  var updateOfflineTileCount = function() {
    // get the image count
    OfflineTilesFactory.getOfflineTileCount(function(count) {
      // console.log(count);
      $scope.$apply(function() {
        // update the number of offline tiles to scope
        $scope.numOfflineTiles = count;
      });

    });
  };

  var refreshAndUpdateCount = function() {
    refreshOfflineMapList();
    updateOfflineTileCount();
  }

  // lets update the count right now
  refreshAndUpdateCount();

  $scope.clearOfflineTile = function() {
    if (window.confirm("Do you want to delete ALL offline tiles?")) {
      // ok, lets delete now because the user has confirmed ok
      OfflineTilesFactory.clear(function(err) {
        refreshAndUpdateCount();
        alert('Offline tiles are now empty');
      });
    }
  };

  $scope.edit = function(map) {
    // console.log("edit");

    showMapRenamePopup(map.name);
  }

  $scope.delete = function(map) {
    var string = "Do you want to delete this map: " + map.name + "?";
    if (window.confirm(string)) {
      OfflineTilesFactory.deleteMap(map)
        .then(function() {
          // console.log("this map has been deleted");
          refreshAndUpdateCount();
        });
    }
  }

  var showMapRenamePopup = function(mapName) {
    $scope.mapDetail = {}

    // rename popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="mapDetail.newName">',
      title: 'Enter new map name',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.mapDetail.newName) {
            //don't allow the user to close unless he enters the new name
            e.preventDefault();
          } else {
            return $scope.mapDetail.newName;
          }
        }
      }]
    });

    myPopup.then(function(name) {
      if (name) {
        // rename the map
        OfflineTilesFactory.renameMap(mapName, $scope.mapDetail.newName)
          .then(function() {
            refreshAndUpdateCount();
          });
      }
    });
  };


});
