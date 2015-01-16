angular.module('app')

.controller("DebugCtrl", function(
  $scope,
  SpotsFactory) {

  $scope.data = {
    pointsToGenerate: null
  }

  $scope.submit = function() {
    console.log("submitted");
    generateRandomGeojsonPoint($scope.data.pointsToGenerate)
  }

  // Point object
  var Point = function(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }

  // bounding area for united states
  var UsBounds = {
    "topRight": {
      "lat": 58,
      "lng": -76
    },
    "bottomLeft": {
      "lat": 11,
      "lng": -122
    }
  }

  // generate a random point in the US
  var generateRandomPoint = function() {
    var lat = _.random(UsBounds.topRight.lat, UsBounds.bottomLeft.lat);
    var lng = _.random(UsBounds.topRight.lng, UsBounds.bottomLeft.lng);
    return new Point(lat, lng);
  }


  var generateRandomGeojsonPoint = function(num) {

    for (var i = 0; i < num; i++) {
      var point = generateRandomPoint();

      var key = "x" + i.toString();

      var geojsonPoint = {
        "geometry": {
          "type": "Point",
          "coordinates": [point.lng, point.lat]
        },
        "type": "Feature",
        "properties": {
          "date": "2015-01-04",
          "time": "11:20",
          "strike": _.random(0, 180),
          "dip": _.random(0, 180),
          "name": "x" + i.toString()
        }
      }

      SpotsFactory.save(geojsonPoint, key).then(function(data) {
        console.log("wrote: ", data);
      });

    }
  }



});