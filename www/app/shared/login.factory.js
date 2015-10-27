(function () {
  'use strict';

  angular.module('app')
    .factory('LoginFactory', LoginFactory);

  LoginFactory.$inject = ['LocalStorage'];

  function LoginFactory(LocalStorage) {
    var factory = {};

    factory.setLogin = function (loginInfo) {
      return LocalStorage.configDb.setItem('login', loginInfo);
    };

    factory.getLogin = function () {
      return LocalStorage.configDb.getItem('login');
    };

    factory.destroyLogin = function () {
      return LocalStorage.configDb.removeItem('login');
    };

    return factory;
  }
}());
