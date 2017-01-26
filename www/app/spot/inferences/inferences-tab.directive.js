(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboInferencesTabDirective', straboInferencesTabDirective);

  function straboInferencesTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/inferences/inferences-tab.directive.html'
    };
  }
}());