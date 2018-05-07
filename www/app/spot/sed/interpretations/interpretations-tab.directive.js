(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedInterpretationsTabDirective', straboSedInterpretationsTabDirective);

  function straboSedInterpretationsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/interpretations/interpretations-tab.directive.html'
    };
  }
}());