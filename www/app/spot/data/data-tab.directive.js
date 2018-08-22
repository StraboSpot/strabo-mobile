(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboDataTabDirective', straboDataTabDirective);

  function straboDataTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/data/data-tab.directive.html'
    };
  }
}());
