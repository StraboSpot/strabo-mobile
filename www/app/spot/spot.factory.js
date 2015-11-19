(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotFactory', SpotFactory);

  SpotFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function SpotFactory($log, $q, LocalStorageFactory) {
    var data = {};

    return {
      'clear': clear,
      'destroy': destroy,
      'getCenter': getCenter,
      'getFirstSpot': getFirstSpot,
      'getSpotCount': getSpotCount,
      'getSpotId': getSpotId,
      'getSpots': getSpots,
      'loadSpots': loadSpots,
      'read': read,
      'save': save,
      'write': write
    };

    /**
     * Private Functions
     */

    // Load all spots from local storage
    function all() {
      var deferred = $q.defer(); // init promise
      var spots = [];

      LocalStorageFactory.spotsDb.iterate(function (value, key) {
        spots.push(value);
      }, function () {
        deferred.resolve(spots);
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    // wipes the spots database
    function clear() {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.spotsDb.clear().then(function () {
        data = {};
        deferred.notify();
        deferred.resolve(data);
      });
      return deferred.promise;
    }

    // delete the spot
    function destroy(key) {
      return LocalStorageFactory.spotsDb.removeItem(key);
    }

    // Get the center of a geoshape
    function getCenter(spot) {
      var coords = spot.geometry.coordinates;
      var lon = coords[0];
      var lat = coords[1];
      // Get the center lat & lon of non-point features
      if (isNaN(lon) || isNaN(lat)) {
        if (spot.geometry.type === 'Polygon') {
          coords = coords[0];
        }
        var lons = _.pluck(coords, 0);
        var lats = _.pluck(coords, 1);
        lon = (_.min(lons) + _.max(lons)) / 2;
        lat = (_.min(lats) + _.max(lats)) / 2;
      }
      return {
        'lon': lon,
        'lat': lat
      };
    }

    // gets the first spot in the db (if exists) -- used to set the map view
    function getFirstSpot() {
      var deferred = $q.defer(); // init promise

      LocalStorageFactory.spotsDb.keys().then(function (keys, err) {
        if (angular.isUndefined(keys[0])) {
          deferred.resolve(undefined);
        }
        else {
          deferred.resolve(LocalStorageFactory.spotsDb.getItem(keys[0]));
        }
      });

      return deferred.promise;
    }

    // gets the number of spots
    function getSpotCount() {
      return LocalStorageFactory.spotsDb.length();
    }

    function getSpotId(spotId) {
      return LocalStorageFactory.spotsDb.getItem(spotId);
    }

    function getSpots() {
      return data;
    }

    function loadSpots() {
      if (_.isEmpty(data)) {
        $log.log('Loading spots ....');
        var dataPromise = all().then(function (savedData) {
          data = savedData;
          $log.log('Finished loading spots: ', data);
        });
        return dataPromise;
      }
    }

    // read from storage
    function read(key, callback) {
      LocalStorageFactory.spotsDb.getItem(key).then(function (value) {
        callback(value);
      });
    }

    function save(saveSpot) {
      saveSpot.properties.modified_timestamp = new Date().getTime();

      var deferred = $q.defer(); // init promise
      LocalStorageFactory.spotsDb.setItem(saveSpot.properties.id, saveSpot).then(function () {
        $log.log('Saved spot: ', saveSpot);
        all().then(function (savedData) {
          data = savedData;
          $log.log('All spots: ', data);
          deferred.notify();
          deferred.resolve(data);
        });
      });
      return deferred.promise;
    }

    // write to storage
    function write(key, value) {
      return LocalStorageFactory.spotsDb.setItem(key, value);
    }
  }
}());
