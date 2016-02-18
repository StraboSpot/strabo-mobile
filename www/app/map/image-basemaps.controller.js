(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapsController', ImageBasemapsController);

  ImageBasemapsController.$inject = ['$location', '$log', 'SpotFactory'];

  function ImageBasemapsController($location, $log, SpotFactory) {
    var vm = this;

    vm.goToImageBasemap = goToImageBasemap;
    vm.imageBasemaps = [];

    activate();

    function activate() {
      getImageBasemaps();
    }

    /**
     *  Private Functions
     */

    function getImageBasemaps() {
      _.each(SpotFactory.getSpots(), function (spot) {
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
      $location.path('/app/image-basemaps/' + imageBasemap.id);
    }
  }
}());
