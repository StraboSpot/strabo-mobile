(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboMicrographDirective', straboMicrographDirective);

  function straboMicrographDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/maps/thin-section/thin-section.directive.html'
    };
  }
}());