(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboPetrologyTabDirective', straboPetrologyTabDirective);

  function straboPetrologyTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/petrology/petrology-tab.directive.html'
    };
  }
}());