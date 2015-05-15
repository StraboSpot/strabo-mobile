'use strict';

angular.module('app')
  .factory('SettingsFactory', function() {

    var factory = {};

    factory.setNamePrefix = function(name_prefix) {
      return configDb.setItem('name_prefix', name_prefix);
    };

    factory.setNameRoot = function(name_root) {
      return configDb.setItem('name_root', name_root);
    };

    factory.setNameSuffix = function(name_suffix) {
      return configDb.setItem('name_suffix', name_suffix);
    };

    factory.setPrefixIncrement = function(increment) {
      return configDb.setItem('prefix_increment', increment);
    };

    factory.setSuffixIncrement = function(increment) {
      return configDb.setItem('suffix_increment', increment);
    };

    factory.getNamePrefix = function() {
      return configDb.getItem('name_prefix');
    };

    factory.getNameRoot = function() {
      return configDb.getItem('name_root');
    };

    factory.getNameSuffix = function() {
      return configDb.getItem('name_suffix');
    };

    factory.getPrefixIncrement = function() {
      return configDb.getItem('prefix_increment');
    };

    factory.getSuffixIncrement = function() {
      return configDb.getItem('suffix_increment');
    };

    return factory;
  });
