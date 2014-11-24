'use strict';

angular.module('app')
  .factory('SpotsFactory', function($q) {

    var factory = {};

    factory.all = function() {
      var deferred = $q.defer();  //init promise

      var spots = [];

      spotsDb.iterate(function(value, key) {
        spots.push(value);
      }, function() {
        deferred.resolve(spots);        
      });

      return deferred.promise;
    }

    factory.save = function(value, callback) {
      var self = this;

      // create a psuedo-random number as key
      var key = new Date().getTime().toString();

      // lets also put the key in the value.properties.id
      value.properties.id = key;

      self.write(key, value, function() {
        callback();
      });
    }
    
    // delete the spot
    factory.destroy = function(key) {
      spotsDb.removeItem(key);
    }

    // gets the number of spots
    factory.getSpotCount = function(callback) {
      spotsDb.length(function(err, numberOfKeys) {
        callback(err || numberOfKeys);
      });
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
    factory.write = function(key, value, callback) {
      spotsDb.setItem(key, value).then(function() {
        callback();
      });
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