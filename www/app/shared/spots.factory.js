(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotsFactory', SpotsFactory);

  SpotsFactory.$inject = ['$q', 'LocalStorage'];

  function SpotsFactory($q, LocalStorage) {
    var factory = {};

    factory.all = function () {
      var deferred = $q.defer(); // init promise

      var spots = [];

      LocalStorage.spotsDb.iterate(function (value, key) {
        spots.push(value);
      }, function () {
        deferred.resolve(spots);
      });

      return deferred.promise;
    };

    factory.save = function (value) {
      value.properties.modified_timestamp = new Date().getTime();

      var self = this;
      var deferred = $q.defer(); // init promise

      self.write(value.properties.id, value).then(function (data) {
        deferred.notify();
        deferred.resolve(data);
      });

      return deferred.promise;
    };

    // delete the spot
    factory.destroy = function (key) {
      return LocalStorage.spotsDb.removeItem(key);
    };

    // gets the number of spots
    factory.getSpotCount = function () {
      return LocalStorage.spotsDb.length();
    };

    // gets the first spot in the db (if exists) -- used to set the map view
    factory.getFirstSpot = function () {
      var deferred = $q.defer(); // init promise

      LocalStorage.spotsDb.keys().then(function (keys, err) {
        if (keys[0] === undefined) {
          deferred.resolve(undefined);
        }
        else {
          deferred.resolve(LocalStorage.spotsDb.getItem(keys[0]));
        }
      });

      return deferred.promise;
    };

    // wipes the spots database
    factory.clear = function (callback) {
      LocalStorage.spotsDb.clear(function (err) {
        if (err) {
          callback(err);
        }
        else {
          callback();
        }
      });
    };

    // write to storage
    factory.write = function (key, value) {
      return LocalStorage.spotsDb.setItem(key, value);
    };

    // read from storage
    factory.read = function (key, callback) {
      LocalStorage.spotsDb.getItem(key).then(function (value) {
        callback(value);
      });
    };

    // Get the center of a geoshape
    factory.getCenter = function (spot) {
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
    };

    factory.getSpotId = function (spotId) {
      return LocalStorage.spotsDb.getItem(spotId);
    };

    // return factory
    return factory;
  }
}());
