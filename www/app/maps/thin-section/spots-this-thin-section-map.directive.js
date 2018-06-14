(function () {
  'use strict';

  angular
    .module('app')
    .directive('spotsThisThinSectionMapDirective', spotsThisThinSectionMapDirective);

  function spotsThisThinSectionMapDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/maps/thin-section/spots-this-thin-section-map.html'
    };
  }
}());