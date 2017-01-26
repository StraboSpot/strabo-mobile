(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapsController', ImageBasemapsController);

  ImageBasemapsController.$inject = ['$location', '$log', '$state', 'SpotFactory'];

  function ImageBasemapsController($location, $log, $state, SpotFactory) {
    var vm = this;

    vm.imageBasemapIdSelected = undefined;
    vm.imageBasemaps = [];

    vm.goToImageBasemap = goToImageBasemap;

    activate();

    function activate() {
      if ($state.params && $state.params.imagebasemapId) vm.imageBasemapIdSelected = $state.params.imagebasemapId;
      getImageBasemaps();
    }

    /**
     *  Private Functions
     */

    function getImageBasemaps() {
      _.each(SpotFactory.getActiveSpots(), function (spot) {
        _.each(spot.properties.images, function (image) {
          if (image.annotated === true) vm.imageBasemaps.push(image);
        });
      });
      $log.log('Image Basemaps:', vm.imageBasemaps);
    }

    /**
     *  Public Functions
     */

    function goToImageBasemap(imageBasemap) {
      vm.imageBasemapIdSelected = imageBasemap.id;
      $location.path('/app/image-basemaps/' + imageBasemap.id);
    }
  }
}());
