(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImagesTabController', ImagesTabController);

  ImagesTabController.$inject = ['$cordovaCamera', '$cordovaGeolocation', '$document', '$ionicModal', '$ionicPopup',
    '$log', '$q', '$scope', '$state', '$window', 'FormFactory', 'HelpersFactory', 'ImageFactory', 'LiveDBFactory',
    'LocalStorageFactory', 'ProjectFactory', 'IS_WEB'];

  function ImagesTabController($cordovaCamera, $cordovaGeolocation, $document, $ionicModal, $ionicPopup, $log, $q,
                               $scope, $state, $window, FormFactory, HelpersFactory, ImageFactory, LiveDBFactory,
                               LocalStorageFactory, ProjectFactory, IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;

    var getGeoInfo = false;
    var imageSources = {};
    var isReattachImage = false;
    var thisTabName = 'images';

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
    vm.imageType = 'photo';
    vm.imageTypeChoices = {};
    vm.otherImageType = undefined;
    vm.selectedCameraSource = {};

    vm.addImage = addImage;
    vm.closeModal = closeModal;
    vm.deleteImage = deleteImage;
    vm.exportImage = exportImage;
    vm.getImageSrc = getImageSrc;
    vm.goToImageBasemap = goToImageBasemap;
    vm.isWeb = isWeb;
    vm.moreDetail = moreDetail;
    vm.reattachImage = reattachImage;
    vm.showImages = showImages;
    vm.toggleImageBasemap = toggleImageBasemap;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In ImagesTabController');

      // Loading tab from Spots list
      if ($state.current.name === 'app.spotTab.' + thisTabName) loadTab($state);
      // Loading tab in Map side panel
      $scope.$on('load-tab', function (event, args) {
        if (args.tabName === thisTabName) {
          vmParent.saveSpot().finally(function () {
            vmParent.spotChanged = false;
            loadTab({
              'current': {'name': 'app.spotTab.' + thisTabName},
              'params': {'spotId': args.spotId}
            });
          });
        }
      });
    }

    function loadTab(state) {
      vmParent.loadTab(state);  // Need to load current state into parent
      FormFactory.setForm('image');
      createModals();
      getImageSources();
      checkImageType();     // Set default image type to 'photo' if no image type has been set
      ionic.on('change', getFile, $document[0].getElementById('file'));
    }

    function addGeoInfo(imageData) {
      $cordovaGeolocation.getCurrentPosition().then(function (position) {
        getGeoInfo = false;
        imageData.lat = position.coords.latitude;
        imageData.lng = position.coords.longitude;
        saveSpot(imageData);
      }, function (err) {
        getGeoInfo = false;
        $log.log('Error getting the current position. Ignoring geolocation.');
        saveSpot(imageData);
      });
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

    // Set default image type to 'photo' if no image type has been set
    function checkImageType() {
      _.each(vmParent.spot.properties.images, function (image, i) {
        if (!image.image_type ||
          _.isEmpty(image.image_type)) vmParent.spot.properties.images[i]['image_type'] = 'photo';
      });
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/spot/images/image-properties-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.imagePropertiesModal = modal;
      });
    }

    function getFile(event) {
      $log.log('Getting file ....');
      var file = event.target.files[0];
      readDataUrl(file);
    }

    function getImageSources() {
      var promises = [];
      imageSources = [];
      _.each(vmParent.spot.properties.images, function (image) {
        var promise = ImageFactory.getImageById(image.id).then(function (src) {
          if (IS_WEB) imageSources[image.id] = "https://strabospot.org/pi/" + image.id;
          else if (src) imageSources[image.id] = src;
          else imageSources[image.id] = 'img/image-not-found.png';
        });
        promises.push(promise);
      });
      return $q.all(promises).then(function () {
        $log.log('Image Sources:', imageSources);
      });
    }

    function getImageType(imageData, image) {
      var imageTypeField = _.findWhere(FormFactory.getForm().survey, {'name': 'image_type'});
      vm.imageTypeChoices = _.filter(FormFactory.getForm().choices, function (choice) {
        return choice['list name'] === imageTypeField.type.split(" ")[1]
      });
      var template = '<ion-radio ng-repeat="choice in vmChild.imageTypeChoices" ng-value="choice.name" ng-model="vmChild.imageType">{{ choice.label }}</ion-radio> ' +
        '<div ng-show="vmChild.imageType === \'other_image_ty\'">' +
        '<ion-input class="item item-input"> ' +
        '<input type="text" placeholder="Enter Other Image Type" ng-model="vmChild.otherImageType"> ' +
        '</ion-input></div>';

      var imageTypePopup = $ionicPopup.show({
        'title': 'Select a Type for this Image:',
        'template': template,
        'scope': $scope,
        'buttons': [{
          'text': 'Cancel'
        }, {
          'text': '<b>OK</b>',
          'type': 'button-positive',
          'onTap': function (e) {
            if (vm.imageType === 'other_image_ty' && vm.otherImageType === undefined) e.preventDefault();
            else return e;
          }
        }]
      });

      imageTypePopup.then(function (res) {
        if (res) {
          imageData.image_type = vm.imageType;
          if (vm.imageType === 'other_image_ty') imageData.other_image_type = vm.otherImageType;
          ImageFactory.saveImage(imageData.id, image.src);
          $log.log('Also save image to live db here');
          LiveDBFactory.saveImageFile(imageData.id, image.src);

          imageSources[imageData.id] = image.src;
          if (getGeoInfo) addGeoInfo(imageData);
          else {
            var confirmPopup = $ionicPopup.confirm({
              'title': 'Get Geolocation?',
              'template': 'Use current latitude and longitude for this image?',
              'cancelText': 'No'
            });
            confirmPopup.then(function (res) {
              if (res) addGeoInfo(imageData);
              else saveSpot(imageData);
            });
          }
        }
      });
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
        getGeoInfo = false;
        if (source === 'PHOTOLIBRARY') source = Camera.PictureSourceType.PHOTOLIBRARY;
        else if (source === 'SAVEDPHOTOALBUM') source = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        else if (source === 'CAMERA') {
          getGeoInfo = true;
          source = Camera.PictureSourceType.CAMERA;
        }

        var cameraOptions = {
          'quality': 100,
          'destinationType': Camera.DestinationType.FILE_URI,
          'sourceType': source,
          'allowEdit': false,
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
            getGeoInfo = false;
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
      if (angular.isUndefined(vmParent.spot.properties.images)) {
        vmParent.spot.properties.images = [];
      }

      var reader = new FileReader();
      var image = new Image();
      reader.onloadend = function (evt) {
        // $log.log('Read as data URL');
        // $log.log(evt.target.result);
        image.src = evt.target.result;
        image.onload = function () {
          if (isReattachImage) {
            if (image.height === vmParent.data.height && image.width === vmParent.data.width) {
              ImageFactory.saveImage(vmParent.data.id, image.src).then(function () {
                $log.log('Also save image to live db here');
                LiveDBFactory.saveImageFile(vmParent.data.id, image.src);
                isReattachImage = false;
                getImageSources();
                $ionicPopup.alert({
                  'title': 'Finished Reattaching Image',
                  'template': 'The selected image source was reattached to the selected image properties.'
                });
              });
            }
            else {
              $ionicPopup.alert({
                'title': 'Mismatched Image',
                'template': 'The selected image does not have the same height and width as the original. Unable to reattach image.'
              });
            }
          }
          else {
            var imageData = {
              'height': image.height,
              'width': image.width,
              'id': HelpersFactory.getNewId()
            };
            getImageType(imageData, image);
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

    function saveSpot(imageData) {
      vmParent.spot.properties.images.push(imageData);
      vmParent.submit();
      $log.log('Also save spot to live db', vmParent.spot);
      LiveDBFactory.save(vmParent.spot, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
    }

    /**
     * Public Functions
     */

    function addImage() {
      vm.imageType = 'photo';
      vm.otherImageType = undefined;
      isReattachImage = false;
      vm.selectedCameraSource = {
        'source': 'CAMERA'  // default is always camera
      };
      if (IS_WEB) ionic.trigger('click', {'target': $document[0].getElementById('file')});
      else cameraModal();
    }

    function closeModal(modal) {
      if (modal === 'imagePropertiesModal') {
        if (FormFactory.validate(vmParent.data)) vm[modal].hide();
      }
      else vm[modal].hide();
    }

    function deleteImage() {
      if (!isImageUsed(vmParent.data)) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Image',
          'template': 'Are you sure you want to delete this image?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            vmParent.spot.properties.images = _.reject(vmParent.spot.properties.images, function (image) {
              return vmParent.data.id === image.id;
            });
            ProjectFactory.destroyImage(vmParent.data.id);              // Delete from project (eg linked images)
            ImageFactory.deleteImage(vmParent.data.id);                 // Delete from local storage
            $log.log('delete remote image: ' + vmParent.data.id);
            LiveDBFactory.deleteImageFile(vmParent.data.id);            // Delete from server
            delete imageSources[vmParent.data.id];                      // Delete from global images object
            vmParent.data = {};
            vm.imagePropertiesModal.hide();
          }
        });
      }
    }

    function exportImage() {
      ImageFactory.getImageById(vmParent.data.id).then(function (base64Image) {
        if (IS_WEB) $window.open(base64Image, '_blank');
        else {
          // Process the base64 string - split the base64 string into the data and data type
          var block = base64Image.split(';');
          var dataType = block[0].split(':')[1];    // In this case 'image/jpg'
          var base64Data = block[1].split(',')[1];  // In this case 'iVBORw0KGg....'
          var dataBlob = HelpersFactory.b64toBlob(base64Data, dataType);
          var filename = (vmParent.data.title || vmParent.data.id) + '.jpg';
          LocalStorageFactory.exportImage(dataBlob, filename).then(function (filePath) {
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'Image saved to ' + filePath
            });
          }, function (error) {
            $ionicPopup.alert({
              'title': 'Error!',
              'template': 'Unable to save image.' + error
            });
          });
        }
      });
    }

    function getImageSrc(imageId) {
      return imageSources[imageId] || 'img/loading-image.png';
    }

    function goToImageBasemap(image) {
      vmParent.submit('/app/image-basemaps/' + image.id);
    }

    function isWeb() {
      return IS_WEB;
    }

    function moreDetail(image) {
      vmParent.data = image;
      vm.imagePropertiesModal.show();
    }

    function reattachImage() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Reattach Image',
        'template': 'Select an image from your device to reattach the source to the selected image properties. Continue?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          isReattachImage = true;
          vm.selectedCameraSource = {
            'source': 'PHOTOLIBRARY'
          };
          cameraModal();
        }
      });
    }

    function showImages(index) {
      vm.activeSlide = index;
      $ionicModal.fromTemplateUrl('app/spot/images/images-modal.html', {
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

      // Only allow toggle off if no spots mapped on this image
      if (!image.annotated) {
        var imageUsed = isImageUsed(image);
        if (imageUsed) image.annotated = true;
      }
    }
  }
}());
