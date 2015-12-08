/**
 * Service for temporarily saving an image basemap
 */

(function () {
  'use strict';

  angular
    .module('app')
    .factory('ImageBasemapFactory', ImageBasemapFactory);

  function ImageBasemapFactory() {
    var imageBasemaps = [];
    var currentImageBasemap;

    return {
      'addImageBasemap': addImageBasemap,
      'clearAllImageBasemaps': clearAllImageBasemaps,
      'clearCurrentImageBasemap': clearCurrentImageBasemap,
      'getCurrentImageBasemap': getCurrentImageBasemap,
      'getImageBasemaps': getImageBasemaps,
      'removeImageBasemap': removeImageBasemap,
      'setCurrentImageBasemap': setCurrentImageBasemap
    };

    function addImageBasemap(imageBasemap) {
      imageBasemaps = _.reject(imageBasemaps, function (image) {
        return image.id === imageBasemap.id;
      });
      imageBasemaps.push(imageBasemap);
    }

    function clearAllImageBasemaps() {
      imageBasemaps = [];
    }

    function clearCurrentImageBasemap() {
      currentImageBasemap = null;
    }

    function getCurrentImageBasemap() {
      return currentImageBasemap;
    }

    function getImageBasemaps() {
      return imageBasemaps;
    }

    function removeImageBasemap(imageBasemap) {
      imageBasemaps = _.reject(imageBasemaps, function (image) {
        return image.id === imageBasemap.id;
      });
    }

    function setCurrentImageBasemap(imageBasemap) {
      currentImageBasemap = imageBasemap;
    }
  }
}());
