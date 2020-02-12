(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedBeddingTabDirective', straboSedBeddingTabDirective);

  function straboSedBeddingTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/bedding/bedding-tab.directive.html'
    };
  }
}());
