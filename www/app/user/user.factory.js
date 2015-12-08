(function () {
  'use strict';

  angular
    .module('app')
    .factory('UserFactory', UserFactory);

  UserFactory.$inject = ['$ionicPopup', '$log', '$q', 'LocalStorageFactory', 'RemoteServerFactory'];

  function UserFactory($ionicPopup, $log, $q, LocalStorageFactory, RemoteServerFactory) {
    var currentUser = null;
    var currentUserData = null;
    var users = {};

    return {
      'clearCurrentUser': clearCurrentUser,
      'doLogin': doLogin,
      'getCurrentUser': getCurrentUser,
      'getCurrentUserData': getCurrentUserData,
      'getUserName': getUserName,
      'loadUsers': loadUsers,             // Run from app config
      'saveCurrentUser': saveCurrentUser,
      'saveUser': saveUser

    };

    /**
     * Private Functions
     */

    // Load all user data from local storage
    function allUsers() {
      var deferred = $q.defer(); // init promise
      var config = {};

      LocalStorageFactory.usersDb.iterate(function (value, key) {
        config[key] = value;
      }, function () {
        deferred.resolve(config);
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function clearCurrentUser() {
      currentUser = null;
      currentUserData = null;
      LocalStorageFactory.usersDb.removeItem('currentUser').then(function () {
        $log.log('Cleared current user data from local storage');
      });
    }

    // Authenticate user login
    function doLogin(login) {
      var deferred = $q.defer(); // init promise
      RemoteServerFactory.authenticateUser(login).then(function (response) {
        if (response.status === 200 && response.data.valid === 'true') {
          $log.log('Logged in successfully.');
          saveCurrentUser(login.email);
          currentUser = login.email;
          currentUserData = users[currentUser];
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

    function getCurrentUser() {
      return currentUser;
    }

    function getCurrentUserData() {
      return users[currentUser] || null;
    }

    function getUserName() {
      if (currentUserData) return currentUserData.user_name || currentUserData.email;
      return null;
    }

    function loadUsers() {
      if (_.isEmpty(users)) {
        $log.log('Loading users ....');
        return allUsers().then(function (savedData) {
          users = savedData;
          $log.log('Finished loading users: ', users);
          if (users.currentUser) {
            currentUser = users.currentUser;
            currentUserData = users[currentUser];
            if (currentUserData) {
              $log.log('Loaded current user data: ', currentUserData);
            }
            else {
              $log.log('No current user data.');
            }
          }
        });
      }
    }

    function saveCurrentUser(userEmail) {
      LocalStorageFactory.usersDb.setItem('currentUser', userEmail);
    }

    // Save all user data in local storage
    function saveUser(userData) {
      currentUserData = userData;
      users[userData.email] = userData;
      LocalStorageFactory.usersDb.setItem(userData.email, userData).then(function (savedData) {
        $log.log('Saved user: ', savedData);
      });
    }
  }
}());
