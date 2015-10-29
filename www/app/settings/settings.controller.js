(function () {
  'use strict';

  angular
    .module('app')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$ionicPopup', '$log', 'SettingsFactory', 'LoginFactory', 'SyncService'];

  function SettingsController($ionicPopup, $log, SettingsFactory, LoginFactory, SyncService) {
    var vm = this;

    // Form data for the login modal
    vm.loginData = {};

    vm.hideActionButtons = {
      'login': false,
      'logout': true
    };

    var hideLoginButton = function () {
      vm.hideActionButtons.login = true;
      vm.hideActionButtons.logout = false;
    };

    var hideLogoutButton = function () {
      vm.hideActionButtons.login = false;
      vm.hideActionButtons.logout = true;
    };

    // is the user logged in from before?
    LoginFactory.getLogin().then(
      function (login) {
        if (login !== null) {
          // we do have a login -- lets set the authentication
          $log.log('we have a login!', login);

          // set the email to the login email
          vm.loginData.email = login.email;
          hideLoginButton();
        }
        else {
          // nope, dont have a login
          $log.log('no login!');
          hideLogoutButton();
        }
      });

    // Perform the login action when the user presses the login icon
    vm.doLogin = function () {
      vm.loginData.email = vm.loginData.email.toLowerCase();
      // Authenticate user login
      if (navigator.onLine) {
        SyncService.authenticateUser(vm.loginData).then(
          function (response) {
            if (response.status === 200 && response.data.valid === 'true') {
              $log.log('Logged in successfully.');
              hideLoginButton();
              LoginFactory.setLogin(vm.loginData);
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
    vm.doLogout = function () {
      $log.log('Logged out');
      // we do have a login so we should destroy the login because the user wants to logout
      LoginFactory.destroyLogin();
      vm.loginData = {
        'email': null,
        'password': null
      };
      hideLogoutButton();
    };

    SettingsFactory.getNamePrefix().then(
      function (prefix) {
        if (!prefix || prefix === 'null') {
          vm.prefix_type = 'None';
        }
        else {
          if (isNaN(prefix)) {
            vm.prefix_type = 'Text';
            vm.text_prefix = prefix;
          }
          else {
            vm.prefix_type = 'Counter';
            vm.counter_prefix = prefix;
            SettingsFactory.getPrefixIncrement().then(
              function (prefix_increment) {
                vm.prefix_increment = prefix_increment;
              }
            );
          }
        }
      }
    );

    SettingsFactory.getNameRoot().then(function (root) {
      vm.text_root = root;
    });

    SettingsFactory.getNameSuffix().then(function (suffix) {
      if (!suffix || suffix === 'null') {
        vm.suffix_type = 'None';
      }
      else {
        if (isNaN(suffix)) {
          vm.suffix_type = 'Text';
          vm.text_suffix = suffix;
        }
        else {
          vm.suffix_type = 'Counter';
          vm.counter_suffix = suffix;
          SettingsFactory.getSuffixIncrement().then(function (suffix_increment) {
            vm.suffix_increment = suffix_increment;
          });
        }
      }
    });

    vm.typeChange = function (part) {
      switch (part) {
        case 'prefix':
          switch (vm.prefix_type) {
            case 'None':
              vm.text_prefix = null;
              vm.counter_prefix = null;
              vm.prefix_increment = null;
              break;
            case 'Text':
              vm.counter_prefix = null;
              vm.prefix_increment = null;
              break;
            case 'Counter':
              vm.text_prefix = null;
              vm.counter_prefix = 1;
              vm.prefix_increment = 1;
              break;
          }
          break;
        case 'suffix':
          switch (vm.suffix_type) {
            case 'None':
              vm.text_suffix = null;
              vm.counter_suffix = null;
              vm.suffix_increment = null;
              break;
            case 'Text':
              vm.counter_suffix = null;
              vm.suffix_increment = null;
              break;
            case 'Counter':
              vm.text_suffix = null;
              vm.counter_suffix = 1;
              vm.suffix_increment = 1;
              break;
          }
          break;
      }
    };

    vm.save = function () {
      var prefix = '';
      if (vm.text_prefix) {
        prefix = vm.text_prefix;
      }
      else if (vm.counter_prefix) {
        prefix = vm.counter_prefix;
      }

      var suffix = '';
      if (vm.text_suffix) {
        suffix = vm.text_suffix;
      }
      else if (vm.counter_suffix) {
        suffix = vm.counter_suffix;
      }

      SettingsFactory.setNamePrefix(prefix).then(function () {
        SettingsFactory.setNameRoot(vm.text_root).then(function () {
          SettingsFactory.setNameSuffix(suffix).then(function () {
            SettingsFactory.setPrefixIncrement(vm.prefix_increment).then(function () {
              SettingsFactory.setSuffixIncrement(vm.suffix_increment).then(function () {
                $ionicPopup.alert({
                  'title': 'Settings!',
                  'template': 'Saved Settings.<br>Prefix: ' + prefix + '<br>Root: ' + vm.text_root + '<br>Suffix: ' + suffix
                });
              });
            });
          });
        });
      });
    };
  }
}());
