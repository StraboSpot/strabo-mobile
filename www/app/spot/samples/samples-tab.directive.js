(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSamplesTabDirective', straboSamplesTabDirective);

  function straboSamplesTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/samples/samples-tab.directive.html'
    };
  }
}());