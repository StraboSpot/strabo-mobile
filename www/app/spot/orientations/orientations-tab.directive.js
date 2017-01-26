(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboOrientationsTabDirective', straboOrientationsTabDirective);

  function straboOrientationsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/orientations/orientations-tab.directive.html'
    };
  }
}());