(function () {
  'use strict';

  angular
    .module('app')
    .factory('UserFactory', UserFactory);

  UserFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function UserFactory($log, $q, LocalStorageFactory) {
    var data = {};
    var loggedIn = false;

    return {
      'destroyLogin': destroyLogin,
      'getLogin': getLogin,
      'getUserData': getUserData,
      'getUserName': getUserName,
      'isLoggedIn': isLoggedIn,
      'loadUser': loadUser,             // Run from app config
      'save': save,
      'setLogin': setLogin
    };

    /**
     * Private Functions
     */

    // Load all user data from local storage
    function all() {
      var deferred = $q.defer(); // init promise
      var config = {};

      LocalStorageFactory.userDb.iterate(function (value, key) {
        config[key] = value;
      }, function () {
        deferred.resolve(config);
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function destroyLogin() {
      loggedIn = false;
      data = {};
      LocalStorageFactory.userDb.clear().then(function () {
        $log.log('Cleared user data from local storage');
      });
    }

    function getLogin() {
      return data.login;
    }

    function getUserData() {
      return data;
    }

    function getUserName() {
      if (data.user_name) return data.user_name;
      if (data.login) return data.login.email;
      return null;
    }

    function isLoggedIn() {
      return loggedIn;
    }

    function loadUser() {
      if (_.isEmpty(data)) {
        $log.log('Loading user data ....');
        var dataPromise = all().then(function (savedData) {
          data = savedData;
          if (data && data.login) {
            $log.log('Logged in as: ', data.login);
            loggedIn = angular.isDefined(data.login);
          }
          $log.log('Finished loading user data: ', data);
        });
        return dataPromise;
      }
    }

    // Save all user data in local storage
    function save(newData) {
      LocalStorageFactory.userDb.clear().then(function () {
        data = newData;
        _.forEach(data, function (value, key, list) {
          LocalStorageFactory.userDb.setItem(key, value);
        });
        $log.log('Saved user: ', data);
      });
    }

    function setLogin(login) {
      loggedIn = true;
      data.login = login;
      return LocalStorageFactory.userDb.setItem('login', login);
    }
  }
}());
