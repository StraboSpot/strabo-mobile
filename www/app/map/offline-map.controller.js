(function () {
  'use strict';

  angular
    .module('app')
    .controller('OfflineMapController', OfflineMapController);

  OfflineMapController.$inject = ['$ionicLoading', '$ionicPopup', '$log', '$scope', 'OfflineTilesFactory'];

  function OfflineMapController($ionicLoading, $ionicPopup, $log, $scope, OfflineTilesFactory) {
    var vm = this;
    var deleteMap;

    vm.clearOfflineTile = clearOfflineTile;
    vm.deleteTiles = deleteTiles;
    vm.edit = edit;
    vm.maps = [];
    vm.numOfflineTiles = 0;       // number of tiles we have in offline storage
    //vm.offlineTilesSize = 0;
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
        OfflineTilesFactory.getOfflineTileCount(function (count) {
          // update the number of offline tiles to scope
          vm.numOfflineTiles = count;
          $scope.$apply();
        });
        //updateOfflineTileSize(vm.maps);
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
  }
}());
