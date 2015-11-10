(function () {
  'use strict';

  angular.module('app')
    .factory('LoginFactory', LoginFactory);

  LoginFactory.$inject = ['LocalStorageFactory'];

  function LoginFactory(LocalStorageFactory) {
    return {
      'destroyLogin': destroyLogin,
      'getLogin': getLogin,
      'setLogin': setLogin
    };

    function destroyLogin() {
      return LocalStorageFactory.configDb.removeItem('login');
    }

    function getLogin() {
      return LocalStorageFactory.configDb.getItem('login');
    }

    function setLogin(loginInfo) {
      return LocalStorageFactory.configDb.setItem('login', loginInfo);
    }
  }
}());
