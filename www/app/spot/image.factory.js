(function () {
  'use strict';

  angular
    .module('app')
    .factory('ImageFactory', ImageFactory);

  ImageFactory.$inject = ['$log', 'LocalStorageFactory'];

  function ImageFactory($log, LocalStorageFactory) {

    return {
      'deleteAllImages': deleteAllImages,
      'deleteImage': deleteImage,
      'getImageById': getImageById,
      'saveImage': saveImage
    };

    /**
     * Public Functions
     */

    function deleteAllImages() {
      return LocalStorageFactory.getDb().imagesDb.clear().then(function () {
        $log.log('All images deleted from local storage.');
      });
    }

    function deleteImage(imageId) {
      return LocalStorageFactory.getDb().imagesDb.removeItem(imageId.toString());
    }

    function getImageById(imageId) {
      return LocalStorageFactory.getDb().imagesDb.getItem(imageId.toString());
    }

    function saveImage(imageId, base64Image) {
      return LocalStorageFactory.getDb().imagesDb.setItem(imageId.toString(), base64Image)
    }
  }
}());
