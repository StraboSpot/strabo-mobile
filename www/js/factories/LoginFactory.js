'use strict';

angular.module('app')
  .factory('LoginFactory', function () {
    var factory = {};

    factory.setLogin = function (loginInfo) {
      return configDb.setItem('login', loginInfo);
    };

    factory.getLogin = function () {
      return configDb.getItem('login');
    };

    factory.destroyLogin = function () {
      return configDb.removeItem('login');
    };

    return factory;
  });
