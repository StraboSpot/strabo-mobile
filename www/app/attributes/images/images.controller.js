(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImagesController', ImagesController);

  ImagesController.$inject = ['$ionicHistory', '$ionicPopover', '$ionicPopup', '$location', '$log', '$q', '$scope',
    'DataModelsFactory', 'ImageFactory', 'HelpersFactory', 'ProjectFactory', 'SpotFactory', 'IS_WEB'];

  function ImagesController($ionicHistory, $ionicPopover, $ionicPopup, $location, $log, $q, $scope, DataModelsFactory,
                            ImageFactory, HelpersFactory, ProjectFactory, SpotFactory, IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;

    var imageSources = {};

    vm.filteredImages = [];
    vm.imageIdSelected = undefined;
    vm.images = [];
    vm.imagesToDisplay = [];
    vm.isSelecting = false;
    vm.linkedImagesSets = [];
    vm.popover = {};
    vm.selectedImages = [];
    vm.selectedType = 'all';
    vm.showLinkedImagesSets = false;

    vm.deselectImages = deselectImages;
    vm.filterImagesType = filterImagesType;
    vm.getImageSrc = getImageSrc;
    vm.getLabel = getLabel;
    vm.imageClicked = imageClicked;
    vm.isWeb = isWeb;
    vm.linkImages = linkImages;
    vm.loadMoreImages = loadMoreImages;
    vm.moreImagesCanBeLoaded = moreImagesCanBeLoaded;
    vm.selectImages = selectImages;
    vm.unlinkImages = unlinkImages;
    vm.viewAllImages = viewAllImages;
    vm.viewLinkedImages = viewLinkedImages;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      gatherImages();
      createPopover();
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/attributes/images/images-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });
    }

    function gatherImages() {
      var promises = [];
      imageSources = [];
      var spots = angular.fromJson(angular.toJson(SpotFactory.getActiveSpots()));
      _.each(spots, function (spot) {
        if (spot.properties.images) {
          _.each(spot.properties.images, function (image) {
            image.spotId = spot.properties.id;
            vm.images.push(image);
            var promise = ImageFactory.getImageById(image.id).then(function (src) {
              if (IS_WEB) imageSources[image.id] = "https://strabospot.org/pi/" + image.id;
              else if (src) imageSources[image.id] = src;
              else imageSources[image.id] = 'img/image-not-found.png';
            });
            promises.push(promise);
          });
        }
      });
      $log.log('All Images:', vm.images);
      vm.filteredImages = vm.images;
      if (IS_WEB) vm.imagesToDisplay = vm.filteredImages;
      else vm.imagesToDisplay = vm.filteredImages.slice(0, 10);
      return $q.all(promises).then(function () {
        //$log.log('Image Sources:', imageSources);
      });
    }

    function goToImage(image) {
      vm.imageIdSelected = image.id;
      if (!IS_WEB) HelpersFactory.setBackView($ionicHistory.currentView().url);
      $location.path('/app/spotTab/' + image.spotId + '/images');
    }

    function selectImage(image) {
      if (_.indexOf(vm.selectedImages, image.id) === -1) {
        vm.selectedImages.push(image.id);
        setSelectedStyle(image);
      }
      else {
        vm.selectedImages = _.without(vm.selectedImages, image.id);
        setUnselectedStyle(image);
      }
    }

    function setSelectedStyle(image) {
      var imageElement = document.getElementById(image.id);
      imageElement.style.height = '150px';
      imageElement.style.width = '150px';
      imageElement.style.background = 'blue';
      imageElement.style.border = '10px';
      imageElement.style.borderStyle = 'solid';
    }

    function setUnselectedStyle(image) {
      var imageElement = document.getElementById(image.id);
      imageElement.style.height = '200px';
      imageElement.style.width = '200px';
      imageElement.style.background = 'none';
      imageElement.style.border = '0px';
      imageElement.style.borderStyle = 'none';
    }

    /**
     * Public Functions
     */

    function deselectImages() {
      vm.popover.hide();
      vm.isSelecting = false;
      _.each(vm.selectedImages, function (selectedImageId) {
        setUnselectedStyle({'id': selectedImageId});
      });
      vm.selectedImages = [];
    }

    function filterImagesType() {
      if (vm.selectedType === 'all') vm.filteredImages = vm.images;
      else {
        vm.filteredImages = _.filter(vm.images, function (image) {
          return image.image_type === vm.selectedType;
        });
      }
      if (IS_WEB) vm.imagesToDisplay = vm.filteredImages;
      else vm.imagesToDisplay = vm.filteredImages.slice(0, 10);
    }

    function getImageSrc(imageId) {
      return imageSources[imageId] || 'img/loading-image.png';
    }

    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
    }

    function imageClicked(image) {
      if (!vm.isSelecting) goToImage(image);
      else selectImage(image);
    }

    function isWeb() {
      return IS_WEB;
    }

    function linkImages() {
      $log.log('Selected Images Ids:', vm.selectedImages);
      var linkedImages = ProjectFactory.getLinkedImagesAll() || [];
      // Split linkedImages into two sets, first which is the arrays that have no intersection with selectedImages
      // (partition[0]) and second, the arrays which DO have an intersection with selectedImages (partition[1])
      var partition = _.partition(linkedImages, function (linkedImageSet) {
        return (_.isEmpty(_.intersection(linkedImageSet, vm.selectedImages)));
      });
      linkedImages = partition[0];
      var linkIntersections = partition[1];
      // If there are no intersections with any of the arrays in linkedImages and the selectedImages array
      if (_.isEmpty(linkIntersections)) {
        linkedImages.push(vm.selectedImages);
        $ionicPopup.alert({
          'title': 'New Linked Images Set!',
          'template': 'A new set of linked images was created. Images in this set which are Image Basemaps will' +
          ' appear as alternate base layers in the layer switcher when viewing any of the Image Basemaps in this set.'
        });
      }
      // If there ARE intersections between any of the arrays in linkedImages and the selectedImages array, join
      // these intersecting arrays and the selectImages array then push onto the linkedImages array
      else {
        linkedImages.push(_.union(_.flatten(linkIntersections), vm.selectedImages));
        $ionicPopup.alert({
          'title': 'Images Added to Existing Set!',
          'template': 'Selected images were added to an existing set of linked Images.'
        });
      }
      $log.log('All Sets of Linked Images Ids:', linkedImages);
      ProjectFactory.saveProjectItem('linked_images', linkedImages);
      deselectImages();
    }

    function loadMoreImages() {
      vm.imagesToDisplay = vm.filteredImages.slice(0, vm.imagesToDisplay.length + 10);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    function moreImagesCanBeLoaded() {
      return vm.imagesToDisplay !== vm.filteredImages.length;
    }

    function selectImages() {
      vm.popover.hide();
      vm.isSelecting = true;
    }

    function unlinkImages(i) {
      vm.popover.hide();
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Unlink Images',
        'template': 'Are you sure you want to unlink ALL the images in this set?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.unlinkImages(vm.linkedImagesSets[i][0].id);
          vm.linkedImagesSets.splice(i, 1);
          $log.log('All Sets of Linked Images:', vm.linkedImagesSets);
        }
      });
    }

    function viewAllImages() {
      vm.popover.hide();
      vm.showLinkedImagesSets = false;
    }

    function viewLinkedImages() {
      vm.popover.hide();
      vm.showLinkedImagesSets = true;
      vm.linkedImagesSets = [];
      var linkedImagesIdsSets = ProjectFactory.getLinkedImagesAll();
      $log.log('All Sets of Linked Images Ids:', linkedImagesIdsSets);
      _.each(linkedImagesIdsSets, function (linkedImagesIdsSet) {
       var linkedImages =  _.filter(vm.images, function (image) {
          return _.contains(linkedImagesIdsSet, image.id);
        });
       vm.linkedImagesSets.push(linkedImages);
      });
      $log.log('All Sets of Linked Images:', vm.linkedImagesSets);
    }
  }
}());
