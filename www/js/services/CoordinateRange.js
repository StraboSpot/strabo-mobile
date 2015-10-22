'use strict';

angular
  .module('app')
  .service('CoordinateRange', function () {
    var getAllCoordinates = function (spots) {
      var allCoords = [];

      _.each(spots, function (element) {
        if (element.geometry) {
          var type = element.geometry.type;
          var coords = element.geometry.coordinates;

          switch (type) {
            case 'Point':
              allCoords.push(coords);
              break;
            case 'LineString':
              _.each(coords, function (lineElem) {
                allCoords.push(lineElem);
              });
              break;
            case 'Polygon':
              _.each(coords[0], function (polyElem) {
                allCoords.push(polyElem);
              });
              break;
            case 'MultiPoint':
              _.each(coords, function (pointVertex) {
                allCoords.push(pointVertex);
              });
              break;
            case 'MultiLineString':
              _.each(coords, function (lineElem) {
                _.each(lineElem, function (lineVertex) {
                  allCoords.push(lineVertex);
                });
              });
              break;
            case 'MultiPolygon':
              _.each(coords, function (multiPolyElem) {
                _.each(multiPolyElem, function (polyElem) {
                  _.each(polyElem, function (polyVertex) {
                    allCoords.push(polyVertex);
                  });
                });
              });
              break;
          }
        }
      });
      return allCoords;
    };

    var getLatitudes = function () {
      return _.map(getAllCoordinates(), function (coord) {
        return coord[1];
      });
    };

    var getMaxLatitude = function () {
      return _.max(getLatitudes(), function (latitude) {
        return latitude;
      });
    };

    var getMinLatitude = function () {
      return _.min(getLatitudes(), function (latitude) {
        return latitude;
      });
    };

    var getLongitudes = function () {
      return _.map(getAllCoordinates(), function (coord) {
        return coord[0];
      });
    };

    var getMaxLongitude = function () {
      return _.max(getLongitudes(), function (longitude) {
        return longitude;
      });
    };

    var getMinLongitude = function () {
      return _.min(getLongitudes(), function (longitude) {
        return longitude;
      });
    };

    return {
      'getAllCoordinates': getAllCoordinates,
      'getLatitudes': getLatitudes,
      'getMaxLatitude': getMaxLatitude,
      'getMinLatitude': getMinLatitude,
      'getLongitudes': getLongitudes,
      'getMaxLongitude': getMaxLongitude,
      'getMinLongitude': getMinLongitude
    };
  });
