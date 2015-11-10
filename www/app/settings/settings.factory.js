(function () {
  'use strict';

  angular
    .module('app')
    .factory('SettingsFactory', SettingsFactory);

  SettingsFactory.$inject = ['LocalStorage'];

  function SettingsFactory(LocalStorage) {
    return {
      'getNamePrefix': getNamePrefix,
      'getNameRoot': getNameRoot,
      'getNameSuffix': getNameSuffix,
      'getPrefixIncrement': getPrefixIncrement,
      'getSuffixIncrement': getSuffixIncrement,
      'setNamePrefix': setNamePrefix,
      'setNameRoot': setNameRoot,
      'setNameSuffix': setNameSuffix,
      'setPrefixIncrement': setPrefixIncrement,
      'setSuffixIncrement': setSuffixIncrement
    };

    function getNamePrefix() {
      return LocalStorage.configDb.getItem('name_prefix');
    }

    function getNameRoot() {
      return LocalStorage.configDb.getItem('name_root');
    }

    function getNameSuffix() {
      return LocalStorage.configDb.getItem('name_suffix');
    }

    function getPrefixIncrement() {
      return LocalStorage.configDb.getItem('prefix_increment');
    }

    function getSuffixIncrement() {
      return LocalStorage.configDb.getItem('suffix_increment');
    }

    function setNamePrefix(name_prefix) {
      return LocalStorage.configDb.setItem('name_prefix', name_prefix);
    }

    function setNameRoot(name_root) {
      return LocalStorage.configDb.setItem('name_root', name_root);
    }

    function setNameSuffix(name_suffix) {
      return LocalStorage.configDb.setItem('name_suffix', name_suffix);
    }

    function setPrefixIncrement(increment) {
      return LocalStorage.configDb.setItem('prefix_increment', increment);
    }

    function setSuffixIncrement(increment) {
      return LocalStorage.configDb.setItem('suffix_increment', increment);
    }
  }
}());
