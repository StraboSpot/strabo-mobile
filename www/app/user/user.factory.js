(function () {
  'use strict';

  angular
    .module('app')
    .factory('UserFactory', UserFactory);

  UserFactory.$inject = ['$ionicPopup', '$log', '$q', 'LocalStorageFactory', 'RemoteServerFactory'];

  function UserFactory($ionicPopup, $log, $q, LocalStorageFactory, RemoteServerFactory) {
    var user = null;

    return {
      'clearUser': clearUser,
      'doLogin': doLogin,
      'getUser': getUser,
      'getUserName': getUserName,
      'loadUser': loadUser,             // Run from app config
      'saveUser': saveUser

    };

    /**
     * Private Functions
     */

    /**
     * Public Functions
     */

    function clearUser() {
      user = null;
      LocalStorageFactory.getDb().config2Db.removeItem('user').then(function () {
        $log.log('Cleared user data from local storage');
      });
    }

    // Authenticate user login
    function doLogin(login) {
      var deferred = $q.defer(); // init promise
      login.email = login.email.toLowerCase();
      RemoteServerFactory.authenticateUser(login).then(function (response) {
        if (response.status === 200 && response.data.valid === 'true') {
          $log.log('Logged in successfully as ' + login.email);
          user = {
            'email': login.email,
            'encoded_login': Base64.encode(login.email + ':' + login.password)
          };
          saveUser(user);
        }
        else {
          $ionicPopup.alert({
            'title': 'Login Failure!',
            'template': 'Incorrect username or password.'
          });
        }
        deferred.resolve();
      });
      return deferred.promise;
    }

    function getUserName() {
      if (user) return user.name || user.email;
      return null;
    }

    function getUser() {
      return user;
    }

    function loadUser() {
      var deferred = $q.defer(); // init promise
      if (!user) {
        $log.log('Loading user ....');
        LocalStorageFactory.getDb().config2Db.getItem('user').then(function (savedUser) {
          if (savedUser) {
            user = savedUser;
            $log.log('Loaded saved user: ', savedUser);
          }
          else {
            $log.log('No saved user.');
          }
          deferred.resolve();
        });
      }
      else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    // Save all user data in local storage
    function saveUser(userData) {
      user = userData;
      LocalStorageFactory.getDb().config2Db.setItem('user', userData).then(function (savedData) {
        $log.log('Saved user: ', savedData);
      });
    }
  }
}());
