(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboDocumentationTagDirective', straboDocumentationTagDirective);

  function straboDocumentationTagDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag-relationship/documentation.directive.html'
    };
  }
}());
