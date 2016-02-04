/**
 * Service for temporarily saving an image basemap
 */

(function () {
  'use strict';

  angular
    .module('app')
    .factory('ImageBasemapFactory', ImageBasemapFactory);

  ImageBasemapFactory.$inject = ['$log'];

  function ImageBasemapFactory($log) {
    var imageBasemaps = [];

    return {
      'addImageBasemap': addImageBasemap,
      'clearAllImageBasemaps': clearAllImageBasemaps,
      'getImageBasemaps': getImageBasemaps,
      'loadImageBasemaps': loadImageBasemaps,
      'removeImageBasemap': removeImageBasemap,
      'setImageBasemaps': setImageBasemaps
    };

    /**
     * Public Functions
     */

    function addImageBasemap(imageBasemap) {
      imageBasemaps = _.reject(imageBasemaps, function (image) {
        return image.id === imageBasemap.id;
      });
      imageBasemaps.push(imageBasemap);
    }

    function clearAllImageBasemaps() {
      imageBasemaps = [];
    }

    function getImageBasemaps() {
      return imageBasemaps;
    }

    function loadImageBasemaps(spots) {
      var images = _.flatten(_.compact(_.pluck(spots, 'images')));
      imageBasemaps = _.filter(images, function (image) {
        return image.annotated === true;
      });
      $log.log('Image Basemaps:', imageBasemaps);
    }

    function removeImageBasemap(imageBasemap) {
      imageBasemaps = _.reject(imageBasemaps, function (image) {
        return image.id === imageBasemap.id;
      });
    }

    function setImageBasemaps(inImageBasemaps) {
      imageBasemaps = inImageBasemaps;
    }
  }
}());
