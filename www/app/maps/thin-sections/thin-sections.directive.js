(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboThinSectionsDirective', straboThinSectionsDirective);

  function straboThinSectionsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/maps/thin-sections/thin-sections.directive.html'
    };
  }
}());