(function () {
  'use strict';

  angular
    .module('app')
    .factory('UserFactory', UserFactory);

  UserFactory.$inject = ['$log', 'LocalStorageFactory'];

  function UserFactory($log, LocalStorageFactory) {
    var loggedIn = false;
    var userName;

    activate();

    return {
      'destroyLogin': destroyLogin,
      'getLogin': getLogin,
      'getUserName': getUserName,
      'getUserNameVar': getUserNameVar,
      'isLoggedIn': isLoggedIn,
      'setLogin': setLogin,
      'setUserName': setUserName
    };

    /**
     * Private Functions
     */

    function activate() {
      checkForLogin();
    }

    function checkForLogin() {
      getLogin().then(function (login) {
        loggedIn = login !== null;
        $log.log('Is logged in? ', loggedIn, login);
        if (loggedIn) {
          getUserProfile();
        }
      });
    }

    function clearUser() {
      userName = null;
      LocalStorageFactory.configDb.removeItem('user_name');
    }

    function getUserProfile() {
      LocalStorageFactory.configDb.getItem('user_name').then(function (inUserName) {
        userName = inUserName;
      });
    }

    /**
     * Public Functions
     */

    function destroyLogin() {
      loggedIn = false;
      LocalStorageFactory.configDb.removeItem('login');
      clearUser();
    }

    function getLogin() {
      return LocalStorageFactory.configDb.getItem('login');
    }

    function getUserName() {
      return LocalStorageFactory.configDb.getItem('user_name');
    }

    function getUserNameVar() {
      return userName;
    }

    function isLoggedIn() {
      return loggedIn;
    }

    function setLogin(login) {
      loggedIn = true;
      return LocalStorageFactory.configDb.setItem('login', login);
    }

    function setUserName(inUserName) {
      userName = inUserName;
      return LocalStorageFactory.configDb.setItem('user_name', userName);
    }
  }
}());
