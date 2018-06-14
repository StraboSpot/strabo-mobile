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

    vm.spotsWithThinSections = [];
    vm.thinSectionIdSelected = undefined;

    vm.goToThinSection = goToThinSection;

    activate();

    function activate() {
      ThinSectionFactory.gatherSpotsWithThinSections();
      if ($state.params && $state.params.thinSectionId) vm.thinSectionIdSelected = $state.params.thinSectionId;
      vm.spotsWithThinSections = ThinSectionFactory.getSpotsWithThinSections();
      $log.log('Spots with Thin Sections:', vm.spotsWithThinSections);
    }

    /**
     *  Private Functions
     */

    /**
     *  Public Functions
     */

    function goToThinSection(spotWithThinSection) {
      vm.thinSectionIdSelected = spotWithThinSection.properties.micro.thin_section.thin_section_id;
      $location.path('/app/thin-sections/' + vm.thinSectionIdSelected);
    }
  }
}());
