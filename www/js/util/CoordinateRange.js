function CoordinateRange(list) {
  this.list = list;
}

CoordinateRange.prototype._getAllCoordinates = function() {
  var allCoords = [];

  _.each(this.list, function(element) {
    var type = element.geometry.type;
    var coords = element.geometry.coordinates;

    switch(type) {
      case "Point":
        allCoords.push(coords);
        break;
      case "LineString":
        _.each(coords, function(lineElem) {
          allCoords.push(lineElem);
        });
        break;
      case "Polygon":
        _.each(coords[0], function(polyElem) {
          allCoords.push(polyElem);
        });
        break;
      case "MultiPoint":
        _.each(coords, function(pointVertex) {
          allCoords.push(pointVertex);
        });
        break;
      case "MultiLineString":
        _.each(coords, function(lineElem) {
          _.each(lineElem, function(lineVertex) {
            allCoords.push(lineVertex);
          });
        });
        break;
      case "MultiPolygon":
        _.each(coords, function(multiPolyElem) {
          _.each(multiPolyElem, function(polyElem) {
            _.each(polyElem, function(polyVertex) {
              allCoords.push(polyVertex);
            });
          });
        });
        break;
    }
  });

  return allCoords;
};

CoordinateRange.prototype.getLatitudes = function() {
  return _.map(this._getAllCoordinates(), function(coord) {
    return coord[1];
  });
};

CoordinateRange.prototype.getMaxLatitude = function() {
  return _.max(this.getLatitudes(), function(latitude) {
    return latitude;
  });
};

CoordinateRange.prototype.getMinLatitude = function() {
  return _.min(this.getLatitudes(), function(latitude) {
    return latitude;
  });
};

CoordinateRange.prototype.getLongitudes = function() {
  return _.map(this._getAllCoordinates(), function(coord) {
    return coord[0];
  });
};

CoordinateRange.prototype.getMaxLongitude = function() {
  return _.max(this.getLongitudes(), function(longitude) {
    return longitude;
  });
};

CoordinateRange.prototype.getMinLongitude = function() {
  return _.min(this.getLongitudes(), function(longitude) {
    return longitude;
  });
};
