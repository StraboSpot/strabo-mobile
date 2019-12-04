(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedIntervalTabDirective', straboSedIntervalTabDirective);

  function straboSedIntervalTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/interval/interval-tab.directive.html'
    };
  }
}());
