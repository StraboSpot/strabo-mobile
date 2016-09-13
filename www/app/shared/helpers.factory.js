(function () {
  'use strict';

  angular
    .module('app')
    .factory('HelpersFactory', HelpersFactory);

  function HelpersFactory() {
    var backView = 'app/spots';
    var ids = [];

    return {
      'getBackView': getBackView,
      'getNewId': getNewId,
      'mod': mod,
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

    // Return id from the timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)
    // "Integers (numbers without a period or exponent notation) are considered accurate up to 15 digits."
    function getNewId() {
      var newId = Math.floor((new Date().getTime() + Math.random()) * 10);
      if (_.contains(ids, newId)) {
        newId = Math.floor((new Date().getTime() + Math.random()) * 10);
        if (_.contains(ids, newId)) newId = Math.floor((new Date().getTime() + Math.random()) * 10);
      }
      ids.push(newId);
      return newId;
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
