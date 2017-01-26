(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSpotTabDirective', straboSpotTabDirective);

  function straboSpotTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/spot-home/spot-tab.directive.html'
    };
  }
}());