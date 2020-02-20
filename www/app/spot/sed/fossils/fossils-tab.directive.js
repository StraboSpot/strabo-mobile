(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedFossilsTabDirective', straboSedFossilsTabDirective);

  function straboSedFossilsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/fossils/fossils-tab.directive.html'
    };
  }
}());
