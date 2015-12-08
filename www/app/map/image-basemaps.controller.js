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
      var spotsWithImages = _.filter(spots, function (spot) {
        return spot.images;
      });
      _.forEach(spotsWithImages, function (spot) {
        _.forEach(spot.images, function (image) {
          image.title = image.caption ? image.caption.substring(0, 24) : 'Untitled ' + _.indexOf(spot.images,
            image);
          if (image.annotated) {
            image.annotated = true;
            ImageBasemapFactory.addImageBasemap(image);
          }
          else {
            image.annotated = false;
            ImageBasemapFactory.removeImageBasemap(image);
          }
        });
      });
      vm.imageBasemaps = ImageBasemapFactory.getImageBasemaps();
      $log.log(vm.imageBasemaps);
    }

    /**
     *  Public Functions
     */

    function goToImageBasemap(imageBasemap) {
      ImageBasemapFactory.setCurrentImageBasemap(imageBasemap);
      $location.path('/app/image-basemaps/' + imageBasemap.id);
    }
  }
}());
