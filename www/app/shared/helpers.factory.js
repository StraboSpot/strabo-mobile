(function () {
  'use strict';

  angular
    .module('app')
    .factory('HelpersFactory', HelpersFactory);

  function HelpersFactory() {
    return {
      'toRadians': toRadians
    };

    function toRadians(deg) {
      return deg * (Math.PI / 180);
    }
  }
}());
