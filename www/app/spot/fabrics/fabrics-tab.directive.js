(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboFabricsTabDirective', straboFabricsTabDirective);

  function straboFabricsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/fabrics/fabrics-tab.directive.html'
    };
  }
}());
