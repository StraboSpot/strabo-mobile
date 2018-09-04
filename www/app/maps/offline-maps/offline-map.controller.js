(function () {
  'use strict';

  angular
    .module('app')
    .controller('OfflineMapController', OfflineMapController);

  OfflineMapController.$inject = ['$ionicLoading', '$ionicPopup', '$location', '$log', '$scope', 'MapLayerFactory',
    'MapViewFactory', 'OfflineTilesFactory', 'SlippyTileNamesFactory'];

  function OfflineMapController($ionicLoading, $ionicPopup, $location, $log, $scope, MapLayerFactory,
                                MapViewFactory, OfflineTilesFactory, SlippyTileNamesFactory) {
    var vm = this;
    var deleteMap;

    vm.maps = [];
    vm.numOfflineTiles = 0;       // number of tiles we have in offline storage
    //vm.offlineTilesSize = 0;

    vm.clearOfflineTile = clearOfflineTile;
    vm.deleteTiles = deleteTiles;
    vm.edit = edit;
    vm.goToMap = goToMap;
    //vm.updateOfflineTileSize = updateOfflineTileSize;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner><br>Loading Maps'
      });
      OfflineTilesFactory.getOfflineMaps().then(function (maps) {
        vm.maps = maps;
        $log.log('Offline Maps:', vm.maps);
        OfflineTilesFactory.getOfflineTileCount().then(function (count) {
          // update the number of offline tiles to scope
          $log.log('activate totalcount: ', count);
          vm.numOfflineTiles = count;
          //$scope.$apply();
        });
        //updateOfflineTileSize(vm.maps);
      }).finally(function () {
        $ionicLoading.hide();
      });
    }

    /* ToDo - This function is too slow
    function updateOfflineTileSize() {
      var offlineSize = OfflineTilesFactory.getOfflineTileSize(vm.maps);
      vm.offlineTilesSize = offlineSize.size;
      vm.numOfflineTiles = offlineSize.count;
    }*/

    /**
     * Public Functions
     */

    function clearOfflineTile() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Tiles',
        'template': 'Are you sure you want to delete <b>ALL</b> offline tiles?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          // ok, lets delete now because the user has confirmed ok
          OfflineTilesFactory.clear(function (err) {
            activate();
            $ionicPopup.alert({
              'title': 'Alert!',
              'template': 'Offline tiles are now empty.'
            });
          });
        }
      });
    }

    function deleteTiles(map) {
      deleteMap = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Saved Map',
        'template': 'Are you sure you want to delete the saved offline map <b>' + map.name + '</b>?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          $ionicLoading.show({
            'template': '<ion-spinner></ion-spinner><br>Deleting Map'
          });
          OfflineTilesFactory.deleteMap(map).finally(function () {
            // console.log('this map has been deleted');
            $ionicLoading.hide();
            activate();
          });
        }
        deleteMap = false;
      });
    }

    function edit(map) {
      if (!deleteMap) {
        vm.mapDetail = {};

        // rename popup
        var myPopup = $ionicPopup.show({
          'template': '<input type="text" ng-model="vm.mapDetail.newName">',
          'title': 'Enter New Map Name',
          'scope': $scope,
          'buttons': [
            {'text': 'Cancel'},
            {
              'text': '<b>Save</b>',
              'type': 'button-positive',
              'onTap': function (e) {
                if (!vm.mapDetail.newName) e.preventDefault();
                else return vm.mapDetail.newName;
              }
            }
          ]
        });

        myPopup.then(function (name) {
          if (name) {
            // rename the map
            OfflineTilesFactory.renameMap(map, vm.mapDetail.newName)
              .then(function () {
                activate();
              });
          }
        });
      }
    }

    function goToMap(map) {
      /*
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner>'
      });
      */

      //fix this to work with file system.

      // Check the first 30 tiles and zoom to the tile with the highest zoom

      OfflineTilesFactory.getMapCenter(map.mapid).then(function (center) {
        $log.log('gotcenter: ', center);
      });

      /*
      if (numTilesToCheck <= 0) {
        $ionicPopup.alert({
          'title': 'Not Enough Tiles!',
          'template': 'More tiles need to be added to this map before attempting to view it.'
        });
        $ionicLoading.hide();
      }
      else {
        var x, y, z = -1; // Start zoom at -1 so a 0 zoom with meet the condition testZ > z
        var pattern = /(\d+)\/(\d+)\/(\d+)/; // Format "15/6285/13283"
        for (var i = 0; i < numTilesToCheck; i++) {
          var tileNameParts = pattern.exec(map.tileArray[i].tile);
          if (tileNameParts && tileNameParts.length === 4) {
            var testZ = parseInt(tileNameParts[1]);
            if (testZ > z) {
              z = testZ;
              x = parseInt(tileNameParts[2]);
              y = parseInt(tileNameParts[3]);
            }
          }
        }
        if (x && y && z) {
          var lng = SlippyTileNamesFactory.tile2long(x, z);
          var lat = SlippyTileNamesFactory.tile2lat(y, z);
          MapLayerFactory.setVisibleBaselayer(map.id);
          MapViewFactory.zoomToPoint([lng, lat], z);
          $location.path('/app/map');
        }
      }
      */




    }




    function oldgoToMap(map) {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner>'
      });

      //fix this to work with file system.

      // Check the first 30 tiles and zoom to the tile with the highest zoom
      var numTilesToCheck = map.tileArray.length > 30 ? 30 : map.tileArray.length - 1;

      if (numTilesToCheck <= 0) {
        $ionicPopup.alert({
          'title': 'Not Enough Tiles!',
          'template': 'More tiles need to be added to this map before attempting to view it.'
        });
        $ionicLoading.hide();
      }
      else {
        var x, y, z = -1; // Start zoom at -1 so a 0 zoom with meet the condition testZ > z
        var pattern = /(\d+)\/(\d+)\/(\d+)/; // Format "15/6285/13283"
        for (var i = 0; i < numTilesToCheck; i++) {
          var tileNameParts = pattern.exec(map.tileArray[i].tile);
          if (tileNameParts && tileNameParts.length === 4) {
            var testZ = parseInt(tileNameParts[1]);
            if (testZ > z) {
              z = testZ;
              x = parseInt(tileNameParts[2]);
              y = parseInt(tileNameParts[3]);
            }
          }
        }
        if (x && y && z) {
          var lng = SlippyTileNamesFactory.tile2long(x, z);
          var lat = SlippyTileNamesFactory.tile2lat(y, z);
          MapLayerFactory.setVisibleBaselayer(map.id);
          MapViewFactory.zoomToPoint([lng, lat], z);
          $location.path('/app/map');
        }
      }
    }















  }
}());
