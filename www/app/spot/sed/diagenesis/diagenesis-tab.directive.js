(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedDiagenesisTabDirective', straboSedDiagenesisTabDirective);

  function straboSedDiagenesisTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/diagenesis/diagenesis-tab.directive.html'
    };
  }
}());
