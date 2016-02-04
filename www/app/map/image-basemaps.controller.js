(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapsController', ImageBasemapsController);

  ImageBasemapsController.$inject = ['$location', '$log', 'ImageBasemapFactory', 'SpotFactory'];

  function ImageBasemapsController($location, $log, ImageBasemapFactory, SpotFactory) {
    var vm = this;

    vm.goToImageBasemap = goToImageBasemap;

    activate();

    function activate() {
      getImageBasemaps();
    }

    /**
     *  Private Functions
     */

    function getImageBasemaps() {
      var spots = SpotFactory.getSpots();
      var images = _.flatten(_.compact(_.pluck(spots, 'images')));
      vm.imageBasemaps = _.filter(images, function (image) {
        return image.annotated === true;
      });
      ImageBasemapFactory.setImageBasemaps(vm.imageBasemaps);
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
