(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboNestingTabDirective', straboNestingTabDirective);

  function straboNestingTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/nesting/nesting-tab.directive.html'
    };
  }
}());