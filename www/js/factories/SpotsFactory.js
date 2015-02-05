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
    }

    factory.save = function(value, key) {
      var self = this;
      var deferred = $q.defer(); //init promise

      // is the key undefined?
      if (typeof key == 'undefined') {
        // yes -- this means that the key doesn't exist and we want to create a new spot record
        // create a psuedo-random number as key
        key = new Date().getTime().toString();
      }

      // lets also put the key in the value.properties.id
      value.properties.id = key;

      // Make sure strike and dip are numbers
      if (value.properties.strike)
        value.properties.strike = parseFloat(value.properties.strike)
      if (value.properties.dip)
        value.properties.dip = parseFloat(value.properties.dip)

      self.write(key, value).then(function(data) {
        deferred.resolve(data);
      });

      return deferred.promise;
    }

    // delete the spot
    factory.destroy = function(key) {
      return spotsDb.removeItem(key);
    }

    // gets the number of spots
    factory.getSpotCount = function() {
      return spotsDb.length();
    }

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
    }

    // wipes the spots database
    factory.clear = function(callback) {
      spotsDb.clear(function(err) {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
    }

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



    // return factory
    return factory;
  });
