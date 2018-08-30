(function () {
  //'use strict';

  angular
    .module('app')
    .controller('ArchiveTilesController', ArchiveTilesController);

  ArchiveTilesController.$inject = ['$http', '$ionicLoading', '$ionicModal', '$ionicPopup', '$log', '$q', '$scope', '$state', '$timeout',
    'LocalStorageFactory', 'MapFactory', 'MapLayerFactory', 'MapViewFactory', 'OfflineTilesFactory', 'SlippyTileNamesFactory'];

  function ArchiveTilesController($http, $ionicLoading, $ionicModal, $ionicPopup, $log, $q, $scope, $state, $timeout,
                                  LocalStorageFactory, MapFactory, MapLayerFactory, MapViewFactory, OfflineTilesFactory,
                                  SlippyTileNamesFactory) {
    var vm = this;
    var mapExtent;
    var mapLayer;
    var extentString;

    vm.checkedZooms = [];
    vm.downloading = false;
    vm.downloadingModal = {};
    vm.map = {};
    vm.maps = [];
    vm.outerZoomMax = 0;
    vm.outerZoomsAll = {'tilesNeed': [], 'tilesHave': []};
    vm.selectedName = {};
    vm.selectedMaxZoom = {};
    vm.showNameField = false;
    vm.showSelectName = false;
    vm.showSubmitButton = false;
    vm.submitBtnText = '0 Tiles Selected To Download';
    vm.zoomOptions = [];
    vm.tilehost = 'http://devtiles.strabospot.org';

    vm.hours = 10;
    vm.minutes = 5;
    vm.seconds = 24;

    vm.tryCount = 0;
    vm.zipUID = '';

    vm.scountTiles = scountTiles;
    vm.goToMap = goToMap;
    vm.nameSelectChanged = nameSelectChanged;
    vm.maxZoomLevelChanged = maxZoomLevelChanged;
    vm.submit = submit;
    vm.serverCountTiles = serverCountTiles;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      mapExtent = MapViewFactory.getMapViewExtent();
      if (!mapExtent) goToMap();
      else {
        var mapLayers = MapLayerFactory.getVisibleLayers();
        mapLayer = mapLayers.baselayer;
        if (!_.isEmpty(mapLayers.overlays)) {
          $ionicPopup.alert({
            'title': 'Overlay Warning!',
            'template': 'Only the map baselayer will be saved for offline use. Change an overlay to baselayer to save.'
          });
        }

        $log.log("getMaps: ",MapFactory.getMaps());

        vm.map = angular.fromJson(angular.toJson(_.find(MapFactory.getMaps(), function (gotMap) {
          return gotMap.id === mapLayer.get('id');
        })));

        $log.log('here is vm map: ',vm.map);

        _.extend(vm.map, {
          'currentZoom': Math.round(mapExtent.zoom),
          'percentDownload': 0,
          'progress': {'message':'Starting Download...'},
          'status': '',
          'tileCount': 0,
          'zipDone': false,
          'zipError': ''
        });

        vm.outerZoomMax = vm.map.currentZoom - 1;
        var zoomLevels = vm.map.maxZoom ? Math.min(vm.map.maxZoom - vm.map.currentZoom + 1, 5) : 5;
        _.times(zoomLevels, function (n) {
          var zoom = vm.map.currentZoom + n;
          vm.zoomOptions.push({
            'zoom': zoom,
            'tilesNeed': [],
            'tilesHave': []
          });
        });

        var right = mapExtent.topRight.lng;
        var top = mapExtent.topRight.lat;
        var left = mapExtent.bottomLeft.lng;
        var bottom = mapExtent.bottomLeft.lat;

        $log.log("right: ",right);
        $log.log("top: ",top);
        $log.log("left: ",left);
        $log.log("bottom: ",bottom);

        $log.log("mapExtent.topRight: ",mapExtent.topRight);

        extentString = left+','+bottom+','+right+','+top;

        $log.log('zoomOptions: ',vm.zoomOptions);

        loadSavedMaps();
        //countOuterZooms();
      }

      $ionicModal.fromTemplateUrl('app/maps/offline-maps/downloading-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.downloadingModal = modal;
      });
    }

    function checkForSavedTile(tileId) {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().mapTilesDb.getItem(mapLayer.get('id') + '/' + tileId)
        .then(function (savedTile) {
          if (savedTile) vm.outerZoomsAll.tilesHave.push({'tile': tileId, 'size': savedTile.size});
          else vm.outerZoomsAll.tilesNeed.push(tileId);
          deferred.resolve();
        });
      return deferred.promise;
    }

    function continueDownload() {
      $log.log("continueDownload: ",vm.map);
      OfflineTilesFactory.checkValidMapName(vm.map).then(function () {

        vm.downloadingModal.show().then(function () {
          vm.submitBtnText = 'Saving map . . . please wait.';
          vm.downloading = true;
          saveMap(vm.map).then(function (statusMsg) {
            $ionicLoading.hide();
            vm.downloading = false;
            /*
            $ionicPopup.alert({
              'title': 'Download Finished!',
              'template': statusMsg
            }).then(function () {
              resetZoomOptions();
            });
            */
          }, function (statusMsg) {
            /*
            $ionicLoading.hide();
            vm.downloading = false;
            $ionicPopup.alert({
              'title': 'Download Failed!',
              'template': statusMsg
            }).then(function () {
              resetZoomOptions();
            });
            */
          });
        });

      });
    }

    function scountOuterZooms() {
      var promises = [];
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Calculating Outer Zoom Tiles...'});

      var currentZoom = vm.zoomOptions[0].zoom;
      var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft,
        currentZoom);

      var tilesToCheck = ['0/0/0'];
      var x = 0;
      var y = 0;
      var z = 0;
      promises.push(checkForSavedTile('0/0/0'));
      _.each(currentZoomTileArray, function (currentTile) {
        x = 0;
        y = 0;
        z = 0;
        while (z < vm.outerZoomMax) {
          var regex = /(\d*)\/(\d*)\/(\d*)/g;
          var match = regex.exec(currentTile);
          var endX = match[2];
          var endY = match[3];

          var zDiff = currentZoom - z;      // Difference btwn current zoom of map and zoom of tiles being checked
          var d = Math.pow(2, zDiff);       // Dimension of the tile grid
          var col = endX - d * x;           // Column number
          var row = endY - d * y;           // Row number
          x = col < (d / 2) ? 2 * x : 2 * x + 1;
          y = row < (d / 2) ? 2 * y : 2 * y + 1;
          z++;
          var tileId = z + '/' + x + '/' + y;
          if (!_.contains(tilesToCheck, tileId)) {
            tilesToCheck.push(tileId);
            promises.push(checkForSavedTile(tileId));
          }
        }
      });

      $q.all(promises).then(function () {
        //$log.log(vm.outerZoomsAll);
        updateSelectedDownloads();
      });
    }

    function loadSavedMaps() {
      OfflineTilesFactory.getOfflineMaps().then(function (maps) {
        $log.log("maps: ",maps);
        vm.maps = angular.fromJson(angular.toJson(maps));
        vm.selectedName = _.last(_.sortBy(vm.maps, 'date'));
        if (vm.selectedName) {
          vm.map.name = vm.selectedName.name;
          vm.map.mapid = vm.selectedName.mapid;
        }
        vm.showNameField = _.isEmpty(vm.maps);
        vm.showSelectName = !_.isEmpty(vm.maps);
        vm.maps.push({'name': '-- New Offline Map --', 'date': new Date(1970, 1, 1)});
      });
    }

    function resetZoomOptions() {
      vm.outerZoomsAll.tilesHave = [];
      vm.outerZoomsAll.tilesNeed = [];
      //countOuterZooms();
      //_.each(vm.zoomOptions, function (z, i) {
      //  if (vm.checkedZooms[i]) countTiles(i);
      //});
      vm.checkedZooms = [];
    }

    $scope.countdown = function(){
        if(vm.minutes == 0 && vm.hours == 0){
            alert('end!');
            return;
        }
        else{
            vm.seconds--;
            if(vm.seconds == -1){
              vm.seconds = 59;
              vm.minutes --;
            }
            if(vm.minutes == -1){
                vm.minutes = 59;
                vm.hours--;
            }

            vm.map.percentDownload=vm.seconds;
            $log.log(vm.hours+' '+vm.minutes+' '+vm.seconds);
        }
        $timeout(arguments.callee, 1000);
    }

    $scope.checkStatus = function(){

      if(vm.zipUID!='') {
        $log.log('tryCount: ', vm.tryCount);

        var request = $http({
          'method': 'get',
          'url': vm.tilehost+'/asyncstatus/'+vm.zipUID
        });
        request.then(function (response) {
          if(response.data.error) {
            vm.map.zipError = response.data.error;
            vm.map.progress.message = response.data.error;
            vm.map.percentDownload = 100;
          }else{
            vm.map.progress.message = response.data.status;
            vm.map.percentDownload = response.data.percent;
          }




          $log.log(vm.map.progress.message+' - '+vm.map.percentDownload);

        }, function (response) {
          //request broken message

          $ionicPopup.alert({
            'title': 'Network Error!',
            'template': 'Unable to contact Strabo Server.'
          });

        });

        vm.tryCount++;

        if(vm.tryCount <= 200 && vm.map.progress.message!='Zip File Ready.' && vm.map.zipError==''){
          $timeout(arguments.callee, 1000);
        }else{
          OfflineTilesFactory.downloadZip(vm.zipUID,vm.map.mapid).then(function () {
            $ionicPopup.alert({
              'title': 'Testing!',
              'template': 'Download done!'
            });
          });

        }
      }
    }





/*

$ionicPopup.alert({
  'title': 'Testing!',
  'template': 'Download and unzip file here.'
});

mapbox.satellite: http://devtiles.strabospot.org/zip?layer=mapbox.satellite&extent=-97.89028775422965,38.45640879187488,-97.47830044954215,38.77830645970107&zoom=14
mapbox.outdoors: http://devtiles.strabospot.org/zip?layer=mapbox.outdoors&extent=-97.89028775422965,38.45640879187488,-97.47830044954215,38.77830645970107&zoom=14
mapbox styles: http://devtiles.strabospot.org/zip?layer=mapboxstyles&username=jasonash&access_token=pk.eyJ1IjoiamFzb25hc2giLCJhIjoiY2l2dTUycmNyMDBrZjJ5bzBhaHgxaGQ1diJ9.O2UUsedIcg1U7w473A5UHA&id=cjl3xdv9h22j12tqfmyce22zq&extent=-97.89028775422965,38.45640879187488,-97.47830044954215,38.77830645970107&zoom=14
osm: http://devtiles.strabospot.org/zipcount?layer=osm&extent=-97.89028775422965,38.45640879187488,-97.47830044954215,38.77830645970107&zoom=14
mapwarper: http://devtiles.strabospot.org/zip?layer=mapwarper&id=32790&extent=-97.89028775422965,38.45640879187488,-97.47830044954215,38.77830645970107&zoom=14
strabo mymaps: http://devtiles.strabospot.org/zip?layer=strabomymaps&id=5b75967d71bc0&extent=-97.89028775422965,38.45640879187488,-97.47830044954215,38.77830645970107&zoom=14


*/









    function saveZipMap(mapToSave) {
      var deferred = $q.defer(); // init promise
      vm.zipUID = '';
      $log.log("maptosave: ",mapToSave);

      var source = mapToSave.source;
      var id = mapToSave.id;
      var startZipURL='';
      if(source=='strabo_spot_mapbox') {
        if(id=='mapbox.outdoors'){
          startZipURL=vm.tilehost+'/asynczip?layer=mapbox.outdoors&extent='+extentString+'&zoom='+vm.selectedMaxZoom.zoom;
        }else if(id=='mapbox.satellite') {
          startZipURL=vm.tilehost+'/asynczip?layer=mapbox.satellite&extent='+extentString+'&zoom='+vm.selectedMaxZoom.zoom;
        }
      }else if(source=='osm') {
        startZipURL=vm.tilehost+'/asynczip?layer=osm&extent='+extentString+'&zoom='+vm.selectedMaxZoom.zoom;
      }else if(source=='mapbox_styles') {
        var key = mapToSave.key;
        var parts = id.split('/');
        var mapusername = parts[0];
        var mapid = parts[1];
        $log.log(parts);
        startZipURL=vm.tilehost+'/asynczip?layer=mapboxstyles&username='+mapusername+'&access_token='+key+'&id='+mapid+'&extent='+extentString+'&zoom='+vm.selectedMaxZoom.zoom;
      }else if(source=='strabospot_mymaps') {
        startZipURL=vm.tilehost+'/asynczip?layer=strabomymaps&id='+id+'&extent='+extentString+'&zoom='+vm.selectedMaxZoom.zoom;
      }else if(source=='map_warper') {
        startZipURL=vm.tilehost+'/asynczip?layer=mapwarper&id='+id+'&extent='+extentString+'&zoom='+vm.selectedMaxZoom.zoom;
      }

      $log.log('startZipURL: ',startZipURL);

      if(startZipURL!=''){

        var request = $http({
          'method': 'get',
          'url': startZipURL
        });
        request.then(function (response) {
          $log.log("response: ",response);
          vm.zipUID = response.data.id;
          if(vm.zipUID!='') {
            vm.map.progress.message = 'Starting Download...';
            vm.map.percentDownload = 0;
            vm.map.zipError = '';
            vm.tryCount=0;
            $scope.checkStatus();
          }else{
            vm.map.progress.message='Download Failed!';
            vm.map.percentDownload=100;
            $ionicPopup.alert({
              'title': 'Download Failed!',
              'template': 'Error getting ZIP id.'
            });
          }
        }, function (response) {
          //request broken message
          deferred.reject(response);
        });



      }else{

        vm.map.progress.message='Download Failed!';
        vm.map.percentDownload=100;
        $ionicPopup.alert({
          'title': 'Download Failed!',
          'template': 'Invalid ID ('+id+').'
        });

      }

      /*
      var request = $http({
        'method': 'get',
        'url': startZipURL
      });
      request.then(function (response) {
        //$log.log("response: ",response);
        vm.map.tileCount = response.data.count;
        vm.submitBtnText='Download '+response.data.count+' Tiles';
        deferred.resolve();
      }, function (response) {
        deferred.reject(response);
      });
      */





      //vm.map.percentDownload=x;
      //vm.map.progress.message='Progress message: '+x;



      deferred.resolve();

      return deferred.promise;

    }

















    function saveMap(mapToSave) {
      var deferred = $q.defer(); // init promise

      $log.log("mapToSave: ", mapToSave);

      vm.map.progress.message = 'Starting Download...';
      vm.map.percentDownload = 0;

      saveZipMap(mapToSave).then(function () {
        var statusMsg;
        if(!vm.map.zipDone) {
          statusMsg = 'There was an error downloading the map.';
        }else{
          statusMsg = 'SUCCESS! Map Saved!';
        }
        deferred.resolve(statusMsg);
      }, function () {
        deferred.reject('ERROR! Map not downloaded. Strabo may be unable to contact the tile host' +
          ' or unable to write to local storage.');
      }, function (notify) {
        $log.log('notify:',notify);
      });

      /*
      OfflineTilesFactory.saveMap(mapToSave).then(function () {
        var statusMsg;
        if (_.isEmpty(vm.map.progress) || vm.map.progress.failed === 0) statusMsg = 'SUCCESS! Map saved!';
        else if (vm.map.progress.failed === 1) {
          statusMsg = 'Map saved, however 1 tile was not downloaded. ' +
            'Try saving the map again with the same name to download the missing tile.';
        }
        else if (vm.map.progress.failed > 1) {
          statusMsg = 'Map saved, however ' + vm.map.progress.failed + ' tiles were not downloaded. ' +
            'Try saving the map again with the same name to download the missing tiles.';
        }
        deferred.resolve(statusMsg);
      }, function () {
        deferred.reject('ERROR! No tiles successfully downloaded. Strabo may be unable to contact the tile host' +
          ' or unable to write to local storage.');
      }, function (notify) {
        // Update the progress bar once we receive notifications
        vm.map.percentDownload = Math.ceil(
          ((notify.success.length + notify.failed.length) / vm.map.tiles.need.length) * 100) || 0;
        vm.map.progress = {
          'success': notify.success.length,
          'failed': notify.failed.length,
          'total': vm.map.tiles.need.length
        };
      });

      notify percent and progress message from offline-tile.factory.

      */


      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function serverCountTiles() {
      var deferred = $q.defer();

      var counturl = vm.tilehost+'/zipcount?extent='+extentString+'&zoom='+vm.selectedMaxZoom.zoom;

      //$log.log("url: ",counturl);

      var request = $http({
        'method': 'get',
        'url': counturl
      });
      request.then(function (response) {
        //$log.log("response: ",response);
        vm.map.tileCount = response.data.count;
        vm.submitBtnText='Download '+response.data.count+' Tiles';
        deferred.resolve();
      }, function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    }



    function scountTiles(i) {
      if (vm.checkedZooms[i]) {
        vm.zoomOptions[i].tilesNeed = [];
        vm.zoomOptions[i].tilesHave = [];
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Calculating Tiles...'});
        var promises = [];
        var currentZoomTileArray = SlippyTileNamesFactory.getTileIds(mapExtent.topRight, mapExtent.bottomLeft,
          vm.zoomOptions[i].zoom);
        _.each(_.flatten(currentZoomTileArray), function (tile) {
          var promise = LocalStorageFactory.getDb().mapTilesDb.getItem(mapLayer.get('id') + '/' + tile).then(
            function (savedTile) {
              if (savedTile) vm.zoomOptions[i].tilesHave.push(savedTile);
              else vm.zoomOptions[i].tilesNeed.push(tile);
            });
          promises.push(promise);
        });

        $q.all(promises).then(function () {
            //$log.log(vm.zoomOptions);
            updateSelectedDownloads();
          }
        );
      }
      else updateSelectedDownloads();
    }

    function goToMap() {
      $state.go('app.map');
    }

    function nameSelectChanged() {
      if (vm.selectedName.name === '-- New Offline Map --') {
        vm.showNameField = true;
        vm.map.name = '';
      }
      else {
        vm.showNameField = false;
        vm.map.name = vm.selectedName.name;
        vm.map.mapid = vm.selectedName.mapid;
      }
    }

    function maxZoomLevelChanged() {
      //get count, then show button
      //vm.map.tiles.need.length
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Counting Tiles...'});
      vm.serverCountTiles().then(function () {
        vm.showSubmitButton = true;
        //$log.log("maxZoom:",vm.selectedMaxZoom);
        $ionicLoading.hide();
      }, function (response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          'title': 'Network Error!',
          'template': 'Unable to contact Strabo Server.'
        });
      });
    }

    function submit() {
      if (!vm.map.name) {
        $ionicPopup.alert({
          'title': 'No Name Entered!',
          'template': 'Please give the map a name.'
        });
        return;
      }else{
        continueDownload();
      }
    }

    function supdateSelectedDownloads() {
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Calculating Total Tiles...'});
      vm.map.tiles.need = vm.outerZoomsAll.tilesNeed;
      vm.map.tiles.saved = vm.outerZoomsAll.tilesHave;
      _.each(vm.checkedZooms, function (checkedZoom, i) {
        if (checkedZoom) {
          vm.map.tiles.need = _.union(vm.map.tiles.need, vm.zoomOptions[i].tilesNeed);
          vm.map.tiles.saved = _.union(vm.map.tiles.saved, vm.zoomOptions[i].tilesHave);
        }
      });
      if (vm.map.tiles.need.length === 0) vm.submitBtnText = '0 Tiles Selected To Download';
      else vm.submitBtnText = 'Download ' + vm.map.tiles.need.length + ' Tiles';
      $ionicLoading.hide();
    }
  }
}());
