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
        });
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

    function clearOfflineTile(maps) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Tiles',
        'template': 'Are you sure you want to delete <b>ALL</b> offline tiles?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          // ok, lets delete now because the user has confirmed ok
          $ionicLoading.show({
            'template': '<ion-spinner></ion-spinner><br>Deleting Maps'
          });
          OfflineTilesFactory.clear(maps).then(function (err) {
            $ionicLoading.hide();
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
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner>'
      }).then(function(){
        OfflineTilesFactory.getMapCenterTile(map.mapid).then(function (centerTile) {
          $log.log('gotcenterTile: ', centerTile);
          if(centerTile) {
            var parts = centerTile.split('_');
            var z = Number(parts[0]);
            var x = Number(parts[1]);
            var y = Number(parts[2]);
            var lng = SlippyTileNamesFactory.tile2long(x, z);
            var lat = SlippyTileNamesFactory.tile2lat(y, z);
            MapLayerFactory.setVisibleBaselayer(map.id);
            MapViewFactory.zoomToPoint([lng, lat], z);
            $location.path('/app/map');
          }
        },function(err){ //map not found
          $log.log('Found Error: ',err);
          $ionicLoading.hide();
          $ionicPopup.alert({
            'title': 'Error!',
            'template': 'Offline map not found on device.<br>(code: '+err+')'
          }).then(function(){
            $ionicLoading.hide();
          });
        });
      });
    }
  }
}());
