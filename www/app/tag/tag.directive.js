(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTagDirective', straboTagDirective);

  function straboTagDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag/tag.directive.html'
    };
  }
}());