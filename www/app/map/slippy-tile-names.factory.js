'use strict';

angular
  .module('app')
  .factory('SlippyTileNamesFactory', function () {
    var factory = {};

    // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    var long2tile = function (lon, zoom) {
      return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    };

    // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    var lat2tile = function (lat, zoom) {
      return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    };

    // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    factory.tile2long = function (x, z) {
      return (x / Math.pow(2, z) * 360 - 180);
    };
    // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    factory.tile2lat = function (y, z) {
      var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
      return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    };

    // build an array of numbers from its number line endpoints
    var numberRangeArray = function (num1, num2) {
      var smallerNumber;
      var largerNumber;

      if (num1 < num2) {
        smallerNumber = num1;
        largerNumber = num2;
      }
      else {
        smallerNumber = num2;
        largerNumber = num1;
      }

      var range = [];

      while (smallerNumber <= largerNumber) {
        range.push(smallerNumber);
        smallerNumber++;
      }
      return range;
    };

    // returns an array of tileIds from two corners of a bounding box
    factory.getTileIds = function (point1, point2, zoom) {
      var x = numberRangeArray(long2tile(point1.lng, zoom), long2tile(point2.lng, zoom));
      var y = numberRangeArray(lat2tile(point1.lat, zoom), lat2tile(point2.lat, zoom));

      var cartesianProduct = [];

      x.forEach(function (valuex) {
        y.forEach(function (valuey) {
          cartesianProduct.push(zoom + '/' + valuex + '/' + valuey);
        });
      });

      // console.log('x', x);
      // console.log('y', y);
      // console.log(cartesianProduct);

      return cartesianProduct;

      // cartesianProduct.forEach(function(tileId) {
      //   OfflineTilesFactory.downloadInternetMapTile(tileId, function(blob) {
      //     // now try to write to offline storage
      //     OfflineTilesFactory.write(tileId, blob, function(blob) {
      //       console.log('wrote ', tileId);
      //     });
      //   });
      // });
    };

    factory.getAvgTileBytes = function () {
      return 15000; // TODO: is this right?
    };

    // return factory
    return factory;
  });
