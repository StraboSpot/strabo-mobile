'use strict';

angular.module('app')
  .factory('LoginFactory', function() {

    var factory = {};


    var login;



    factory.setLogin = function(loginInfo) {
      // attempt to call http and validate credentials
      // TODO

      // actually set the login for long term session
      login = loginInfo;
    }

    factory.getLogin = function() {
      return login;
    }


    factory.destroyLogin = function() {
      login = undefined;
    }



    return factory;

  });
