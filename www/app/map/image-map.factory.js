/**
 * Service for temporarily saving an image map
 */

(function () {
  'use strict';

  angular
    .module('app')
    .factory('ImageMapFactory', ImageMapFactory);

  function ImageMapFactory() {
    var imageMaps = [];
    var currentImageMap;

    return {
      'addImageMap': addImageMap,
      'clearAllImageMaps': clearAllImageMaps,
      'clearCurrentImageMap': clearCurrentImageMap,
      'getCurrentImageMap': getCurrentImageMap,
      'getImageMaps': getImageMaps,
      'removeImageMap': removeImageMap,
      'setCurrentImageMap': setCurrentImageMap
    };

    function addImageMap(imageMap) {
      imageMaps = _.reject(imageMaps, function (image) {
        return image.id === imageMap.id;
      });
      imageMaps.push(imageMap);
    }

    function clearAllImageMaps() {
      imageMaps = [];
    }

    function clearCurrentImageMap() {
      currentImageMap = null;
    }

    function getCurrentImageMap() {
      return currentImageMap;
    }

    function getImageMaps() {
      return imageMaps;
    }

    function removeImageMap(imageMap) {
      imageMaps = _.reject(imageMaps, function (image) {
        return image.id === imageMap.id;
      });
    }

    function setCurrentImageMap(imageMap) {
      currentImageMap = imageMap;
    }
  }
}());
