(function () {
  'use strict';

  angular
    .module('app')
    .directive('strabo3DStructuresTabDirective', strabo3DStructuresTabDirective);

  function strabo3DStructuresTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/3d-structures/3dstructures-tab.directive.html'
    };
  }
}());