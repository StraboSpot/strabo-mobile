(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboStratSectionsDirective', straboStratSectionsDirective);

  function straboStratSectionsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/maps/strat-sections/strat-sections.directive.html'
    };
  }
}());