(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImagesTabController', ImagesTabController);

  ImagesTabController.$inject = ['$document', '$http', '$ionicModal', '$ionicPopup', '$ionicScrollDelegate',
    '$ionicSlideBoxDelegate', '$log', '$q', '$rootScope', '$scope', '$state', '$window', 'FormFactory',
    'HelpersFactory', 'ImageFactory', 'LiveDBFactory', 'LocalStorageFactory', 'ProjectFactory', 'RemoteServerFactory',
    'SpotFactory', 'UserFactory', 'IS_WEB'];

  function ImagesTabController($document, $http, $ionicModal, $ionicPopup, $ionicScrollDelegate, $ionicSlideBoxDelegate,
                               $log, $q, $rootScope, $scope, $state, $window, FormFactory, HelpersFactory, ImageFactory,
                               LiveDBFactory, LocalStorageFactory, ProjectFactory, RemoteServerFactory, SpotFactory,
                               UserFactory, IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;

    var imageSources = {};
    var newImageData = {};
    var thisTabName = 'images';

    vm.activeSlide = null;
    vm.imagePropertiesModal = {};
    vm.imageType = undefined;
    vm.imageTypeChoices = {};
    vm.otherImageType = undefined;
    vm.zoomMin = 1;

    vm.addImage = addImage;
    vm.closeModal = closeModal;
    vm.deleteImage = deleteImage;
    vm.exportImage = exportImage;
    vm.getImageSrc = getImageSrc;
    vm.goToImageBasemap = goToImageBasemap;
    vm.isWeb = isWeb;
    vm.moreDetail = moreDetail;
    vm.reattachImage = reattachImage;
    vm.saveImageProperties = saveImageProperties;
    vm.showImages = showImages;
    vm.takePicture = takePicture;
    vm.toggleImageBasemap = toggleImageBasemap;
    vm.updateSlideStatus = updateSlideStatus;

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

      $rootScope.$on('updatedImages', function () {
        vmParent.spotChanged = false;
        if (IS_WEB) getImageSources();
        else activate();
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
      var file = event.target.files[0];
      if (file) {
        $log.log('Getting file ....');
        ImageFactory.readFile(file);
      }
    }

    function getImageSources() {
      var promises = [];
      imageSources = {};
      _.each(vmParent.spot.properties.images, function (image) {
        var promise = ImageFactory.getImageById(image.id).then(function (src) {
          if (IS_WEB && UserFactory.getUser()) {
            // Check that the image exists on the server and then grab the URL for it
            return RemoteServerFactory.verifyImageExistance(image.id, UserFactory.getUser().encoded_login).then(
              function (response) {
                $log.log('Image', image, 'in Spot', vmParent.spot.properties.id, vmParent.spot,
                  'EXISTS on server. Server response', response);
                imageSources[image.id] = "https://strabospot.org/pi/" + image.id;
              },
              function (response) {
                $log.error('Image', image, 'in Spot', vmParent.spot.properties.id, vmParent.spot,
                  'DOES NOT EXIST on server. Server response', response);
                imageSources[image.id] = 'img/image-not-found.png';
              });
          }
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
      var deferred = $q.defer(); // init promise
      vm.imageType = undefined;
      var imageTypeField = _.findWhere(FormFactory.getForm().survey, {'name': 'image_type'});
      vm.imageTypeChoices = _.filter(FormFactory.getForm().choices, function (choice) {
        return choice['list_name'] === imageTypeField.type.split(" ")[1]
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
          if (vm.imageType === 'micrograph') {
            vm.micrographImageType = undefined;
            var micrographImageTypeField = _.findWhere(FormFactory.getForm().survey, {'name': 'micrograph_image_type'});
            vm.micrographImageTypeChoices = _.filter(FormFactory.getForm().choices, function (choice) {
              return choice['list_name'] === micrographImageTypeField.type.split(" ")[1]
            });
            var template = '<ion-radio ng-repeat="choice in vmChild.micrographImageTypeChoices" ' +
              'ng-value="choice.name" ng-model="vmChild.micrographImageType">{{ choice.label }}</ion-radio> ' +
              '<div ng-show="vmChild.micrographImageType === \'other_microgra\'">' +
              '<ion-input class="item item-input"> ' +
              '<input type="text" placeholder="Enter Other Micrograph Image Type" ' +
              'ng-model="vmChild.otherMicrographImageType"> ' +
              '</ion-input></div>';

            var micrographImageTypePopup = $ionicPopup.show({
              'title': 'Select a Micrograph Type for this Image:',
              'template': template,
              'scope': $scope,
              'buttons': [{
                'text': 'Cancel'
              }, {
                'text': '<b>OK</b>',
                'type': 'button-positive',
                'onTap': function (e) {
                  if (vm.imageType === 'other_microgra' && vm.otherMicrographImageType === undefined) e.preventDefault();
                  else return e;
                }
              }]
            });

            micrographImageTypePopup.then(function (res2) {
              if (res2) {
                deferred.resolve({'image_type': vm.imageType, 'other_image_type': vm.otherImageType,
                  'micrograph_image_type': vm.micrographImageType,
                  'other_micrograph_image_type': vm.otherMicrographImageType});
              }
              else deferred.reject();
            });
          }
          else deferred.resolve({'image_type': vm.imageType, 'other_image_type': vm.otherImageType});
        }
        else deferred.reject();
      });
      return deferred.promise;
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

    /**
     * Public Functions
     */

    function addImage() {
      getImageType().then(function (imageProps) {
        newImageData.image_type = imageProps.image_type;
        if (newImageData.image_type === 'other_image_ty') newImageData.other_image_type = imageProps.other_image_type;
        else if (imageProps.image_type === 'micrograph') {
          newImageData.micrograph_image_type = imageProps.micrograph_image_type;
          newImageData.title = vmParent.spot.properties.name + ' ' + newImageData.micrograph_image_type;
          newImageData.annotated = true;
          if (newImageData.micrograph_image_type === 'other_microgra') {
            newImageData.other_micrograph_image_type = imageProps.other_micrograph_image_type;
          }
        }
        else if (imageProps.image_type === 'micrograph_ref') {
          newImageData.title = vmParent.spot.properties.name + ' Micrograph Reference';
          newImageData.annotated = true;
        }
        ImageFactory.setIsReattachImage(false);
        ImageFactory.setCurrentSpot(vmParent.spot);
        ImageFactory.setCurrentImage(angular.fromJson(angular.toJson(newImageData)));
        if (IS_WEB) document.getElementById('file').click();
        else ImageFactory.getImageFromGallery();
      });
    }

    function closeModal(modal) {
      if (modal === 'imagePropertiesModal' && FormFactory.validate(vmParent.data)) vm[modal].hide();
      else vm[modal].hide();
      vmParent.data = {};
    }

    function deleteImage() {
      // ToDo: Do a check here if image is being used as a Strat Section overlay
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
        if (IS_WEB) {
          var image = new Image();
          image.src = base64Image;
          var win = $window.open();
          win.document.write(image.outerHTML);
        }
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
      SpotFactory.clearCurrentSpot();
      vmParent.submit('/app/image-basemaps/' + image.id);
    }

    function isWeb() {
      return IS_WEB;
    }

    function moreDetail(image) {
      // Fix thin_section field from previous fields to new field added with micro
      if (image.image_type === 'thin_section') image.image_type = 'micrograph';

      vmParent.data = angular.fromJson(angular.toJson(image));
      vm.imagePropertiesModal.show();
    }

    function reattachImage() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Reattach Image',
        'template': 'Select an image from your device to reattach the source to the selected image properties. Continue?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ImageFactory.setIsReattachImage(true);
          ImageFactory.setCurrentSpot(vmParent.spot);
          ImageFactory.setCurrentImage(vmParent.data);
          ImageFactory.getImageFromGallery();
        }
      });
    }

    function saveImageProperties() {
      if (FormFactory.validate(vmParent.data)) {
        vm.imagePropertiesModal.hide();
        vmParent.spot.properties.images = _.reject(vmParent.spot.properties.images, function (image) {
          return image.id === vmParent.data.id;
        });
        vmParent.spot.properties.images.push(vmParent.data);
        vmParent.saveSpot().then(function () {
          vmParent.spotChanged = false;
          vmParent.data = {};
        });
      }
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

    function takePicture() {
      ImageFactory.setIsReattachImage(false);
      ImageFactory.setCurrentSpot(vmParent.spot);
      ImageFactory.setCurrentImage({'image_type': 'photo'});
      ImageFactory.takePicture();
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

    function updateSlideStatus(slide) {
      var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
      if (zoomFactor == vm.zoomMin) $ionicSlideBoxDelegate.enableSlide(true);
      else $ionicSlideBoxDelegate.enableSlide(false);
    }
  }
}());
