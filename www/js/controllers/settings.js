angular
  .module('app')
  .controller('SettingsController', function ($scope,
                                        $ionicPopup,
                                        $log,
                                        SettingsFactory,
                                        LoginFactory,
                                        SyncService) {
    // Form data for the login modal
    $scope.loginData = {};

    $scope.hideActionButtons = {
      'login': false,
      'logout': true
    };

    var hideLoginButton = function () {
      $scope.hideActionButtons.login = true;
      $scope.hideActionButtons.logout = false;
    };

    var hideLogoutButton = function () {
      $scope.hideActionButtons.login = false;
      $scope.hideActionButtons.logout = true;
    };

    // is the user logged in from before?
    LoginFactory.getLogin().then(
      function (login) {
        if (login !== null) {
          // we do have a login -- lets set the authentication
          $log.log('we have a login!', login);

          // set the email to the login email
          $scope.loginData.email = login.email;

          $scope.$apply(function () {
            hideLoginButton();
          });
        }
        else {
          // nope, dont have a login
          $log.log('no login!');

          $scope.$apply(function () {
            hideLogoutButton();
          });
        }
      });

    // Perform the login action when the user presses the login icon
    $scope.doLogin = function () {
      $scope.loginData.email = $scope.loginData.email.toLowerCase();
      // Authenticate user login
      if (navigator.onLine) {
        SyncService.authenticateUser($scope.loginData).then(
          function (response) {
            if (response.status === 200 && response.data.valid === 'true') {
              $log.log('Logged in successfully.');
              hideLoginButton();
              LoginFactory.setLogin($scope.loginData);
            }
            else {
              $ionicPopup.alert({
                'title': 'Login Failure!',
                'template': 'Incorrect username or password.'
              });
            }
          },
          function (errorMessage) {
            $ionicPopup.alert({
              'title': 'Alert!',
              'template': errorMessage
            });
          }
        );
      }
      else {
        $ionicPopup.alert({
          'title': 'Offline!',
          'template': 'Can\'t login while offline.'
        });
      }
    };

    // Perform the logout action when the user presses the logout icon
    $scope.doLogout = function () {
      $log.log('Logged out');
      // we do have a login so we should destroy the login because the user wants to logout
      LoginFactory.destroyLogin();
      $scope.loginData = {
        'email': null,
        'password': null
      };
      hideLogoutButton();
    };

    SettingsFactory.getNamePrefix().then(
      function (prefix) {
        if (!prefix || prefix === 'null') {
          $scope.prefix_type = 'None';
        }
        else {
          if (isNaN(prefix)) {
            $scope.prefix_type = 'Text';
            $scope.text_prefix = prefix;
          }
          else {
            $scope.prefix_type = 'Counter';
            $scope.counter_prefix = prefix;
            SettingsFactory.getPrefixIncrement().then(
              function (prefix_increment) {
                $scope.prefix_increment = prefix_increment;
              }
            );
          }
        }
      }
    );

    SettingsFactory.getNameRoot().then(function (root) {
      $scope.text_root = root;
    });

    SettingsFactory.getNameSuffix().then(function (suffix) {
      if (!suffix || suffix === 'null') {
        $scope.suffix_type = 'None';
      }
      else {
        if (isNaN(suffix)) {
          $scope.suffix_type = 'Text';
          $scope.text_suffix = suffix;
        }
        else {
          $scope.suffix_type = 'Counter';
          $scope.counter_suffix = suffix;
          SettingsFactory.getSuffixIncrement().then(function (suffix_increment) {
            $scope.suffix_increment = suffix_increment;
          });
        }
      }
    });

    $scope.typeChange = function (part) {
      switch (part) {
        case 'prefix':
          switch ($scope.prefix_type) {
            case 'None':
              $scope.text_prefix = null;
              $scope.counter_prefix = null;
              $scope.prefix_increment = null;
              break;
            case 'Text':
              $scope.counter_prefix = null;
              $scope.prefix_increment = null;
              break;
            case 'Counter':
              $scope.text_prefix = null;
              $scope.counter_prefix = 1;
              $scope.prefix_increment = 1;
              break;
          }
          break;
        case 'suffix':
          switch ($scope.suffix_type) {
            case 'None':
              $scope.text_suffix = null;
              $scope.counter_suffix = null;
              $scope.suffix_increment = null;
              break;
            case 'Text':
              $scope.counter_suffix = null;
              $scope.suffix_increment = null;
              break;
            case 'Counter':
              $scope.text_suffix = null;
              $scope.counter_suffix = 1;
              $scope.suffix_increment = 1;
              break;
          }
          break;
      }
    };

    $scope.save = function () {
      var prefix = '';
      if ($scope.text_prefix) {
        prefix = $scope.text_prefix;
      }
      else if ($scope.counter_prefix) {
        prefix = $scope.counter_prefix;
      }

      var suffix = '';
      if ($scope.text_suffix) {
        suffix = $scope.text_suffix;
      }
      else if ($scope.counter_suffix) {
        suffix = $scope.counter_suffix;
      }

      SettingsFactory.setNamePrefix(prefix).then(function () {
        SettingsFactory.setNameRoot($scope.text_root).then(function () {
          SettingsFactory.setNameSuffix(suffix).then(function () {
            SettingsFactory.setPrefixIncrement($scope.prefix_increment).then(function () {
              SettingsFactory.setSuffixIncrement($scope.suffix_increment).then(function () {
                $ionicPopup.alert({
                  'title': 'Settings!',
                  'template': 'Saved Settings.<br>Prefix: ' + prefix + '<br>Root: ' + $scope.text_root + '<br>Suffix: ' + suffix
                });
              });
            });
          });
        });
      });
    };
  });

