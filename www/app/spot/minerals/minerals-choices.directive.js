(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboMineralsChoicesDirective', straboMineralsChoicesDirective);

  function straboMineralsChoicesDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/minerals/minerals-choices.directive.html'
    };
  }
}());