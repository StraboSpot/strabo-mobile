(function () {
  'use strict';

  angular
    .module('app')
    .controller('ThinSectionTabController', ThinSectionTabController);

  ThinSectionTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory',
    'HelpersFactory', 'SpotFactory', 'ThinSectionFactory'];

  function ThinSectionTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory, HelpersFactory,
                                     SpotFactory, ThinSectionFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var isEdit = false;
    var thisTabName = 'thin-section';

    vm.addOverlayImageModal = {};
    vm.data = {};
    vm.showThinSection = false;

    vm.addOverlayImage = addOverlayImage;
    vm.deleteOverlayImage = deleteOverlayImage;
    vm.editOverlayImage = editOverlayImage;
    vm.getImageLabel = getImageLabel;
    vm.resizeImage = resizeImage;
    vm.saveOverlayImage = saveOverlayImage;
    vm.toggleThinSection = toggleThinSection;
    vm.viewThinSection = viewThinSection;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In ThinSectionTabController');

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
      createModals();
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/spot/micro/thin-section/add-overlay-image-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.addOverlayImageModal = modal;
      });

      // Cleanup the modals when we're done with it!
      $scope.$on('$destroy', function () {
        vm.addOverlayImageModal.remove();
      });
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      vmParent.child = vm;
      FormFactory.setForm('micro', 'thin_section');
      if (vmParent.spot.properties.micro && vmParent.spot.properties.micro.thin_section) {
        $log.log('Thin Section:', vmParent.spot.properties.micro.thin_section);
        vmParent.data = vmParent.spot.properties.micro.thin_section;
        vm.showThinSection = true;
      }
      else vmParent.data = {};
    }

    /**
     * Public Functions
     */

    function addOverlayImage() {
      vm.data = {};
      isEdit = false;
      vm.addOverlayImageModal.show();
    }

    function deleteOverlayImage(imageToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Remove Overlay',
        'template': 'Are you sure you want to remove this image as an overlay on this Thin Section? ' +
        'This will not delete the image itself.'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.micro.thin_section.images = _.reject(
            vmParent.spot.properties.micro.thin_section.images,
            function (image) {
              return image.id === imageToDelete.id;
            });
          if (vmParent.spot.properties.micro.thin_section.images.length === 0) {
            delete vmParent.spot.properties.micro.thin_section.images;
          }
        }
      });
    }

    function editOverlayImage(image) {
      vm.data = image;
      isEdit = true;
      vm.addOverlayImageModal.show();
    }

    function getImageLabel(id) {
      var image = _.find(vmParent.spot.properties.images, function (image) {
        return id === image.id;
      });
      return image && image.title ? image.title : 'Untitled';
    }

    // Resize image preserving image ratio
    function resizeImage(dim) {
      var image = _.find(vmParent.spot.properties.images, function (image) {
        return vm.data.id === image.id;
      });
      if (dim === 'w' && vm.data.image_width) {
        vm.data.image_height =
          Math.round(image.height / image.width * vm.data.image_width);
      }
      else if (dim === 'h' && vm.data.image_height) {
        vm.data.image_width =
          Math.round(image.width / image.height * vm.data.image_height);
      }
      else {
        delete vm.data.image_height;
        delete vm.data.image_width;
      }
    }

    function saveOverlayImage() {
      vm.data = HelpersFactory.cleanObj(vm.data);
      if (!_.isEmpty(vm.data)) {
        var imageUmicroAlready = _.find(vmParent.spot.properties.micro.thin_section.images, function (image) {
          return vm.data.id === image.id;
        });
        if (!isEdit && imageUmicroAlready) {
          $ionicPopup.alert({
            'title': 'Image Umicro Already!',
            'template': 'This image has already been umicro as an overlay in this Thin Section. ' +
            'Select another image or modify the existing overlay with this image.'
          });
          return 0;
        }
        if (!vmParent.spot.properties.micro.thin_section.images) vmParent.spot.properties.micro.thin_section.images = [];
        else {
          vmParent.spot.properties.micro.thin_section.images = _.reject(vmParent.spot.properties.micro.thin_section.images,
            function (image) {
              return vm.data.id === image.id;
            });
        }
        vmParent.spot.properties.micro.thin_section.images.push(vm.data);
        vm.data = {};
        vmParent.saveSpot();
      }
      vm.addOverlayImageModal.hide();
    }

    function toggleThinSection() {
      if (vm.showThinSection) {
        vmParent.spot.properties.micro = {};
        vmParent.spot.properties.micro.thin_section = {};
        vmParent.spot.properties.micro.thin_section.thin_section_id = HelpersFactory.getNewId();
        vmParent.data = vmParent.spot.properties.micro.thin_section;
      }
      if (!vm.showThinSection && !_.isEmpty(vmParent.spot.properties.micro.thin_section)) {
        // ToDo: Do a check here if there are any Spots mapped on the Thin Section - if so can't delete
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Thin Section?',
          'template': 'By toggling off the Thin Section option you will be deleting assoicated Spots. Continue?'
        });
        confirmPopup.then(function (res) {
          if (res) delete vmParent.spot.properties.micro;
          else vm.showThinSection = !vm.showThinSection;
        });
      }
    }

    function viewThinSection() {
      vmParent.submit('/app/thin-sections/' + vmParent.spot.properties.micro.thin_section.thin_section_id);
    }
  }
}());
