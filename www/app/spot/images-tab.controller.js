(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImagesTabController', ImagesTabController);

  ImagesTabController.$inject = ['$cordovaCamera', '$document', '$ionicModal', '$ionicPopup', '$log', '$scope',
    '$state', '$window', 'ImageBasemapFactory'];

  function ImagesTabController($cordovaCamera, $document, $ionicModal, $ionicPopup, $log, $scope, $state, $window,
                               ImageBasemapFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

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
    vm.closeModal = closeModal;
    vm.closeImageModal = closeImageModal;
    vm.currentImage = {};
    vm.deleteImage = deleteImage;
    vm.goToImageBasemap = goToImageBasemap;
    vm.moreDetail = moreDetail;
    vm.selectedCameraSource = {
      // default is always camera
      'source': 'CAMERA'
    };
    vm.showImages = showImages;
    vm.toggleImageBasemap = toggleImageBasemap;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In ImagesTabController');

      createModals();
      ionic.on('change', getFile, $document[0].getElementById('file'));
    }

    function cameraModal() {
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


    function createModals() {
      $ionicModal.fromTemplateUrl('app/spot/image-properties-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.imagePropertiesModal = modal;
      });
    }

    function getFile(event) {
      $log.log('Getting file ....');
      var file = event.target.files[0];
      readDataUrl(file);
    }

    function isImageUsed(image) {
      var spotsWithImage = _.filter(vmParent.spots, function (spot) {
        return spot.properties.image_basemap === image.id;
      });
      if (spotsWithImage.length >= 1) {
        var names = _.map(spotsWithImage, function (spot) {
          return spot.properties.name;
        });
        var alertTitle = 'Image Basemap Contains Spots!';
        var alertText = 'More than 20 spots are mapped on this image basemap. Delete these spots before ' +
          'removing the image as an Image Basemap.';
        if (spotsWithImage.length === 1) {
          alertTitle = 'Image Basemap Contains a Spot!';
          alertText = 'The following spot is mapped on this image basemap. Delete this spot before ' +
            'removing the image as an Image Basemap: ' + names.join(', ');
        }
        else if (spotsWithImage.length > 1 && spotsWithImage.length <= 20) {
          alertTitle = 'Image Basemap Contains Spots!';
          alertText = 'The following spots are mapped on this image basemap. Delete these spots before ' +
            'removing the image as an Image Basemap: ' + names.join(', ');
        }
        $ionicPopup.alert({
          'title': alertTitle,
          'template': alertText
        });
        return true;
      }
      return false;
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

      // create an images array if it doesn't exist -- camera images are stored here
      if (angular.isUndefined(vmParent.spot.images)) {
        vmParent.spot.images = [];
      }

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
      // If this is a web browser and not using cordova
      if ($document[0].location.protocol !== 'file:') { // Phonegap is not present }
        ionic.trigger('click', {'target': $document[0].getElementById('file')});
      }
      else cameraModal();
    }

    function closeModal(modal) {
      vm[modal].hide();
    }

    function closeImageModal() {
      vm.imageModal.hide();
      vm.imageModal.remove();
    }

    function deleteImage(imageToDelete) {
      if (!isImageUsed(imageToDelete)) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Image',
          'template': 'Are you sure you want to delete this image?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            vmParent.spot.images = _.reject(vmParent.spot.images, function (image) {
              return imageToDelete.id === image.id;
            });
            closeModal('imagePropertiesModal');
          }
        });
      }
    }

    function goToImageBasemap(image) {
      vmParent.submit('/app/image-basemaps/' + image.id);
    }

    function moreDetail(image) {
      vm.currentImage = image;
      vm.imagePropertiesModal.show();
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

    function toggleImageBasemap(image) {
      // Only allow toggle on if there is an image title
      if (image.annotated && !image.title) {
        $ionicPopup.alert({
          'title': 'Image Name Needed!',
          'template': 'This image needs a name before you can use it as an image basemap.'
        });
        image.annotated = false;
      }
      if (image.annotated && image.title) {
        ImageBasemapFactory.addImageBasemap(image);
      }

      // Only allow toggle off if no spots mapped on this image
      if (!image.annotated) {
        var imageUsed = isImageUsed(image);
        if (imageUsed) image.annotated = true;
        else ImageBasemapFactory.removeImageBasemap(image);
      }
    }
  }
}());
