(function () {
  'use strict';

  angular
    .module('app')
    .factory('UserFactory', UserFactory);

  UserFactory.$inject = ['LocalStorageFactory'];

  function UserFactory(LocalStorageFactory) {
    return {
      'getUserName': getUserName,
      'setUserName': setUserName
    };

    function getUserName() {
      return LocalStorageFactory.configDb.getItem('user_name');
    }

    function setUserName(userName) {
      return LocalStorageFactory.configDb.setItem('user_name', userName);
    }
  }
}());
