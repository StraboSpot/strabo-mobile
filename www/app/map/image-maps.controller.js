(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageMapsController', ImageMapsController);

  ImageMapsController.$inject = ['$location', '$log', 'ImageMapFactory', 'SpotsFactory'];

  function ImageMapsController($location, $log, ImageMapFactory, SpotsFactory) {
    var vm = this;
    vm.goToImageMap = goToImageMap;

    activate();

    function activate() {
      getImageMaps();
    }

    /**
     *  Private Functions
     */

    function getImageMaps() {
      SpotsFactory.all().then(function (spots) {
        var spotsWithImages = _.filter(spots, function (spot) {
          return spot.images;
        });
        _.forEach(spotsWithImages, function (spot) {
          _.forEach(spot.images, function (image) {
            image.title = image.caption ? image.caption.substring(0, 24) : 'Untitled ' + _.indexOf(spot.images,
              image);
            if (image.annotated) {
              image.annotated = true;
              ImageMapFactory.addImageMap(image);
            }
            else {
              image.annotated = false;
              ImageMapFactory.removeImageMap(image);
            }
          });
        });
        vm.imageMaps = ImageMapFactory.getImageMaps();
        $log.log(vm.imageMaps);
      });
    }

    /**
     *  Public Functions
     */

    function goToImageMap(imageMap) {
      ImageMapFactory.setCurrentImageMap(imageMap);
      $location.path('/app/image-maps/' + imageMap.id);
    }
  }
}());
