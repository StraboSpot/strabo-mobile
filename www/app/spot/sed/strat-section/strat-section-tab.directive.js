(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboStratSectionTabDirective', straboStratSectionTabDirective);

  function straboStratSectionTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/strat-section/strat-section-tab.directive.html'
    };
  }
}());