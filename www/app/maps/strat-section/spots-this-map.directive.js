(function () {
  'use strict';

  angular
    .module('app')
    .directive('spotsThisMapDirective', spotsThisMapDirective);

  function spotsThisMapDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/maps/strat-section/spots-this-map.html'
    };
  }
}());