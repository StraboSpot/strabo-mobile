(function () {
  'use strict';

  angular
    .module('app')
    .factory('UserFactory', UserFactory);

  UserFactory.$inject = ['$ionicPopup', '$log', '$q', 'LocalStorageFactory', 'OtherMapsFactory',
    'RemoteServerFactory'];

  function UserFactory($ionicPopup, $log, $q, LocalStorageFactory, OtherMapsFactory, RemoteServerFactory) {
    var user;

    return {
      'clearUser': clearUser,
      'doLogin': doLogin,
      'getUser': getUser,
      'getUserName': getUserName,
      'getUserImage': getUserImage,
      'loadUser': loadUser,             // Run from app config
      'saveUser': saveUser,
      'updateUser': updateUser,
      'uploadUserProfile': uploadUserProfile,
      'uploadUserImage': uploadUserImage
    };

    /**
     * Private Functions
     */

    function readDataUrl(file, callback) {
      var reader = new FileReader();
      reader.onloadend = function (evt) {
        callback(evt.target.result);
      };
      reader.readAsDataURL(file);
    }

    /**
     * Public Functions
     */
    function clearUser() {
    user = undefined;
    return LocalStorageFactory.getDb().configDb.removeItem('user');
    }

    // Authenticate user login
    function doLogin(login) {
      login.email = login.email.toLowerCase();
      return RemoteServerFactory.authenticateUser(login).then(function (response) {
        if (response.data.valid === 'true') {
          user = {
            'email': login.email,
            'encoded_login': Base64.encode(login.email + ':' + login.password)
          };
          $log.log('Logged in successfully as', login.email, 'Server Response:', response);
          return updateUser();
        }
        else {
          $ionicPopup.alert({
            'title': 'Login Failure!',
            'template': 'Incorrect username and/or password'
          });
        }
      });
    }

    function getUserName() {
      if (user) return user.name || user.email;
      return null;
    }

    function getUserImage() {
      if (user) return user.image;
      return null;
    }

    function getUser() {
      return user;
    }

    function loadUser() {
      var deferred = $q.defer(); // init promise
      if (!user) {
        $log.log('Loading user ....');
        LocalStorageFactory.getDb().configDb.getItem('user').then(function (savedUser) {
          if (savedUser) {
            user = savedUser;
            $log.log('Loaded saved user: ', savedUser);
          }
          else $log.log('No saved user.');
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
      LocalStorageFactory.getDb().configDb.setItem('user', userData).then(function (savedData) {
        $log.log('Saved user: ', savedData);
      });
    }

    function updateUser() {
      var deferred = $q.defer(); // init promise
      RemoteServerFactory.getProfile(user.encoded_login).then(function (profileResponse) {
        _.extend(user, profileResponse.data);
        RemoteServerFactory.getProfileImage(user.encoded_login).then(function (profileImageResponse) {
          if (profileImageResponse.data) {
            readDataUrl(profileImageResponse.data, function (base64Image) {
              user.image = base64Image;
              saveUser(user);
              deferred.resolve();
            });
          }
          else {
            saveUser(user);
            deferred.resolve();
          }
        }, function () {
          saveUser(user);
          deferred.resolve();
        });
      }, function (profileResponse) {
        var err = profileResponse.data && profileResponse.data.Error ? profileResponse.data.Error : 'Unknown Error';
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function uploadUserProfile() {
      var userToUpload = _.omit(user, ['image', 'email', 'encoded_login']);
      if (!_.isEmpty(userToUpload)) {
        if (navigator.onLine) {
          $log.log('Upload user profile ...');
          RemoteServerFactory.setProfile(userToUpload, user.encoded_login).then(function (response) {
            $log.log('Finshed uploading user profile. Server response:', response);
          }, function (response) {
            $log.error('Error uploading user profile. Server response:', response);
          });
        }
        else {
          $log.log('TODO: Queue User Profile Upload!');
        }
      }
    }

    function uploadUserImage() {
      if (navigator.onLine) {
        $log.log('Upload user profile image ...');
        RemoteServerFactory.setProfileImage(user.image, user.encoded_login).then(function (response) {
          $log.log('Finshed uploading user profile image. Server response:', response);
        }, function (response) {
          $log.error('Error uploading user profile image. Server response:', response);
        });
      }
      else {
        $log.log('TODO: Queue User Profile Image Upload!');
      }
    }
  }
}());
