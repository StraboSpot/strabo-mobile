'use strict';

angular.module('app')
  .factory('SpotsFactory', function($q) {

    var factory = {};

    factory.all = function() {
      var deferred = $q.defer(); //init promise

      var spots = [];

      spotsDb.iterate(function(value, key) {
        spots.push(value);
      }, function() {
        deferred.resolve(spots);
      });

      return deferred.promise;
    };

    factory.save = function(value) {
      var self = this;
      var deferred = $q.defer(); //init promise

      // The following should be removed once uploading and then download
      // from the database preserves the data type
      // Make sure strike and dip are numbers
      if (value.properties.strike)
        value.properties.strike = parseFloat(value.properties.strike);
      if (value.properties.dip)
        value.properties.dip = parseFloat(value.properties.dip);
      if (value.properties.trend)
        value.properties.trend = parseFloat(value.properties.trend);
      if (value.properties.plunge)
        value.properties.plunge = parseFloat(value.properties.plunge);

      self.write(value.properties.id, value).then(function(data) {
        deferred.notify();
        deferred.resolve(data);
      });

      return deferred.promise;
    };

    // delete the spot
    factory.destroy = function(key) {
      return spotsDb.removeItem(key);
    };

    // gets the number of spots
    factory.getSpotCount = function() {
      return spotsDb.length();
    };

    // gets the first spot in the db (if exists) -- used to set the map view
    factory.getFirstSpot = function() {
      var deferred = $q.defer(); //init promise

      spotsDb.keys().then(function(keys, err) {
        if (keys[0] == undefined) {
          deferred.resolve(undefined);
        } else {
          deferred.resolve(spotsDb.getItem(keys[0]));
        }
      });

      return deferred.promise;
    };

    // wipes the spots database
    factory.clear = function(callback) {
      spotsDb.clear(function(err) {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
    };

    // write to storage
    factory.write = function(key, value) {
      return spotsDb.setItem(key, value);
    };

    // read from storage
    factory.read = function(key, callback) {
      spotsDb.getItem(key).then(function(value) {
        callback(value);
      });
    };

    // Get the center of a geoshape
    factory.getCenter = function(spot) {
      var coords = spot.geometry.coordinates;
      var lon = coords[0];
      var lat = coords[1];
      // Get the center lat & lon of non-point features
      if (isNaN(lon) || isNaN(lat)) {
        if (spot.geometry.type == "Polygon")
          coords = coords[0];
        var lons = _.pluck(coords, 0);
        var lats = _.pluck(coords, 1);
        lon = (_.min(lons) + _.max(lons))/2;
        lat = (_.min(lats) + _.max(lats))/2;
      }
      return {
        "lon": lon,
        "lat": lat
      }
    };

    // return factory
    return factory;
  });
