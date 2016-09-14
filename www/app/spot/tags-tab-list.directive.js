(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTagsTabListDirective', straboTagsTabListDirective);

  function straboTagsTabListDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/tags-tab-list.directive.html'
    };
  }
}());
