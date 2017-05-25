(function () {
  'use strict';

  angular
    .module('app')
    .factory('OtherMapsFactory', OtherMapsFactory);

  OtherMapsFactory.$inject = ['$log', '$q', 'LiveDBFactory', 'LocalStorageFactory'];

  function OtherMapsFactory($log, $q, LiveDBFactory, LocalStorageFactory) {
    var otherMaps = [];
    var thisProject = [];

    return {
      'addRemoteOtherMaps': addRemoteOtherMaps,
      'destroyOtherMaps': destroyOtherMaps,
      'getOtherMaps': getOtherMaps,
      'loadOtherMaps': loadOtherMaps,
      'setOtherMaps': setOtherMaps
    };

    /**
     *  Public Functions
     */

    function addRemoteOtherMaps(inOtherMaps) {
      if (_.isEmpty(otherMaps)) setOtherMaps(inOtherMaps);
      else {
        _.forEach(inOtherMaps, function (inOtherMap) {
          var match = _.find(otherMaps, function (otherMap) {
            return otherMap.id === inOtherMap.id;
          });
          if (!match) otherMaps.push(inOtherMap);
        });
        setOtherMaps(otherMaps);
      }
    }

    function destroyOtherMaps() {
      otherMaps = [];
      LocalStorageFactory.getDb().configDb.removeItem('other_maps');
    }

    function getOtherMaps() {
      return otherMaps;
    }

    function loadOtherMaps() {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().configDb.getItem('other_maps').then(function (gotOtherMaps) {
        $log.log('Loaded other maps: ', gotOtherMaps);
        otherMaps = gotOtherMaps || [];
        deferred.resolve();
      });
      return deferred.promise;
    }

    function setOtherMaps(inOtherMaps) {
      otherMaps = inOtherMaps;
      if (_.isEmpty(otherMaps)) {
        LocalStorageFactory.getDb().configDb.removeItem('other_maps').then(function () {
          LocalStorageFactory.getDb().projectDb.removeItem('other_maps').then(function () {
            getThisProject().then(function() {
              LiveDBFactory.save(null, thisProject, null);
              $log.log('Deleted Other Maps from storage.');
            });
          });
        });
      }
      else {
        LocalStorageFactory.getDb().configDb.setItem('other_maps', inOtherMaps).then(function () {
          LocalStorageFactory.getDb().projectDb.setItem('other_maps', inOtherMaps).then(function () {
            getThisProject().then(function() {
              LiveDBFactory.save(null, thisProject, null);
              $log.log('Saved Other Maps: ', inOtherMaps);
            });
          });
        });
      }
    }

    function getThisProject(){ //the is a kludge since ProjectFactory isn't available here
      var deferred = $q.defer(); // init promise
      thisProject = {};
      LocalStorageFactory.getDb().projectDb.iterate(function (value, key) {
        if (key != 'active_datasets' && key != 'spots_dataset' && !key.startsWith('dataset_') && !key.startsWith('spots_') ) thisProject[key] = value;
      }).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }
  }
}());
