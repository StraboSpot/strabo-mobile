(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboExperimentalSetUpTabDirective', straboExperimentalSetUpTabDirective);

  function straboExperimentalSetUpTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/micro/experimental-set-up/experimental-set-up-tab.directive.html'
    };
  }
}());