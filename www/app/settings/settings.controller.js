(function () {
  'use strict';

  angular
    .module('app')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$ionicPopup', 'SettingsFactory'];

  function SettingsController($ionicPopup, SettingsFactory) {
    var vm = this;

    vm.save = save;
    vm.typeChange = typeChange;

    activate();

    /**
     * Private Functions
     */
    function activate() {
      setNamePrefix();
      setNameRoot();
      setNameSuffix();
    }

    function setNamePrefix() {
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
    }

    function setNameRoot() {
      SettingsFactory.getNameRoot().then(function (root) {
        vm.text_root = root;
      });
    }

    function setNameSuffix() {
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
    }

    /**
     * Public Functions
     */

    function save() {
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
    }

    function typeChange(part) {
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
    }
  }
}());
