(function () {
  'use strict';

  angular
    .module('app')
    .factory('HelpersFactory', HelpersFactory);

  HelpersFactory.$inject = ['$cordovaDevice', '$cordovaFile', '$ionicPopup', '$log'];

  function HelpersFactory($cordovaDevice, $cordovaFile, $ionicPopup, $log) {
    var backView = 'app/spots';
    var ids = [];

    return {
      'b64toBlob': b64toBlob,
      'cleanObj': cleanObj,
      'convertToLargerUnit': convertToLargerUnit,
      'convertToSmallerUnit': convertToSmallerUnit,
      'getBackView': getBackView,
      'getNewId': getNewId,
      'hexToRgb': hexToRgb,
      'mod': mod,
      'roundToDecimalPlaces': roundToDecimalPlaces,
      'setBackView': setBackView,
      'toDegrees': toDegrees,
      'toRadians': toRadians
    };

    /**
     * Public Functions
     */

    // Convert a base64 string to a Blob according to the data and contentType.
    function b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      return new Blob(byteArrays, {type: contentType});
    }

    function getBackView() {
      return backView;
    }

    // Remove nulls, undefined, empty strings and empty objects
    function cleanObj(obj) {
      _.each(obj, function (ele, i) {
        if (_.isObject(ele) && _.isEmpty(ele)) delete obj[i];
        else if (_.isObject(ele) && !_.isEmpty(ele)) obj[i] = cleanObj(ele);
        else if (_.isString(ele) && ele.trim() === '') delete obj[i];
        else if (_.isUndefined(ele)) delete obj[i];
        else if (_.isNull(ele)) delete obj[i];
      });
      return obj;
    }

    function convertToLargerUnit(width, unit) {
      if (unit === 'm') return {'value': width / 1000, 'unit': 'km'};
      if (unit === 'cm') return {'value': width / 100, 'unit': 'm'};
      if (unit === 'mm') return {'value': width / 10, 'unit': 'cm'};
      if (unit === '_m') return {'value': width / 1000, 'unit': 'mm'};
      return {'value': width, 'unit': unit};
    }

    function convertToSmallerUnit(width, unit) {
      if (unit === 'km') return {'value': width * 1000, 'unit': 'm'};
      if (unit === 'm') return {'value': width * 100, 'unit': 'cm'};
      if (unit === 'cm') return {'value': width * 10, 'unit': 'mm'};
      if (unit === 'mm') return {'value': width * 1000, 'unit': '_m'};
      if (unit === '_m') return {'value': width * 1000, 'unit': 'nm'};
      return {'value': width, 'unit': unit};
    }

    function hexToRgb(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
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
