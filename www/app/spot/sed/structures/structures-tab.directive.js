(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedStructuresTabDirective', straboSedStructuresTabDirective);

  function straboSedStructuresTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/structures/structures-tab.directive.html'
    };
  }
}());