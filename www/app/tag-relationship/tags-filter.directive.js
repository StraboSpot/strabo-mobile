(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTagsFilterDirective', straboTagsFilterDirective);

  function straboTagsFilterDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag-relationship/tags-filter.directive.html'
    };
  }
}());
