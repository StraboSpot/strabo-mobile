(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSpotsListTabsDetailDirective', straboSpotsListTabsDetailDirective);

  function straboSpotsListTabsDetailDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spots/spots-list-tabs-detail.directive.html'
    };
  }
}());