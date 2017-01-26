(function () {
  'use strict';

  angular
    .module('app')
    .factory('SlippyTileNamesFactory', SlippyTileNamesFactory);

  function SlippyTileNamesFactory() {
    return {
      'getAvgTileBytes': getAvgTileBytes,
      'getTileIds': getTileIds,
      'tile2lat': tile2lat,
      'tile2long': tile2long
    };

    /**
     * Private Functions
     */

    // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    function lat2tile(lat, zoom) {
      return (Math.floor(
        (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2,
          zoom)));
    }

    // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    function long2tile(lon, zoom) {
      return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }

    // build an array of numbers from its number line endpoints
    function numberRangeArray(num1, num2) {
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
    }

    /**
     * Public Functions
     */

    function getAvgTileBytes() {
      return 15000; // TODO: is this right?
    }

    // returns an array of tileIds from two corners of a bounding box
    function getTileIds(point1, point2, zoom) {
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
    }

    // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    function tile2long(x, z) {
      return (x / Math.pow(2, z) * 360 - 180);
    }

    // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    function tile2lat(y, z) {
      var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
      return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }
  }
}());
