angular.module('app')

.controller("OfflineMapCtrl", function(
  $scope,
  OfflineTilesFactory,
  SlippyTileNamesFactory,
  $ionicPopup) {

  // number of tiles we have in offline storage
  $scope.numOfflineTiles = 0;

  // a collection of maps
  $scope.maps = {
    maps: null
  };

  var refreshOfflineMapList = function() {
    OfflineTilesFactory.getMaps().then(function(maps) {
      $scope.maps.maps = maps;
    });
  };

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
  };

  // lets update the count right now
  refreshAndUpdateCount();

  $scope.clearOfflineTile = function() {
    var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Tiles',
        template: "Are you sure you want to delete <b>ALL</b> offline tiles?"
      });
    confirmPopup.then(function(res) {
      if (res) {
        // ok, lets delete now because the user has confirmed ok
        OfflineTilesFactory.clear(function (err) {
          refreshAndUpdateCount();
          $ionicPopup.alert({
            title: 'Alert!',
            template: "Offline tiles are now empty."
          });
        });
      }
    });
  };

  $scope.edit = function(map) {
    // console.log("edit");

    showMapRenamePopup(map.name);
  };

  $scope.delete = function(map) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Saved Map',
      template: "Are you sure you want to delete the saved offline map <b>" + map.name + "</b>?"
    });
    confirmPopup.then(function(res) {
      if (res) {
        OfflineTilesFactory.deleteMap(map).then(function () {
          // console.log("this map has been deleted");
          refreshAndUpdateCount();
        });
      }
    });
  };

  var showMapRenamePopup = function(mapName) {
    $scope.mapDetail = {};

    // rename popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="mapDetail.newName">',
      title: 'Enter New Map Name',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
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
        }
      ]
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
