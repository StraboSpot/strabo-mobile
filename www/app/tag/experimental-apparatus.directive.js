(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboExperimentalApparatusTagDirective', straboExperimentalApparatusTagDirective);

  function straboExperimentalApparatusTagDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag/experimental-apparatus.directive.html'
    };
  }
}());
