(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboConceptTagDirective', straboConceptTagDirective);

  function straboConceptTagDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag-relationship/concept.directive.html'
    };
  }
}());
