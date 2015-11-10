(function () {
  'use strict';

  angular.module('app')
    .factory('LoginFactory', LoginFactory);

  LoginFactory.$inject = ['LocalStorage'];

  function LoginFactory(LocalStorage) {
    return {
      'destroyLogin': destroyLogin,
      'getLogin': getLogin,
      'setLogin': setLogin
    };

    function destroyLogin() {
      return LocalStorage.configDb.removeItem('login');
    }

    function getLogin() {
      return LocalStorage.configDb.getItem('login');
    }

    function setLogin(loginInfo) {
      return LocalStorage.configDb.setItem('login', loginInfo);
    }
  }
}());
