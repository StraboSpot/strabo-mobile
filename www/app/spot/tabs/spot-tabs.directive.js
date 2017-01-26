(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSpotTabsDirective', straboSpotTabsDirective);

  function straboSpotTabsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/tabs/spot-tabs.directive.html'
    };
  }
}());