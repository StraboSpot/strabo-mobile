(function () {
  'use strict';

  angular
    .module('app')
    .factory('LiveDBFactory', LiveDBFactory);

  //LiveDBFactory.$inject = ['$http', '$log', '$q', 'UserFactory', 'LocalStorageFactory', 'RemoteServerFactory', 'ProjectFactory'];
  //function LiveDBFactory($http, $log, $q, UserFactory, LocalStorageFactory, RemoteServerFactory, ProjectFactory) {

  LiveDBFactory.$inject = ['$http', '$log', '$q', 'HelpersFactory', 'LocalStorageFactory', 'RemoteServerFactory', 'UserFactory'];
  function LiveDBFactory($http, $log, $q, HelpersFactory, LocalStorageFactory, RemoteServerFactory, UserFactory) {

    // Return public API
    return {
      'deleteImageFile': deleteImageFile,
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
       if(HelpersFactory.isWeb() && UserFactory.getUser()){ //are we on the desktop?
         $log.log('Inside LiveDBFactory.deleteImageFile deleting image.');
         RemoteServerFactory.deleteImage(imageId, UserFactory.getUser().encoded_login).then(function () {
           deferred.resolve();
         });
       }else{
         $log.log('Inside LiveDBFactory.deleteImageFile but not in browser or logged out.');
         deferred.resolve();
       }
       return deferred.promise;
     }

     // Save spot, project, and dataset to DB
     function save(spot, project, dataset) {
       var deferred = $q.defer(); // init promise
       var objectToSend = {};
       var jsonToSend = "";
       if(HelpersFactory.isWeb() && UserFactory.getUser()){ //are we on the desktop?
         if(!_.isEmpty(spot)){objectToSend.spot=spot;}
         if(!_.isEmpty(project)){objectToSend.project=project;}
         if(!_.isEmpty(dataset)){objectToSend.dataset=dataset;}
         jsonToSend = angular.toJson(objectToSend);
         $log.log('Inside LiveDBFactory.save jsonToSend:', jsonToSend);
         RemoteServerFactory.uploadProjectDatasetSpot(jsonToSend, UserFactory.getUser().encoded_login).then(function () {
           deferred.resolve();
         });
       }else{
         $log.log('Inside LiveDBFactory.save but not in browser or logged out.');
         deferred.resolve();
       }

     }

     // Save image to DB
     function saveImageFile(imageId, src) {
       var deferred = $q.defer(); // init promise
       if(HelpersFactory.isWeb() && UserFactory.getUser()){ //are we on the desktop?
         $log.log('Inside LiveDBFactory.saveImageFile sending image.');
         RemoteServerFactory.uploadImage(imageId, src, UserFactory.getUser().encoded_login).then(function () {
           deferred.resolve();
         });
       }else{
         $log.log('Inside LiveDBFactory.saveImageFile but not in browser or logged out.');
         deferred.resolve();
       }
       return deferred.promise;
     }




  }
}());
