(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboPetMineralsTabDirective', straboPetMineralsTabDirective);

  function straboPetMineralsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/petrology/minerals/minerals-tab.directive.html'
    };
  }
}());