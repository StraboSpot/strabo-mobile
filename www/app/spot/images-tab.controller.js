(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImagesTabController', ImagesTabController);

  ImagesTabController.$inject = ['$scope', '$stateParams', '$log', '$cordovaCamera', '$ionicPopup', '$ionicModal',
    '$location', '$window', 'SpotFactory', 'ImageMapFactory'];

  function ImagesTabController($scope, $stateParams, $log, $cordovaCamera, $ionicPopup, $ionicModal,
                               $location, $window, SpotFactory, ImageMapFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    vm.annotateChecked = annotateChecked;
    vm.cameraModal = cameraModal;
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
    vm.closeImageModal = closeImageModal;
    vm.goToImageMap = goToImageMap;
    vm.isAnnotated = isAnnotated;
    vm.selectedCameraSource = {
      // default is always camera
      'source': 'CAMERA'
    };
    vm.showImages = showImages;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In ImagesTabController');
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

          // create an images array if it doesn't exist -- camera images are stored here
          if (angular.isUndefined(vmParent.spot.images)) {
            vmParent.spot.images = [];
          }

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

            var readDataUrl = function (file) {
              // $log.log('inside readDataUrl');
              var reader = new FileReader();
              var image = new Image();
              reader.onloadend = function (evt) {
                // $log.log('Read as data URL');
                // $log.log(evt.target.result);
                image.src = evt.target.result;
                image.onload = function () {
                  // push the image data to our camera images array
                  $scope.$apply(function () {
                    vmParent.spot.images.push({
                      'src': image.src,
                      'height': image.height,
                      'width': image.width,
                      'id': Math.floor((new Date().getTime() + Math.random()) * 10)
                    });
                  });
                };
                image.onerror = function () {
                  $ionicPopup.alert({
                    'title': 'Error!',
                    'template': 'Invalid file type: ' + evt.type
                  });
                };
              };
              reader.readAsDataURL(file);
            };

            // invoke the reading of the image file from the local filesystem
            $window.resolveLocalFileSystemURL(imageURI, gotFileEntry, resolveFail);
          }
        }, function (err) {
          $log.log('error: ', err);
        });
      });
    }

    /**
     * Public Functions
     */

    function annotateChecked(image) {
      image.annotated = !image.annotated;
    }

    function cameraModal(source) {
      // camera modal popup
      var myPopup = $ionicPopup.show({
        'template': '<ion-radio ng-repeat="source in vmChild.cameraSource" ng-value="source.value" ng-model="vmChild.selectedCameraSource.source">{{ source.text }}</ion-radio>',
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

    function closeImageModal() {
      vm.imageModal.hide();
      vm.imageModal.remove();
    }

    function goToImageMap(image) {
      SpotFactory.read(vmParent.spot.properties.id, (function (savedSpot) {
        savedSpot.properties.date = new Date(savedSpot.properties.date);
        savedSpot.properties.time = new Date(savedSpot.properties.time);
        if (_.isEqual(vmParent.spot, savedSpot)) {    // User angular.copy to get rid of angular's $$hashKey
          ImageMapFactory.setCurrentImageMap(image);              // Save referenced image map
          $location.path('/app/image-maps/' + image.id);
          $scope.$apply();
        }
        else if (_.isEqual(angular.copy(vmParent.spot), savedSpot)) {    // User angular.copy to get rid of angular's $$hashKey
          ImageMapFactory.setCurrentImageMap(image);              // Save referenced image map
          $location.path('/app/image-maps/' + image.id);
          $scope.$apply();
        }
        else {
          $ionicPopup.alert({
            'title': 'Save First!',
            'template': 'There have been changes to this Spot. Please save this Spot before opening the Image Map.'
          });
        }
      }));
    }

    function isAnnotated(image) {
      return image.annotated;
    }

    function showImages(index) {
      vm.activeSlide = index;
      $ionicModal.fromTemplateUrl('app/spot/images-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.imageModal = modal;
        vm.imageModal.show();
      });
    }
  }
}());
