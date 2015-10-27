(function () {
  'use strict';

  angular
    .module('app')
    .factory('ViewExtentFactory', ViewExtentFactory);

  function ViewExtentFactory() {
    var viewExtent;

    var factory = {};

    factory.setExtent = function (mapProvider, topRight, bottomLeft, zoom) {
      viewExtent = {
        'mapProvider': mapProvider,
        'topRight': topRight,
        'bottomLeft': bottomLeft,
        'zoom': zoom
      };
    };

    factory.getExtent = function () {
      return viewExtent;
    };

    factory.clearExtent = function () {
      viewExtent = null;
    };

    // return factory
    return factory;
  }
}());
