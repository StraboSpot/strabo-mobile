(function () {
  'use strict';

  angular
    .module('app')
    .filter('normalizeBytes', normalizeBytes);

  function normalizeBytes() {
    return function (bytes) {
      var sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var k = 1000;

      if (!angular.isNumber(bytes)) {
        return 'unknown';
      }
      else if (bytes === 0) {
        return '0 byte';
      }
      else {
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
      }
    };
  }
}());
