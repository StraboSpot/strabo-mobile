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
      'getBackView': getBackView,
      'getNewId': getNewId,
      'mod': mod,
      'roundToDecimalPlaces': roundToDecimalPlaces,
      'saveFileToDevice': saveFileToDevice,
      'setBackView': setBackView,
      'toDegrees': toDegrees,
      'toRadians': toRadians
    };

    /**
     * Private Functions
     */

    function getDevicePath() {
      switch ($cordovaDevice.getPlatform()) {
        case 'Android':
          return cordova.file.externalRootDirectory;    // 'file:///storage/emulated/0/'
          break;
        case 'iOS':
          return cordova.file.documentsDirectory;
          break;
        default:
          // TODO: what about windows and blackberry?
          return cordova.file.externalRootDirectory;
          break;
      }
    }

    function writeFile(folderpath, filename, content) {
      $cordovaFile.writeFile(folderpath, filename, content, true).then(
        function (success) {
          $log.log('File successfully written!', success);
          $ionicPopup.alert({
            'title': 'Success!',
            'template': 'Image saved to ' + folderpath + filename
          });
        },
        function (err) {
          $log.error('Error writing file!', err);
          $ionicPopup.alert({
            'title': 'Error!',
            'template': 'Unable to save image to ' + folderpath
          });
        });
    }

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

    function saveFileToDevice(filename, content) {
      var devicePath = getDevicePath();
      var directory = 'strabo';
      $cordovaFile.checkDir(devicePath, directory).then(function (success) {
          $log.log('Directory', directory, 'exists.', success);
          writeFile(devicePath + success.fullPath, filename, content);
        }, function () {
          $cordovaFile.createDir(devicePath, directory, false).then(function (success) {
              $log.log('Directory', directory, 'created.', success);
              writeFile(devicePath + success.fullPath, filename, content);
            }, function (error) {
              $log.error('Unable to create directory', directory, error);
            }
          );
        }
      );
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
