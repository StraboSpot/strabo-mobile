(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboExperimentalResultsTabDirective', straboExperimentalResultsTabDirective);

  function straboExperimentalResultsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/micro/experimental-results/experimental-results-tab.directive.html'
    };
  }
}());