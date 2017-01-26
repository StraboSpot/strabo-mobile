(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTagsDirective', straboTagsDirective);

  function straboTagsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tags/tags.directive.html'
    };
  }
}());