(function () {
  'use strict';

  angular
    .module('app')
    .factory('HelpersFactory', HelpersFactory);

  function HelpersFactory() {
    var backView = 'app/spots';

    return {
      'getBackView': getBackView,
      'newId': newId,
      'setBackView': setBackView,
      'toRadians': toRadians
    };

    function getBackView() {
      return backView;
    }

    function newId() {
      return Math.floor((new Date().getTime() + Math.random()) * 10);
    }

    function setBackView(url) {
      backView = url;
    }

    function toRadians(deg) {
      return deg * (Math.PI / 180);
    }
  }
}());
