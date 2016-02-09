(function () {
  'use strict';

  angular
    .module('app')
    .controller('OfflineMapController', OfflineMapController);

  OfflineMapController.$inject = ['$ionicLoading', '$ionicPopup', '$scope', 'OfflineTilesFactory'];

  function OfflineMapController($ionicLoading, $ionicPopup, $scope, OfflineTilesFactory) {
    var vm = this;
    var deleteMap;

    vm.clearOfflineTile = clearOfflineTile;
    vm.deleteTiles = deleteTiles;
    vm.edit = edit;
    vm.maps = {                   // a collection of maps
      'maps': null
    };
    vm.numOfflineTiles = 0;       // number of tiles we have in offline storage
    vm.offlineTilesSize = 0;
    vm.refreshOfflineMapList = refreshOfflineMapList;
    vm.updateOfflineTileCount = updateOfflineTileCount;
    vm.updateOfflineTileSize = updateOfflineTileSize;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      refreshOfflineMapList();
      updateOfflineTileCount();
      updateOfflineTileSize();
    }

    function refreshOfflineMapList() {
      OfflineTilesFactory.getMaps().then(function (maps) {
        vm.maps.maps = maps;
      });
    }

    function updateOfflineTileCount() {
      // get the image count
      OfflineTilesFactory.getOfflineTileCount(function (count) {
        // console.log(count);
        vm.numOfflineTiles = count;
        $scope.$apply();
      });
    }

    function updateOfflineTileSize() {
      OfflineTilesFactory.getOfflineTileSize(function (size) {
        if (size >= 1000 && size < 1000000) size = String(Math.round(size / 1000)) + ' KB';
        if (size >= 1000000 && size < 1000000000) size = String(Math.round(size / 1000000)) + ' MB';
        if (size >= 1000000000) size = String(Math.round(size / 1000000000)) + ' GB';
        vm.offlineTilesSize = size;
        $scope.$apply();
      });
    }

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
            'template': '<ion-spinner></ion-spinner>'
          });
          OfflineTilesFactory.deleteMap(map).then(function () {
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
                if (!vm.mapDetail.newName) {
                  // don't allow the user to close unless he enters the new name
                  e.preventDefault();
                }
                else {
                  return vm.mapDetail.newName;
                }
              }
            }
          ]
        });

        myPopup.then(function (name) {
          if (name) {
            // rename the map
            OfflineTilesFactory.renameMap(map.name, vm.mapDetail.newName)
              .then(function () {
                activate();
              });
          }
        });
      }
    }
  }
}());
