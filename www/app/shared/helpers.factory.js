(function () {
  'use strict';

  angular
    .module('app')
    .factory('HelpersFactory', HelpersFactory);

  function HelpersFactory() {
    return {
      'newId': newId,
      'toRadians': toRadians
    };

    function newId() {
      return Math.floor((new Date().getTime() + Math.random()) * 10);
    }

    function toRadians(deg) {
      return deg * (Math.PI / 180);
    }
  }
}());
