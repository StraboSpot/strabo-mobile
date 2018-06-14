(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboThinSectionTabDirective', straboThinSectionTabDirective);

  function straboThinSectionTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/micro/thin-section/thin-section-tab.directive.html'
    };
  }
}());