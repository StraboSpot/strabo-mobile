(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotsFactory', SpotsFactory);

  SpotsFactory.$inject = [];

  function SpotsFactory() {
    var spotsListDetail = {'tabs': true, 'tags': true};  // Only Spots in the active datasets

    return {
      'getSpotsListDetail': getSpotsListDetail,
      'setSpotsListDetail': setSpotsListDetail
    };

    /**
     * Public Functions
     */

    function getSpotsListDetail() {
      return spotsListDetail || {};
    }

    function setSpotsListDetail(inSpotsListDetail) {
      spotsListDetail = inSpotsListDetail;
    }
  }
}());
