(function () {
  'use strict';

  angular
    .module('app')
    .factory('ImageFactory', ImageFactory);

  ImageFactory.$inject = ['$cordovaCamera', '$ionicLoading', '$ionicPopup', '$log', '$rootScope', '$state', '$window', 'HelpersFactory',
    'LiveDBFactory', 'LocalStorageFactory', 'ProjectFactory', 'SpotFactory'];

  function ImageFactory($cordovaCamera, $ionicLoading, $ionicPopup, $log, $rootScope, $state, $window, HelpersFactory, LiveDBFactory,
                        LocalStorageFactory, ProjectFactory, SpotFactory) {
    var currentImageData = {};
    var currentSpot = {};
    var images = [];
    var isReattachImage = false;
    var takeMorePictures = false;

    return {
      'cleanImagesInSpot': cleanImagesInSpot,
      'deleteAllImages': deleteAllImages,
      'deleteImage': deleteImage,
      'getImageById': getImageById,
      'getImageFromGallery': getImageFromGallery,
      'readFile': readFile,
      'saveImage': saveImage,
      'setCurrentImage': setCurrentImage,
      'setCurrentSpot': setCurrentSpot,
      'setIsReattachImage': setIsReattachImage,
      'takePicture': takePicture
    };

    /**
     * Private Functions
     */
    function dataURItoBlob(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {'type': 'image/jpeg'});
    }

    function getPicture(source) {//add promise here?
      // all plugins must be wrapped in a ready function
      document.addEventListener('deviceready', function () {
        //getGeoInfo = false;

        var cameraOptions = {
          'quality': 100,
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
            //getGeoInfo = false;
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

        var block = image.src.split(';');
        var dataType = block[0].split(':')[1];    // In this case 'image/jpg'
        var base64Data = block[1].split(',')[1];  // In this case 'iVBORw0KGg....'
        var imgBlob = HelpersFactory.b64toBlob(base64Data, dataType);

        image.onload = function () {
          if (isReattachImage) {
            if (image.height === currentImageData.height && image.width === currentImageData.width) {
              //saveImage(image.src).then(function () {
              saveImage(imgBlob).then(function () {
                $log.log('Also save image to live db here');
                //save to file
                LiveDBFactory.saveImageFile(currentImageData.id, image.src).then(function() {
                  $rootScope.$broadcast('updatedImages');
                  isReattachImage = false;
                  $ionicLoading.hide();
                  $ionicPopup.alert({
                    'title': 'Finished Reattaching Image',
                    'template': 'The selected image source was reattached to the selected image properties.'
                  });
                });
              });
            }
            else {
              $ionicLoading.hide();
              $ionicPopup.alert({
                'title': 'Mismatched Image',
                'template': 'The selected image does not have the same height and width as the original. Unable to reattach image.'
              });
            }
          }
          else {
            _.extend(currentImageData, {
              'height': image.height,
              'width': image.width,
              'id': HelpersFactory.getNewId()
            });
            //saveImage(image.src);
            saveImage(imgBlob);
            $log.log('Also save image to live db here');
            LiveDBFactory.saveImageFile(currentImageData.id, image.src).then(function () {
              saveImageDataToSpot();
            });
          }
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

    function saveImageDataToSpot() {
      if (angular.isUndefined(currentSpot.properties.images)) currentSpot.properties.images = [];
      currentSpot.properties.images = _.reject(currentSpot.properties.images, function (image) {
        return image.id === currentImageData.id;
      });
      currentSpot.properties.images.push(currentImageData);
      SpotFactory.save(currentSpot).then(function () {
        $rootScope.$broadcast('updatedImages');
        if ($state.current.name === 'app.map') $rootScope.$broadcast('updateMapFeatureLayer');
        else if ($state.current.name === 'app.image-basemaps.image-basemap' ||
          $state.current.name === 'app.image-basemap') {
          $rootScope.$broadcast('updateImageBasemapFeatureLayer');
        }
        else if ($state.current.name === 'app.strat-sections.strat-section' ||
          $state.current.name === 'app.strat-section') {
          $rootScope.$broadcast('updateStratSectionFeatureLayer');
        }
      });
      LiveDBFactory.save(currentSpot, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());

      if (takeMorePictures) {
        setCurrentImage({'image_type': 'photo'});
        takePicture();
      }
    }

    /**
     * Public Functions
     */

    // Make sure each image in Spot images array is not an empty object, has an id and has an image type
    function cleanImagesInSpot(spot) {
      if (spot.properties.images) {
        if (_.isEmpty(spot.properties.images)) delete spot.properties.images;
        else {
          _.each(spot.properties.images, function (image, i) {
            if (_.isEmpty(image) || !image.id) spot.properties.images.splice(i);
            else if (!image.image_type) image.image_type = 'photo';
          });
        }
      }
      return spot;
    }

    function deleteAllImages() {
      return LocalStorageFactory.getDb().imagesDb.clear().then(function () {
        $log.log('All images deleted from local storage.');
      });
    }

    function deleteImage(imageId) {
      return LocalStorageFactory.getDb().imagesDb.removeItem(imageId.toString());
    }

    function getImageById(imageId) {
      return LocalStorageFactory.getImageById(imageId.toString());
    }

    function getImageFromGallery() {
      takeMorePictures = false;
      getPicture(Camera.PictureSourceType.PHOTOLIBRARY);
    }

    function readFile(file) {
      takeMorePictures = false;
      readDataUrl(file);
    }

    function saveImage(imageData, imageId) {
      if (!imageId) imageId = currentImageData.id;
      //return LocalStorageFactory.saveImageToFileSystem(imageData, imageId.toString()+'.txt');
      return LocalStorageFactory.saveImageToFileSystem(imageData, imageId.toString()+'.jpg');
    }

    function setCurrentImage(inImageData) {
      currentImageData = inImageData;
    }

    function setCurrentSpot(inSpot) {
      currentSpot = inSpot;
      images = currentSpot.properties.images || [];
    }

    function setIsReattachImage(inIsReattachImage) {
      isReattachImage = inIsReattachImage;
    }

    function takePicture() {
      takeMorePictures = true;
      getPicture(Camera.PictureSourceType.CAMERA);
    }
  }
}());
