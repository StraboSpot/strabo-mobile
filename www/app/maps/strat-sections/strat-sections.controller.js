(function () {
  'use strict';

  angular
    .module('app')
    .controller('StratSectionsController', StratSectionsController);

  StratSectionsController.$inject = ['$ionicPopup', '$location', '$log', '$state', 'HelpersFactory', 'SpotFactory',
    'StratSectionFactory'];

  function StratSectionsController($ionicPopup, $location, $log, $state, HelpersFactory, SpotFactory,
                                   StratSectionFactory) {
    var vm = this;

    vm.spotsWithStratSections = [];
    vm.stratSectionIdSelected = undefined;

    vm.goToStratSection = goToStratSection;

    activate();

    function activate() {
      StratSectionFactory.gatherSpotsWithStratSections();
      if ($state.params && $state.params.stratSectionId) vm.stratSectionIdSelected = $state.params.stratSectionId;
      vm.spotsWithStratSections = StratSectionFactory.getSpotsWithStratSections();
      $log.log('Spots with Strat Sections:', vm.spotsWithStratSections);
    }

    /**
     *  Private Functions
     */

    /**
     *  Public Functions
     */

    function goToStratSection(spotWithStratSection) {
      vm.stratSectionIdSelected = spotWithStratSection.properties.sed.strat_section.strat_section_id;
      $location.path('/app/strat-sections/' + vm.stratSectionIdSelected);
    }
  }
}());
