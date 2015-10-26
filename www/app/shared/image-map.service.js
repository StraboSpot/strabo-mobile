/**
 * Service for temporarily saving an image map
 */

'use strict';

angular
  .module('app')
  .service('ImageMapService', function () {
    var imageMaps = [];
    var currentImageMap;

    var addImageMap = function (imageMap) {
      imageMaps = _.reject(imageMaps, function (image) {
        return image.id === imageMap.id;
      });
      imageMaps.push(imageMap);
    };

    var removeImageMap = function (imageMap) {
      imageMaps = _.reject(imageMaps, function (image) {
        return image.id === imageMap.id;
      });
    };

    var clearAllImageMaps = function () {
      imageMaps = [];
    };

    var getImageMaps = function () {
      return imageMaps;
    };

    var setCurrentImageMap = function (imageMap) {
      currentImageMap = imageMap;
    };

    var getCurrentImageMap = function () {
      return currentImageMap;
    };

    var clearCurrentImageMap = function () {
      currentImageMap = null;
    };

    return {
      'addImageMap': addImageMap,
      'removeImageMap': removeImageMap,
      'clearAllImageMaps': clearAllImageMaps,
      'getImageMaps': getImageMaps,
      'setCurrentImageMap': setCurrentImageMap,
      'getCurrentImageMap': getCurrentImageMap,
      'clearCurrentImageMap': clearCurrentImageMap
    };
  });
