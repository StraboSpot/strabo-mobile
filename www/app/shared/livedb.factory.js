(function () {
  'use strict';

  angular
    .module('app')
    .factory('LiveDBFactory', LiveDBFactory);

  LiveDBFactory.$inject = ['$log', '$q', 'RemoteServerFactory', 'UserFactory', 'IS_WEB'];

  function LiveDBFactory($log, $q, RemoteServerFactory, UserFactory, IS_WEB) {

    // Return public API
    return {
      'deleteImageFile': deleteImageFile,
      'getImageSourceRemote': getImageSourceRemote,
      'save': save,
      'saveImageFile': saveImageFile
    };

    /**
     * Private Functions
     */


    /**
     * Public Functions
     */

    // Delete image from DB
    function deleteImageFile(imageId) {
      var deferred = $q.defer(); // init promise
      if (IS_WEB && UserFactory.getUser()) { //are we on the desktop?
        $log.log('Inside LiveDBFactory.deleteImageFile deleting image.');
        RemoteServerFactory.deleteImage(imageId, UserFactory.getUser().encoded_login).then(function () {
          deferred.resolve();
        });
      }
      else {
        $log.log('Inside LiveDBFactory.deleteImageFile but not in browser or logged out.');
        deferred.resolve();
      }
      return deferred.promise;
    }

    function getImageSourceRemote(imageId) {
      if (IS_WEB && UserFactory.getUser()) {
        return RemoteServerFactory.verifyImageExistance(imageId, UserFactory.getUser().encoded_login)
          .then(function (response) {
              $log.log('Image', imageId, 'EXISTS on server. Server response', response);
              return Promise.resolve("https://strabospot.org/pi/" + imageId);
            },
            function (response) {
              $log.error('Image', imageId, 'DOES NOT EXIST on server. Server response', response);
              return Promise.resolve('img/image-not-found.png');
            });
      }
      else return Promise.reject('Must be logged in to get images!');
    }

    // Save spot, project, and dataset to DB
    function save(spot, project, dataset) {
      var deferred = $q.defer(); // init promise
      var objectToSend = {};
      var jsonToSend = "";
      if (IS_WEB && UserFactory.getUser()) { //are we on the desktop?
        if (!_.isEmpty(spot)) objectToSend.spot = spot;
        if (!_.isEmpty(project)) objectToSend.project = project;
        if (!_.isEmpty(dataset)) objectToSend.dataset = dataset;
        jsonToSend = angular.toJson(objectToSend);
        $log.log('Inside LiveDBFactory.save jsonToSend:', jsonToSend);
        RemoteServerFactory.uploadProjectDatasetSpot(jsonToSend, UserFactory.getUser().encoded_login).then(function () {
          deferred.resolve();
        });
      }
      else {
        $log.log('Inside LiveDBFactory.save but not in browser or logged out.');
        deferred.resolve();
      }
    }

    // Save image to remote DB
    function saveImageFile(imageId, imageBlob) {
      if (IS_WEB && UserFactory.getUser()) { //are we on the desktop?
        $log.log('Uploading image', imageId, 'to remote DB ...');
        return RemoteServerFactory.uploadImage(imageId, imageBlob, UserFactory.getUser().encoded_login);
      }
      else Promise.reject('You must be logged in to send image to remote DB.');
    }
  }
}());
