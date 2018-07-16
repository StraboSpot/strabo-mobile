(function () {
  'use strict';

  angular
    .module('app')
    .controller('ThinSectionsController', ThinSectionsController);

  ThinSectionsController.$inject = ['$ionicPopup', '$location', '$log', '$state', 'HelpersFactory', 'SpotFactory',
    'ThinSectionFactory'];

  function ThinSectionsController($ionicPopup, $location, $log, $state, HelpersFactory, SpotFactory,
                                   ThinSectionFactory) {
    var vm = this;

    vm.micrographReferences = [];
    vm.spotsWithMicrographs = [];
    vm.thinSectionIdSelected = undefined;

    vm.goToThinSection = goToThinSection;

    activate();

    function activate() {
      //ThinSectionFactory.gatherSpotsWithThinSections();
      if ($state.params && $state.params.thinSectionId) vm.thinSectionIdSelected = $state.params.thinSectionId;
      vm.spotsWithMicrographs = ThinSectionFactory.getSpotsWithMicrographs();
      $log.log('Spots with Micrographs:', vm.spotsWithMicrographs);
      _.each(vm.spotsWithMicrographs, function (spot) {
        _.each(spot.properties.images, function (image) {
          if (image.image_type === 'micrograph_ref') vm.micrographReferences.push(image);
        });
      });
    }

    /**
     *  Private Functions
     */

    /**
     *  Public Functions
     */

    function goToThinSection(spotWithThinSection) {
      vm.thinSectionIdSelected = spotWithThinSection.id;
      $location.path('/app/thin-sections/' + vm.thinSectionIdSelected);
    }
  }
}());
