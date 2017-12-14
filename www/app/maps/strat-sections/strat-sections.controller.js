(function () {
  'use strict';

  angular
    .module('app')
    .controller('StratSectionsController', StratSectionsController);

  StratSectionsController.$inject = ['$ionicPopup', '$location', '$log', '$state', 'HelpersFactory', 'SpotFactory', 'StratSectionFactory'];

  function StratSectionsController($ionicPopup, $location, $log, $state, HelpersFactory, SpotFactory, StratSectionFactory) {
    var vm = this;

    //vm.imageBasemapIdSelected = undefined;
   // vm.imageBasemaps = [];
    vm.spotsWithStratSections = [];
    vm.stratSectionIdSelected = undefined;

    //vm.goToImageBasemap = goToImageBasemap;
    vm.goToStratSection = goToStratSection;

    activate();

    function activate() {
      StratSectionFactory.gatherSpotsWithStratSections();
      if ($state.params && $state.params.imagebasemapId) vm.imageBasemapIdSelected = $state.params.imagebasemapId;
      //getImageBasemaps();
   //   getSpotsWithStratSections();
      vm.spotsWithStratSections = StratSectionFactory.getSpotsWithStratSections();
      $log.log('Spots with Strat Sections:', vm.spotsWithStratSections);
    }

    /**
     *  Private Functions
     */

  /*  function getImageBasemaps() {
      _.each(SpotFactory.getActiveSpots(), function (spot) {
        _.each(spot.properties.images, function (image) {
          if (image.annotated === true && image.image_type && image.image_type === 'strat_section') {
            vm.imageBasemaps.push(image);
          }
        });
      });
      $log.log('Image Basemaps:', vm.imageBasemaps);
    }*/

    /*function getSpotsWithStratSections() {
      _.each(SpotFactory.getActiveSpots(), function (spot) {
        if (spot.properties.strat_section) vm.spotsWithStratSections.push(spot);
      });
      $log.log('Spots with Strat Sections:', vm.spotsWithStratSections);
    }*/

    /**
     *  Public Functions
     */

   /* function goToImageBasemap(imageBasemap) {
      vm.imageBasemapIdSelected = imageBasemap.id;
      $location.path('/app/strat-sections/' + imageBasemap.id);
    }*/

   function goToStratSection(spotWithStratSection) {
   // vm.imageBasemapIdSelected = stratSection.image_id;
    $location.path('/app/strat-sections/' + spotWithStratSection.properties.sed.strat_section.strat_section_id);
  }

    /*function newStratSection() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'New Strat Section',
        'template': 'Are you sure you want to start a new Strat Section with a blank base image?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          var noImageId = HelpersFactory.getId();
          $location.path('/app/strat-sections/' + imageBasemap.id);
        }
      });
    }*/
  }
}());
