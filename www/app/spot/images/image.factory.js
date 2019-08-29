(function () {
  'use strict';

  angular
    .module('app')
    .factory('ImageFactory', ImageFactory);

  ImageFactory.$inject = ['$cordovaCamera', '$cordovaDevice', '$ionicLoading', '$ionicPopup', '$log', '$rootScope',
    '$state', '$window', 'HelpersFactory', 'LiveDBFactory', 'LocalStorageFactory', 'ProjectFactory', 'SpotFactory',
    'IS_WEB'];

  function ImageFactory($cordovaCamera, $cordovaDevice, $ionicLoading, $ionicPopup, $log, $rootScope, $state, $window,
                        HelpersFactory, LiveDBFactory, LocalStorageFactory, ProjectFactory, SpotFactory, IS_WEB) {
    var currentImageData = {};
    var currentSpot = {};
    var images = [];
    var imageSources = {};
    var isReattachImage = false;
    var takeMorePictures = false;

    return {
      'cleanImagesInSpot': cleanImagesInSpot,
      //'deleteAllImages': deleteAllImages,
      'deleteImage': deleteImage,
      'gatherImageSources': gatherImageSources,
      'getImageById': getImageById,
      'getImageFileURIById': getImageFileURIById,
      'getImageFromGallery': getImageFromGallery,
      'getImageSource': getImageSource,
      'addImageWeb': addImageWeb,
      'saveImageBlobToDevice': saveImageBlobToDevice,
      'setCurrentImage': setCurrentImage,
      'setCurrentSpot': setCurrentSpot,
      'setIsReattachImage': setIsReattachImage,
      'takePicture': takePicture
    };

    /**
     * Private Functions
     */

    // Add an image from file on Web
    function addImageWeb(imageBlob) {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner><br>Adding Image...'
      });
      uploadImageBlob(imageBlob)
        .then(setImageSourceWeb)
        .then(setImageProperties)
        .then(saveSpot)
        .catch(errorAlert)
        .finally(function () {
          $ionicLoading.hide();
        });
    }

    function checkForMoreImages() {
      if (!isReattachImage && takeMorePictures) {
        setCurrentImage({'image_type': 'photo'});
        return takePicture();
      }
      return Promise.resolve();
    }

    // If reattaching an image make sure the image dimensions of the new image
    // match what is already in the Spot image properties for the original image
    function checkImageSize(imageURI) {
      $log.log('Camera success', imageURI);
      if (isReattachImage) {
        return new Promise(function (resolve, reject) {
          var newImage = new Image();
          newImage.onload = function () {
            if (newImage.height === currentImageData.height && newImage.width === currentImageData.width) {
              $log.log('Reattach image dimensions match:', newImage.height, 'x', newImage.width);
              resolve(imageURI);
            }
            else {
              reject('The selected image (' + newImage.width + ' x ' + newImage.height + ') does not have the same' +
                ' height and width as the original image (' + currentImageData.width + ' x ' + currentImageData.height +
                '). Unable to reattach image.');
            }
          };
          newImage.onerror = function () {
            reject('Failed to load image.');
          };
          newImage.src = imageURI;
        });
      }
      else return Promise.resolve(imageURI);
    }

    function errorAlert(errorMsg) {
      $log.error(errorMsg);
      if (errorMsg === 20) errorMsg = 'StraboSpot Mobile needs file access to use the camera.';

      // Don't show an alert if error message is from $cordovaCamera when the user does not select an image
      if (errorMsg !== 'No Image Selected') {
        $ionicPopup.alert({
          'title': 'Error!',
          'template': errorMsg
        });
      }
    }

    // Get image from camera or local storage
    function getPicture(source) {
      document.addEventListener('deviceready', function () {

        var cameraOptions = {
          'quality': 80,
          'destinationType': Camera.DestinationType.FILE_URI,
          'sourceType': source,
          'encodingType': Camera.EncodingType.JPEG,
          'mediaType': Camera.MediaType.PICTURE,
          'allowEdit': false,
          'correctOrientation': true,
          'saveToPhotoAlbum': source === Camera.PictureSourceType.CAMERA
        };

        return $cordovaCamera.getPicture(cameraOptions)
          .then(gotImageURI)
          .then(checkImageSize)
          .then(saveImageToDevice)
          .then(setImageSourceDevice)
          .then(setImageProperties)
          .then(saveSpot)
          .then(checkForMoreImages)
          .catch(errorAlert)
          .finally(function () {
            $ionicLoading.hide();
          });
      });
    }

    // Start loading spinner after we have an image
    function gotImageURI(imageURI) {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner><br>Adding Image...'
      });
      return Promise.resolve(imageURI);
    }

    // Copy an image from temporary directory to permanent device storage in StraboSpot/Images
    function saveImageToDevice(imageURI) {
      if (angular.isUndefined(currentImageData.id)) currentImageData.id = HelpersFactory.getNewId();
      var imagePathTemp = imageURI.split('?')[0];
      if ($window.cordova) return LocalStorageFactory.copyImage(imagePathTemp, currentImageData.id + '.jpg');
      else {
        $log.warn('No Cordova so cannot save image to device. In development mode?');
        return Promise.reject('Error saving image to device');
      }
    }

    // Save the Spot with the image properties
    function saveSpot() {
      return SpotFactory.save(currentSpot).then(function () {
        $rootScope.$broadcast('spotSaved');
        return getImageById(currentImageData.id).then(function (src) {
          // If reattaching image need a different name for source so reload is forced and cached image not used
          if (isReattachImage) imageSources[currentImageData.id] = src + "?" + new Date().getTime();
          else imageSources[currentImageData.id] = src;
          $log.log('Image Sources:', imageSources);
        });
      });
    }

    // Set the image properties to the current Spot
    function setImageProperties(newImage) {
      if (!isReattachImage) {
        $log.log('Setting image properties ...', newImage);
        return new Promise(function (resolve, reject) {
          newImage.onload = function () {
            $log.log('Loaded image');
            currentImageData.height = newImage.height;
            currentImageData.width = newImage.width;
            $log.log('Image properties:', currentImageData);
            if (angular.isUndefined(currentSpot.properties.images)) currentSpot.properties.images = [];
            currentSpot.properties.images = _.reject(currentSpot.properties.images, function (image) {
              return image.id === currentImageData.id;
            });
            currentSpot.properties.images.push(currentImageData);
            resolve();
          };
          newImage.onerror = function () {
            $log.error('failed image');
            reject('Failed to load image.');
          };
        });
      }
      else return Promise.resolve();
    }

    // Set image source on a device
    function setImageSourceDevice(imageURI) {
      $log.log('Setting source for image on device ...');
      var newImage = new Image();
      newImage.src = "";         // Reset source before loading in case source was previously loaded when checking size
      newImage.src = $window.Ionic.WebView.convertFileSrc(imageURI);
      return Promise.resolve(newImage);
    }

    // Set image source for the web
    function setImageSourceWeb(imageBlob) {
      $log.log('Setting source for image on web ...');
      var newImage = new Image();
      newImage.src = URL.createObjectURL(imageBlob);
      return Promise.resolve(newImage);
    }

    // Upload an image blob to the remote database
    function uploadImageBlob(imageBlob) {
      return new Promise(function (resolve, reject) {
        if (IS_WEB) {
          currentImageData.id = HelpersFactory.getNewId();
          LiveDBFactory.saveImageFile(currentImageData.id, imageBlob)
            .then(function () {
              $log.log('Finished uploading image.');
              resolve(imageBlob);
            })
            .then(function () {
              reject('Error uploading image');
            });
        }
        else reject('You must be online to send an image to the server.');
      });
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

    /*function deleteAllImages() {
      return LocalStorageFactory.getDb().imagesDb.clear().then(function () {
        $log.log('All images deleted from local storage.');
      });
    }*/

    function deleteImage(imageId) {
      return LocalStorageFactory.deleteImageFromFileSystem(imageId);
    }

    // Create an object with the image ids and sources
    function gatherImageSources(spot) {
      var promises = [];
      imageSources = {};
      spot = cleanImagesInSpot(spot);
      _.each(spot.properties.images, function (image) {
        var promise = getImageById(image.id).then(function (src) {
          imageSources[image.id] = src;
        });
        promises.push(promise);
      });
      return Promise.all(promises).then(function () {
        $log.log('Image Sources:', imageSources);
        return Promise.resolve();
      });
    }

    // Get the image source from the device or the remote db
    function getImageById(imageId) {
      if ($window.cordova) return LocalStorageFactory.getImageById(imageId);
      else if (IS_WEB) return LiveDBFactory.getImageSourceRemote(imageId);
      else {
        $log.warn('Not online but no Cordova so unable to get local image source. ' +
          'Running for development?');
        return Promise.resolve('img/image-not-found.png');
      }
    }

    function getImageFileURIById(imageId) {
      return LocalStorageFactory.getImageFileURIById(imageId);
    }

    function getImageFromGallery() {
      takeMorePictures = false;
      return getPicture(Camera.PictureSourceType.PHOTOLIBRARY);
    }

    // Get the image source already in local memory
    function getImageSource(imageId) {
      return imageSources[imageId] || 'img/loading-image.png';
    }

    // Move an image from temporary directory to permanent device storage in StraboSpot/Images
    function saveImageBlobToDevice(imageBlob, imageId) {
      if (angular.isUndefined(currentImageData.id)) currentImageData.id = HelpersFactory.getNewId();
      if ($window.cordova) return LocalStorageFactory.saveImageToFileSystem(imageBlob, imageId.toString() + '.jpg');
      else {
        $log.warn('No Cordova so cannot save image to device. In development mode?');
        return Promise.reject('Error saving image to device');
      }
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
      return getPicture(Camera.PictureSourceType.CAMERA);
    }
  }
}());
