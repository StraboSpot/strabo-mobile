(function () {
  'use strict';

  angular
    .module('app')
    .factory('HelpersFactory', HelpersFactory);

  function HelpersFactory() {
    var backView = 'app/spots';

    return {
      'getBackView': getBackView,
      'mod': mod,
      'newId': newId,
      'roundToDecimalPlaces': roundToDecimalPlaces,
      'setBackView': setBackView,
      'toDegrees': toDegrees,
      'toRadians': toRadians
    };

    function getBackView() {
      return backView;
    }

    // Correct a quirk in JS that doesn't mod negative number correctly
    function mod(a, n) {
      return ((a % n) + n) % n;
    }

    function newId() {
      return Math.floor((new Date().getTime() + Math.random()) * 10);
    }

    // Round value to the number of decimal places in the variable places
    function roundToDecimalPlaces(value, places) {
      var multiplier = Math.pow(10, places);
      return (Math.round(value * multiplier) / multiplier);
    }

    function setBackView(url) {
      backView = url;
    }

    function toDegrees(radians) {
      return radians * 180 / Math.PI;
    }

    function toRadians(deg) {
      return deg * (Math.PI / 180);
    }
  }
}());
