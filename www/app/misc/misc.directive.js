(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboMiscDirective', straboMiscDirective);

  function straboMiscDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/misc/misc.directive.html'
    };
  }
}());