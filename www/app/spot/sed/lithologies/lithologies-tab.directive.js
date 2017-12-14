(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedLithologiesTabDirective', straboSedLithologiesTabDirective);

  function straboSedLithologiesTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/lithologies/lithologies-tab.directive.html'
    };
  }
}());