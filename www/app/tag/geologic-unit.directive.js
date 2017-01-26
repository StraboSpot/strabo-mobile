(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboGeologicUnitTagDirective', straboGeologicUnitDirective);

  function straboGeologicUnitDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag/geologic-unit.directive.html'
    };
  }
}());
