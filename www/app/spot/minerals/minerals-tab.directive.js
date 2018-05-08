(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboMineralsTabDirective', straboMineralsTabDirective);

  function straboMineralsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/minerals/minerals-tab.directive.html'
    };
  }
}());