(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboExperimentalTabDirective', straboExperimentalTabDirective);

  function straboExperimentalTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/micro/experimental/experimental-tab.directive.html'
    };
  }
}());
