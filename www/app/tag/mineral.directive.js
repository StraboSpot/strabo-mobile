(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboMineralTagDirective', straboMineralTagDirective);

  function straboMineralTagDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag/mineral.directive.html'
    };
  }
}());