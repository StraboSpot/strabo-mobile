(function () {
  'use strict';

  angular
    .module('app')
    .factory('CoordinateRangeFactory', CoordinateRangeFactory);

  CoordinateRangeFactory.$inject = [];

  function CoordinateRangeFactory() {
    var allCoords;

    return {
      'getAllCoordinates': getAllCoordinates,
      'getLatitudes': getLatitudes,
      'getLongitudes': getLongitudes,
      'getMaxLatitude': getMaxLatitude,
      'getMaxLongitude': getMaxLongitude,
      'getMinLatitude': getMinLatitude,
      'getMinLongitude': getMinLongitude,
      'setAllCoordinates': setAllCoordinates
    };

    function getAllCoordinates() {
      return allCoords;
    }

    function getLatitudes() {
      return _.map(getAllCoordinates(), function (coord) {
        return coord[1];
      });
    }

    function getLongitudes() {
      return _.map(getAllCoordinates(), function (coord) {
        return coord[0];
      });
    }

    function getMaxLatitude() {
      return _.max(getLatitudes(), function (latitude) {
        return latitude;
      });
    }

    function getMaxLongitude() {
      return _.max(getLongitudes(), function (longitude) {
        return longitude;
      });
    }

    function getMinLatitude() {
      return _.min(getLatitudes(), function (latitude) {
        return latitude;
      });
    }

    function getMinLongitude() {
      return _.min(getLongitudes(), function (longitude) {
        return longitude;
      });
    }

    function setAllCoordinates(spots) {
      allCoords = [];
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
    }
  }
}());
