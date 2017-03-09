(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSamplesDirective', straboSamplesDirective);

  function straboSamplesDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/attributes/samples/samples.directive.html'
    };
  }
}());