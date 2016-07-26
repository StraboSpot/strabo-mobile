(function () {
  'use strict';

  angular
    .module('app')
    .factory('OtherMapsFactory', OtherMapsFactory);

  OtherMapsFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function OtherMapsFactory($log, $q, LocalStorageFactory) {
    var otherMaps = [];

    return {
      'getOtherMaps': getOtherMaps,
      'loadOtherMaps': loadOtherMaps,
      'setOtherMaps': setOtherMaps
    };

    /**
     *  Public Functions
     */

    function getOtherMaps() {
      return otherMaps;
    }

    function loadOtherMaps() {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().configDb.getItem('other_maps').then(function (gotOtherMaps) {
        $log.log('Loaded other maps: ', gotOtherMaps);
        otherMaps = gotOtherMaps;
        deferred.resolve();
      });
      return deferred.promise;
    }

    function setOtherMaps(inOtherMaps) {
      otherMaps = inOtherMaps;
      LocalStorageFactory.getDb().configDb.setItem('other_maps', inOtherMaps).then(function () {
        $log.log('Saved otherMaps: ', inOtherMaps);
      });
    }
  }
}());
