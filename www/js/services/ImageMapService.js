angular.module('app')

  // Service for temporarily saving an image map
  .service('ImageMapService', function () {
    var imageMaps;
    var currentImageMap;

    var addImageMap = function (imageMap) {
      imageMaps.push(imageMap);
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
      addImageMap: addImageMap,
      getImageMaps: getImageMaps,
      setCurrentImageMap: setCurrentImageMap,
      getCurrentImageMap: getCurrentImageMap,
      clearCurrentImageMap: clearCurrentImageMap
    };
  });
