(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSpotsListDirective', straboSpotsListDirective);

  function straboSpotsListDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spots/spots-list.directive.html'
    };
  }
}());