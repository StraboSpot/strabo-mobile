(function () {
  'use strict';

  angular
    .module('app')
    .factory('PreferencesFactory', PreferencesFactory);

  PreferencesFactory.$inject = ['LocalStorageFactory'];

  function PreferencesFactory(LocalStorageFactory) {
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
      return LocalStorageFactory.configDb.getItem('name_prefix');
    }

    function getNameRoot() {
      return LocalStorageFactory.configDb.getItem('name_root');
    }

    function getNameSuffix() {
      return LocalStorageFactory.configDb.getItem('name_suffix');
    }

    function getPrefixIncrement() {
      return LocalStorageFactory.configDb.getItem('prefix_increment');
    }

    function getSuffixIncrement() {
      return LocalStorageFactory.configDb.getItem('suffix_increment');
    }

    function setNamePrefix(name_prefix) {
      return LocalStorageFactory.configDb.setItem('name_prefix', name_prefix);
    }

    function setNameRoot(name_root) {
      return LocalStorageFactory.configDb.setItem('name_root', name_root);
    }

    function setNameSuffix(name_suffix) {
      return LocalStorageFactory.configDb.setItem('name_suffix', name_suffix);
    }

    function setPrefixIncrement(increment) {
      return LocalStorageFactory.configDb.setItem('prefix_increment', increment);
    }

    function setSuffixIncrement(increment) {
      return LocalStorageFactory.configDb.setItem('suffix_increment', increment);
    }
  }
}());
