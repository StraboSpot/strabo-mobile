'use strict';

angular.module('app')
  .factory('StraboServerFactory', function(
    $http) {

    var factory = {};

    var straboRootUrl = "http://strabospot.org";


    /////////
    // the following below should correspond to strabo server API documentation
    /////////


    factory.createFeature = function() {};
    factory.updateFeature = function() {};
    factory.getFeature = function() {};
    factory.deleteFeature = function() {};
    factory.search = function() {};


    factory.authenticate = function(payload) {
      return $http({
        method: "POST",
        url: straboRootUrl + "/userAuthenticate",
        data: {
          "email": payload.email,
          "password": payload.password
        }
      });
    };


    factory.uploadImage = function() {};
    factory.getImage = function() {};
    factory.deleteImage = function() {};
    factory.getAllImages = function() {};




    return factory;
  });
