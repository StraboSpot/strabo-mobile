(function () {
  'use strict';

  angular
    .module('app')
    .factory('SettingsFactory', SettingsFactory);

  SettingsFactory.$inject = ['LocalStorage'];

  function SettingsFactory(LocalStorage) {
    var factory = {};

    factory.setNamePrefix = function (name_prefix) {
      return LocalStorage.configDb.setItem('name_prefix', name_prefix);
    };

    factory.setNameRoot = function (name_root) {
      return LocalStorage.configDb.setItem('name_root', name_root);
    };

    factory.setNameSuffix = function (name_suffix) {
      return LocalStorage.configDb.setItem('name_suffix', name_suffix);
    };

    factory.setPrefixIncrement = function (increment) {
      return LocalStorage.configDb.setItem('prefix_increment', increment);
    };

    factory.setSuffixIncrement = function (increment) {
      return LocalStorage.configDb.setItem('suffix_increment', increment);
    };

    factory.getNamePrefix = function () {
      return LocalStorage.configDb.getItem('name_prefix');
    };

    factory.getNameRoot = function () {
      return LocalStorage.configDb.getItem('name_root');
    };

    factory.getNameSuffix = function () {
      return LocalStorage.configDb.getItem('name_suffix');
    };

    factory.getPrefixIncrement = function () {
      return LocalStorage.configDb.getItem('prefix_increment');
    };

    factory.getSuffixIncrement = function () {
      return LocalStorage.configDb.getItem('suffix_increment');
    };

    return factory;
  }
}());
