(function () {
  'use strict';

  angular
    .module('app')
    .controller('UserController', UserController);

  UserController.$inject = ['$cordovaCamera', '$document', '$ionicLoading', '$ionicPopup', '$log', '$scope', '$window',
    'ImageFactory', 'ProjectFactory', 'OtherMapsFactory', 'SpotFactory', 'UserFactory', 'IS_WEB'];

  function UserController($cordovaCamera, $document, $ionicLoading, $ionicPopup, $log, $scope, $window, ImageFactory,
                          ProjectFactory, OtherMapsFactory, SpotFactory, UserFactory, IS_WEB) {
    var vm = this;
    var dataOrig;

    vm.addImage = addImage;
    vm.cameraSource = [{
      'text': 'Photo Library',
      'value': 'PHOTOLIBRARY'
    }, {
      'text': 'Camera',
      'value': 'CAMERA'
    }, {
      'text': 'Saved Photo Album',
      'value': 'SAVEDPHOTOALBUM'
    }];
    vm.data = null;
    vm.login = null;
    vm.doLogin = doLogin;
    vm.doLogout = doLogout;
    vm.doRefresh = doRefresh;
    vm.selectedCameraSource = {
      // default is always camera
      'source': 'CAMERA'
    };
    vm.showOfflineWarning = false;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.data = UserFactory.getUser();
      dataOrig = angular.fromJson(angular.toJson(vm.data));
      $log.log('User data:', vm.data);
      if (!IS_WEB) ionic.on('change', getFile, $document[0].getElementById('file'));
    }

    function cameraModal() {
      // camera modal popup
      var myPopup = $ionicPopup.show({
        'template': '<ion-radio ng-repeat="source in vm.cameraSource" ng-value="source.value" ng-model="vm.selectedCameraSource.source">{{ source.text }}</ion-radio>',
        'title': 'Select an image source',
        'scope': $scope,
        'buttons': [{
          'text': 'Cancel'
        }, {
          'text': '<b>Go</b>',
          'type': 'button-positive',
          'onTap': function (e) {
            if (!vm.selectedCameraSource.source) {
              // don't allow the user to close unless a value is set
              e.preventDefault();
            }
            else {
              return vm.selectedCameraSource.source;
            }
          }
        }]
      });

      myPopup.then(function (cameraSource) {
        if (cameraSource) {
          launchCamera(cameraSource);
        }
      });
    }

    function getFile(event) {
      $log.log('Getting file ....');
      var file = event.target.files[0];
      readDataUrl(file);
    }

    function launchCamera(source) {
      // all plugins must be wrapped in a ready function
      document.addEventListener('deviceready', function () {
        if (source === 'PHOTOLIBRARY') {
          source = Camera.PictureSourceType.PHOTOLIBRARY;
        }
        else if (source === 'CAMERA') {
          source = Camera.PictureSourceType.CAMERA;
        }
        else if (source === 'SAVEDPHOTOALBUM') {
          source = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        }

        var cameraOptions = {
          'quality': 75,
          'destinationType': Camera.DestinationType.FILE_URI,
          'sourceType': source,
          'allowEdit': true,
          'encodingType': Camera.EncodingType.JPEG,
          // 'popoverOptions': CameraPopoverOptions,
          'saveToPhotoAlbum': source === Camera.PictureSourceType.CAMERA
        };

        $cordovaCamera.getPicture(cameraOptions).then(function (imageURI) {
          /* the image has been written to the mobile device and the source is a camera type.
           * It is written in two places:
           *
           * Android:
           * 1) the local strabo-mobile cache, aka '/storage/emulated/0/Android/data/com.ionicframework.strabomobile327690/cache/filename.jpg'
           * 2) the Photo Album folder, on Android, this is: '/sdcard/Pictures/filename.jpg'
           *
           * iOS:
           * 1) in iOS, this is in the Photos Gallery???
           *
           *
           * If pulling from Photo Library:
           *
           * Android: file:///storage/emulated/0/DCIM/Camera/file.jpg
           * iOS: ???
           *
           */

          $log.log('original imageURI ', imageURI);

          // are we on an android device and is the URI schema a 'content://' type?
          if (imageURI.substring(0, 10) === 'content://') {
            // yes, then convert it to a 'file://' yet schemaless type
            $window.FilePath.resolveNativePath(imageURI, resolveSuccess, resolveFail);
          }
          else {
            // no, so no conversion is needed
            resolveSuccess(imageURI);
          }

          function resolveFail(message) {
            $log.log('failed to resolve URI', message);
          }

          // now we read the image from the filesystem and save the image to the spot
          function resolveSuccess(imageURI) {
            // is this a real file schema?
            if (imageURI.substring(0, 7) !== 'file://') {
              // nope, then lets make this a real file schema
              imageURI = 'file://' + imageURI;
            }

            $log.log('final imageURI ', imageURI);

            var gotFileEntry = function (fileEntry) {
              $log.log('inside gotFileEntry');
              fileEntry.file(gotFile, resolveFail);
            };

            var gotFile = function (file) {
              $log.log('inside gotFile');
              $log.log('file is ', file);
              readDataUrl(file);
            };

            // invoke the reading of the image file from the local filesystem
            $window.resolveLocalFileSystemURL(imageURI, gotFileEntry, resolveFail);
          }
        }, function (err) {
          $log.log('error: ', err);
        });
      });
    }

    function readDataUrl(file) {
      // $log.log('inside readDataUrl');

      var reader = new FileReader();
      var image = new Image();
      reader.onloadend = function (evt) {
        // $log.log('Read as data URL');
        // $log.log(evt.target.result);
        image.src = evt.target.result;
        image.onload = function () {
          $log.log('Got file');
          // push the image data to our camera images array
          $scope.$apply(function () {
            vm.data.image = image.src;
          });
        };
        image.onerror = function () {
          $ionicPopup.alert({
            'title': 'Error!',
            'template': 'Invalid file type.'
          });
        };
      };
      reader.readAsDataURL(file);
    }

    /**
     * Public Functions
     */

    function addImage() {
      if (IS_WEB) ionic.trigger('click', {'target': $document[0].getElementById('file')});
      else cameraModal();
    }

    // Perform the login action when the user presses the login icon
    function doLogin() {
      if (navigator.onLine) {
        $ionicLoading.show({
          'template': '<ion-spinner></ion-spinner>'
        });
        UserFactory.doLogin(vm.login).then(function () {
          vm.data = UserFactory.getUser();
          dataOrig = angular.fromJson(angular.toJson(vm.data));
        }).finally(function () {
          $ionicLoading.hide();
        });
      }
      else {
        $ionicPopup.alert({
          'title': 'Offline!',
          'template': 'Can\'t login while offline.'
        });
      }
    }

    // Destroy the user data on when the logout button pressed
    function doLogout() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Log Out Warning!',
        'template': 'Logging out will <b>erase</b> all local data. Are you sure you want to continue?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vm.login = null;
          vm.data = null;
          dataOrig = null;
          UserFactory.clearUser().then(function () {
            $log.log('Cleared user data from local storage. Clearing project now.');
            ProjectFactory.destroyProject();
            SpotFactory.clearAllSpots();
            ImageFactory.deleteAllImages();
            OtherMapsFactory.destroyOtherMaps();
          });
          $log.log('Logged out');
        }
      });
    }

    function submit() {
      if (!angular.equals(vm.data, dataOrig)) {
        UserFactory.saveUser(vm.data);
        if (!angular.equals(_.omit(vm.data, 'image'), _.omit(dataOrig, 'image'))) UserFactory.uploadUserProfile();
        if (!angular.equals(vm.data.image, dataOrig.image)) UserFactory.uploadUserImage();
        dataOrig = angular.fromJson(angular.toJson(vm.data));
      }
    }

    function doRefresh() {
      if (navigator.onLine) {
        vm.showOfflineWarning = false;
        UserFactory.updateUser().then(function () {
          vm.data = UserFactory.getUser();
          dataOrig = angular.fromJson(angular.toJson(vm.data));
        }).finally(function () {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      }
      else {
        vm.showOfflineWarning = true;
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      }
    }
  }
}());
