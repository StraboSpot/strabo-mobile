(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotFactory', SpotFactory);

  SpotFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function SpotFactory($log, $q, LocalStorageFactory) {
    var currentSpot;
    var data = {};
    var newSpot;

    return {
      'clear': clear,
      'clearCurrentSpot': clearCurrentSpot,
      'clearNewSpot': clearNewSpot,
      'destroy': destroy,
      'getCenter': getCenter,
      'getCurrentSpot': getCurrentSpot,
      'getFirstSpot': getFirstSpot,
      'getNewSpot': getNewSpot,
      'getSpotCount': getSpotCount,
      'getSpot': getSpot,
      'getSpots': getSpots,
      'loadSpots': loadSpots,
      'read': read,
      'save': save,
      'setCurrentSpot': setCurrentSpot,
      'setNewSpot': setNewSpot,
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

    function clearCurrentSpot() {
      currentSpot = null;
    }

    function clearNewSpot() {
      newSpot = null;
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

    function getCurrentSpot() {
      return currentSpot;
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

    function getNewSpot() {
      return newSpot;
    }

    // gets the number of spots
    function getSpotCount() {
      return LocalStorageFactory.spotsDb.length();
    }

    function getSpot(id) {
      var spotMatches = _.filter(data, function (spot) {
        return String(spot.properties.id) === id;
      });
      return spotMatches[0];      // Should only be one match
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

    // Read from local storage
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

    function setCurrentSpot(geojsonObj) {
      currentSpot = geojsonObj;
    }

    // Initialize a new Spot
    function setNewSpot(jsonObj) {
      newSpot = {
        'type': 'Feature',
        'properties': {}
      };

      // Set the geometry if the spot has been mapped
      if (jsonObj.geometry) {
        newSpot.geometry = jsonObj.geometry;
      }

      // Set the properties
      newSpot.properties = jsonObj.properties;

      // Set the date and time to now
      var d = new Date(Date.now());
      d.setMilliseconds(0);
      newSpot.properties.date = d;
      newSpot.properties.time = d;

      // Set id from the timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)
      newSpot.properties.id = Math.floor((new Date().getTime() + Math.random()) * 10);
    }

    // Write to local storage
    function write(key, value) {
      return LocalStorageFactory.spotsDb.setItem(key, value);
    }
  }
}());
