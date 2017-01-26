(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSpotsDirective', straboSpotsDirective);

  function straboSpotsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spots/spots.directive.html'
    };
  }
}());