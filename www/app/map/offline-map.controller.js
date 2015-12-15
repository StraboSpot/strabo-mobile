(function () {
  'use strict';

  angular
    .module('app')
    .controller('OfflineMapController', OfflineMapController);

  OfflineMapController.$inject = ['$ionicLoading', '$ionicPopup', '$scope', 'OfflineTilesFactory'];

  function OfflineMapController($ionicLoading, $ionicPopup, $scope, OfflineTilesFactory) {
    var vm = this;

    vm.clearOfflineTile = clearOfflineTile;
    vm.deleteTiles = deleteTiles;
    vm.edit = edit;
    vm.maps = {                   // a collection of maps
      'maps': null
    };
    vm.numOfflineTiles = 0;       // number of tiles we have in offline storage
    vm.refreshAndUpdateCount = refreshAndUpdateCount;
    vm.refreshOfflineMapList = refreshOfflineMapList;
    vm.showMapRenamePopup = showMapRenamePopup;
    vm.updateOfflineTileCount = updateOfflineTileCount;

    activate();

    function activate() {
      // lets update the count right now
      refreshAndUpdateCount();
    }

    function clearOfflineTile() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Tiles',
        'template': 'Are you sure you want to delete <b>ALL</b> offline tiles?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          // ok, lets delete now because the user has confirmed ok
          OfflineTilesFactory.clear(function (err) {
            refreshAndUpdateCount();
            $ionicPopup.alert({
              'title': 'Alert!',
              'template': 'Offline tiles are now empty.'
            });
          });
        }
      });
    }

    function deleteTiles(map) {
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
            refreshAndUpdateCount();
          });
        }
      });
    }

    function edit(map) {
      // console.log('edit');
      showMapRenamePopup(map.name);
    }

    function showMapRenamePopup(mapName) {
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
          OfflineTilesFactory.renameMap(mapName, vm.mapDetail.newName)
            .then(function () {
              refreshAndUpdateCount();
            });
        }
      });
    }

    function refreshAndUpdateCount() {
      refreshOfflineMapList();
      updateOfflineTileCount();
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
      });
    }
  }
}());
