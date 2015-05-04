function CoordinateRange(list) {
  this.list = list;
}

CoordinateRange.prototype._getAllCoordinates = function() {
  var allCoords = [];

  _.each(this.list, function(element) {
    var type = element.geometry.type;
    var coords = element.geometry.coordinates;

    if (type === 'Point') {
      allCoords.push(coords);
    } else if (type === 'Polygon') {
      _.each(coords[0], function(polyElem) {
        allCoords.push(polyElem);
      });
    } else if (type === 'LineString') {
      _.each(coords, function(lineElem) {
        allCoords.push(lineElem);
      });
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
