(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTagsFilterWithMineralsDirective', straboTagsFilterWithMineralsDirective);

  function straboTagsFilterWithMineralsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tags/tags-filter-with-minerals.directive.html'
    };
  }
}());