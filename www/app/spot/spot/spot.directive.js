(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSpotDirective', straboSpotDirective);

  function straboSpotDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/spot/spot.directive.html'
    };
  }
}());