(function () {

  angular
    .module('app')
    .controller('ArchiveTilesController', ArchiveTilesController);

  ArchiveTilesController.$inject = ['$cordovaFileTransfer', '$http', '$ionicLoading', '$ionicModal', '$ionicPopup',
    '$log', '$q', '$scope', '$state', '$timeout', 'LocalStorageFactory', 'MapFactory', 'MapLayerFactory',
    'MapViewFactory', 'OfflineTilesFactory','RemoteServerFactory'];

  function ArchiveTilesController($cordovaFileTransfer, $http, $ionicLoading, $ionicModal, $ionicPopup, $log, $q,
                                  $scope, $state, $timeout, LocalStorageFactory, MapFactory, MapLayerFactory,
                                  MapViewFactory, OfflineTilesFactory, RemoteServerFactory) {
    var vm = this;
    var mapExtent;
    var mapLayer;
    var extentString;
    var percentDone;

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
    vm.tilehost = '';



    vm.tryCount = 0;
    vm.zipUID = '';

    vm.goToMap = goToMap;
    vm.nameSelectChanged = nameSelectChanged;
    vm.maxZoomLevelChanged = maxZoomLevelChanged;
    vm.submit = submit;
    vm.serverCountTiles = serverCountTiles;
    vm.doUnzip = doUnzip;
    vm.unzipAgain = unzipAgain;

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

        var allmaps = MapFactory.getMaps();



        vm.map = angular.fromJson(angular.toJson(_.find(MapFactory.getMaps(), function (gotMap) {
          //now set tilehost. If we are offline, and maptype is strabo mymaps, set tilehost to offline server
          $log.log("CURRENT MAP: ", gotMap);
          if(gotMap.source=="strabospot_mymaps"){
            var serverURL = RemoteServerFactory.getDbUrl();
            if(serverURL.substring(0,22)=="https://strabospot.org"){
              //we're online, so use the normal host
              $log.log("*********************  ONLINE  ************************");
              vm.tilehost = 'http://tiles.strabospot.org';
            }else{
              //we're using an offline db, so let's use that for mymaps tiles
              $log.log("*********************  OFFLINE  ************************")
              var lastOccur = serverURL.lastIndexOf("/");
              vm.tilehost = serverURL.substr(0,lastOccur)+'/strabotiles'
            }
          }else{
            vm.tilehost = 'http://tiles.strabospot.org';
          }

          return gotMap.id === mapLayer.get('id');
        })));

        _.extend(vm.map, {
          'currentZoom': Math.round(mapExtent.zoom),
          'percentDownload': 0,
          'progress': {'message': 'Starting Download...'},
          'status': '',
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
        extentString = left + ',' + bottom + ',' + right + ',' + top;
        percentDone = 0;

        loadSavedMaps();
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

    $scope.checkStatus = function () {
      if (vm.zipUID != '') {
        var request = $http({
          'method': 'get',
          'url': vm.tilehost + '/asyncstatus/' + vm.zipUID
        });
        request.then(function (response) {
          if (response.data.error) {
            vm.map.zipError = response.data.error;
            vm.map.progress.message = response.data.error;
            percentDone = 100;
          }
          else {
            if (vm.map.progress.message != 'Downloading Tiles...') {
              vm.map.progress.message = response.data.status;
              vm.map.percentDownload = response.data.percent;
            }
          }
        }, function (response) {
          //request broken message
          $ionicPopup.alert({
            'title': 'Network Error!',
            'template': 'Unable to contact Strabo Server.'
          });
        });

        vm.tryCount++;

        if (vm.tryCount <= 200 && vm.map.progress.message != 'Zip File Ready.' && vm.map.zipError == '') {
          $timeout(arguments.callee, 1000);
        }
        else {
          vm.map.progress.message = 'Downloading Tiles...';
          downloadZip(vm.zipUID, vm.map.mapid).then(function () {
            vm.map.progress.message = 'Installing Tiles in StraboSpot...';
            $timeout(doUnzip(), 3000);
          }, function (error) {

          }, function (notify) {
            vm.map.percentDownload = notify;
          });
        }
      }
    };

    function continueDownload() {
      $log.log('continueDownload: ', vm.map);
      OfflineTilesFactory.checkValidMapName(vm.map).then(function () {
        vm.downloadingModal.show().then(function () {
          vm.submitBtnText = 'Saving map . . . please wait.';
          vm.downloading = true;
          saveMap(vm.map).then(function (statusMsg) {
            $ionicLoading.hide();
            vm.downloading = false;
          }, function (statusMsg) {
          });
        });

      });
    }

    function downloadZip(uid, mapid) {
      var deferred = $q.defer(); // init promise
      var url = vm.tilehost + '/ziptemp/' + uid + '/' + uid + '.zip';
      var devicePath = LocalStorageFactory.getDevicePath();
      var zipsDirectory = LocalStorageFactory.getZipsDirectory();
      var fileTransfer = new FileTransfer();

      fileTransfer.onprogress = function (progressEvent) {
        var percent = progressEvent.loaded / progressEvent.total * 100;
        percent = Math.round(percent);
        // console.log(percent);
        deferred.notify(percent);
      };

      LocalStorageFactory.checkZipsDir().then(function () {
        fileTransfer.download(url, devicePath + zipsDirectory + '/' + mapid + '.zip', function (entry) {
          console.log('download complete: ' + entry.toURL());
          deferred.resolve();
        }, function (error) {
          alert('zip download failed');
          $log.log('zip download error: ', error);
          deferred.reject(error);
        });
      });

      return deferred.promise;
    }

    function doUnzip() {
      vm.map.progress.message = 'Installing Tiles in StraboSpot...';
      unzipFile(vm.map.mapid).then(function (returnvar) { //not completing?
        if (returnvar == -1) { //zip failed, try again
          unzipAgain();
        }
        else {
          vm.map.progress.message = 'Done! ';
          LocalStorageFactory.getMapStorageDetails(vm.map.mapid).then(function (existCount) {
            $log.log('returnedDetails: ', existCount);
            vm.map.existCount = existCount;
            //clean up page
            OfflineTilesFactory.writeMap(vm.map, existCount).then(function () {
              var myPopup = $ionicPopup.alert({
                'title': 'Success!',
                'template': 'Map Download Complete!'
              });
              myPopup.then(function () {
                vm.showSubmitButton = false;
                vm.downloadingModal.hide();
                $log.log('close window here');
              });
            });
          });
        }
      }, function (error) {

      }, function (notify) {
        vm.map.percentDownload = notify;
      });
    }

    function loadSavedMaps() {
      OfflineTilesFactory.getOfflineMaps().then(function (maps) {
        $log.log("offline maps: ", maps);
        vm.maps = angular.fromJson(angular.toJson(maps));

        vm.existingName = _.find(vm.maps, function (gotMap) { //check to see if offline map already exists
          return gotMap.id === vm.map.id;
        });

        if (vm.existingName) {
          vm.map.name = vm.existingName.name;
          vm.map.mapid = vm.existingName.mapid;
          vm.map.existCount = vm.existingName.existCount;
        }
        else {
          vm.map.name = vm.map.title;
        }
        vm.showNameField = _.isEmpty(vm.maps);
        vm.showSelectName = !_.isEmpty(vm.maps);
        vm.maps.push({'name': '-- New Offline Map --', 'date': new Date(1970, 1, 1)});
      });
    }

    function resetZoomOptions() {
      vm.outerZoomsAll.tilesHave = [];
      vm.outerZoomsAll.tilesNeed = [];
      vm.checkedZooms = [];
    }

    function saveMap(mapToSave) {
      $log.log('just inside saveMap: ', mapToSave);
      var deferred = $q.defer(); // init promise

      vm.map.progress.message = 'Starting Download...';
      vm.map.percentDownload = 0;

      saveZipMap(mapToSave).then(function () {
        var statusMsg;
        if (!vm.map.zipDone) {
          statusMsg = 'There was an error downloading the map.';
        }
        else {
          statusMsg = 'SUCCESS! Map Saved!';
        }
        deferred.resolve(statusMsg);
      }, function () {
        deferred.reject('ERROR! Map not downloaded. Strabo may be unable to contact the tile host' +
          ' or unable to write to local storage.');
      });

      return deferred.promise;
    }

    function saveZipMap(mapToSave) {
      var deferred = $q.defer(); // init promise
      vm.zipUID = '';
      var source = mapToSave.source;
      var id = mapToSave.id;
      var mapid = mapToSave.mapid;
      var startZipURL = '';
      if (source == 'strabo_spot_mapbox') {
        if (id == 'mapbox.outdoors') {
          startZipURL = vm.tilehost + '/asynczip?mapid=' + mapid + '&layer=mapbox.outdoors&extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom;
        }
        else if (id == 'mapbox.satellite') {
          startZipURL = vm.tilehost + '/asynczip?mapid=' + mapid + '&layer=mapbox.satellite&extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom;
        }
      }
      else if (source == 'osm') {
        startZipURL = vm.tilehost + '/asynczip?mapid=' + mapid + '&layer=osm&extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom;
      }
      else if (source == 'macrostrat') {
        startZipURL = vm.tilehost + '/asynczip?mapid=' + mapid + '&layer=macrostrat&extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom;
      }
      else if (source == 'mapbox_styles') {
        var key = mapToSave.key;
        var parts = id.split('/');
        var mapusername = parts[0];
        var usermapid = parts[1];
        startZipURL = vm.tilehost + '/asynczip?mapid=' + mapid + '&layer=mapboxstyles&username=' + mapusername + '&access_token=' + key + '&id=' + usermapid + '&extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom;
      }
      else if (source == 'mapbox_classic') {
        var key = mapToSave.key;
        startZipURL = vm.tilehost + '/asynczip?mapid=' + mapid + '&layer=mapboxclassic&id=' + id + '&extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom + '&access_token=' + key;
      }
      else if (source == 'strabospot_mymaps') {
        startZipURL = vm.tilehost + '/asynczip?mapid=' + mapid + '&layer=strabomymaps&id=' + id + '&extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom;
      }
      else if (source == 'map_warper') {
        startZipURL = vm.tilehost + '/asynczip?mapid=' + mapid + '&layer=mapwarper&id=' + id + '&extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom;
      }

      if (startZipURL != '') {
        $log.log("startZipURL: ",startZipURL);
        var request = $http({
          'method': 'get',
          'url': startZipURL
        });
        request.then(function (response) {
          vm.zipUID = response.data.id;
          if (vm.zipUID != '') {
            vm.map.progress.message = 'Starting Download...';
            vm.map.percentDownload = 0;
            vm.map.zipError = '';
            vm.tryCount = 0;
            $scope.checkStatus();
          }
          else {
            vm.map.progress.message = 'Download Failed!';
            vm.map.percentDownload = 100;
            $ionicPopup.alert({
              'title': 'Download Failed!',
              'template': 'Error getting ZIP id.'
            });
          }
        }, function (response) {
          //request broken message
          deferred.reject(response);
        });
      }
      else {
        vm.map.progress.message = 'Download Failed!';
        vm.map.percentDownload = 100;
        $ionicPopup.alert({
          'title': 'Download Failed!',
          'template': 'Invalid ID (' + id + ').'
        });
      }

      deferred.resolve();

      return deferred.promise;

    }

    function unzipAgain() {
      unzipFile(vm.map.mapid).then(function (returnvar) { //not completing?
        if (returnvar == -1) { //zip failed, try again
          unzipAgain();
        }
        else {
          vm.map.progress.message = 'Done! ';
          LocalStorageFactory.getMapStorageDetails(vm.map.mapid).then(function (existCount) {
            $log.log('returnedDetails: ', existCount);
            vm.map.existCount = existCount;
            //clean up page
            OfflineTilesFactory.writeMap(vm.map, existCount).then(function () {
              var myPopup = $ionicPopup.alert({
                'title': 'Success!',
                'template': 'Map Download Complete!'
              });
              myPopup.then(function () {
                vm.showSubmitButton = false;
                vm.downloadingModal.hide();
                $log.log('close window here');
              });
            });
          });
        }
      }, function (error) {

      }, function (notify) {
        vm.map.percentDownload = notify;
      });
    }

    //do unzip here so we can show progress
    function unzipFile(mapid) {
      var deferred = $q.defer(); // init promise
      var devicePath = LocalStorageFactory.getDevicePath();
      var zipsDirectory = LocalStorageFactory.getZipsDirectory();
      var tileCacheDirectory = LocalStorageFactory.getTileCacheDirectory();
      $log.log(devicePath + '/' + zipsDirectory + '/' + mapid + '.zip to ' + devicePath + '/' + zipsDirectory + '/');
      LocalStorageFactory.checkDir(tileCacheDirectory).then(function () {
        zip.unzip(devicePath + '/' + zipsDirectory + '/' + mapid + '.zip', devicePath + '/' + tileCacheDirectory + '/',
          function (returnvar) {
            deferred.resolve(returnvar);
          }, function (progressEvent) {
            var percentUnzipped = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            // $log.log(percentUnzipped);
            deferred.notify(percentUnzipped);
          });
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function goToMap() {
      $state.go('app.map');
    }

    function maxZoomLevelChanged(newmaxzoom) {
      vm.selectedMaxZoom.zoom = newmaxzoom;
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Counting Tiles...'});
      vm.serverCountTiles().then(function () {
        vm.showSubmitButton = true;
        $ionicLoading.hide();
      }, function (response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          'title': 'Network Error!',
          'template': 'Unable to contact Strabo Server.'
        });
      });
    }

    function nameSelectChanged() {
      if (vm.selectedName.name === '-- New Offline Map --') {
        vm.showNameField = true;
        vm.map.name = '';
        vm.map.existCount = 0;
      }
      else {
        vm.showNameField = false;
        vm.map.name = vm.selectedName.name;
        vm.map.mapid = vm.selectedName.mapid;
        vm.map.existCount = vm.selectedName.existCount;
      }
    }

    function serverCountTiles() {
      var deferred = $q.defer();
      $log.log(vm.tilehost + '/zipcount?extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom);
      var counturl = vm.tilehost + '/zipcount?extent=' + extentString + '&zoom=' + vm.selectedMaxZoom.zoom;
      var request = $http({
        'method': 'get',
        'url': counturl
      });
      request.then(function (response) {
        vm.map.tileCount = response.data.count;
        vm.submitBtnText = 'Download ' + response.data.count + ' Tiles';
        deferred.resolve();
      }, function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    }

    function submit() {
      if (!vm.map.name) {
        $ionicPopup.alert({
          'title': 'No Name Entered!',
          'template': 'Please give the map a name.'
        });
        return;
      }
      else {
        continueDownload();
      }
    }

  }
}());
