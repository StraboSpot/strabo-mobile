(function () {
  'use strict';

  angular
    .module('app')
    .controller('DebugController', DebugController);

  DebugController.$inject = ['$scope', '$log', 'SpotsFactory'];

  function DebugController($scope, $log, SpotsFactory) {
    $scope.data = {
      'pointsToGenerate': null
    };

    $scope.submit = function () {
      $log.log('submitted');
      generateRandomGeojsonPoint($scope.data.pointsToGenerate);
    };

    // Point object
    var Point = function (lat, lng) {
      this.lat = lat;
      this.lng = lng;
    };

    // bounding area for united states
    var UsBounds = {
      'topRight': {
        'lat': 58,
        'lng': -76
      },
      'bottomLeft': {
        'lat': 11,
        'lng': -122
      }
    };

    // bounding area for downtown Tucson
    var TUSBounds = {
      'topRight': {
        'lat': 32.226293,
        'lng': -110.972307
      },
      'bottomLeft': {
        'lat': 32.214196,
        'lng': -110.985042
      }
    };

    var bounds = TUSBounds;

    function rand(min, max, interval) {
      if (typeof(interval) === 'undefined') interval = 1;
      var r = Math.floor(Math.random() * (max - min + interval) / interval);
      return r * interval + min;
    }

    // generate a random point in the bounds
    var generateRandomPoint = function () {
      var lat = rand(bounds.topRight.lat, bounds.bottomLeft.lat, 0.0001);
      var lng = rand(bounds.bottomLeft.lng, bounds.topRight.lng, 0.0001);
      return new Point(lat, lng);
    };

    var feature_types = ['bedding', 'contact', 'foliation', 'axial_planar_surface', 'fracture', 'joint',
      'fault_plane', 'shear_fracture', 'shear_zone', 'other', 'vein'];

    var generateRandomGeojsonPoint = function (num) {
      for (var i = 0; i < num; i++) {
        var point = generateRandomPoint();

        var key = 'x' + i.toString();

        // Set the date and time to now
        var d = new Date(Date.now());
        d.setMilliseconds(0);

        var geojsonPoint = {
          'geometry': {
            'type': 'Point',
            'coordinates': [point.lng, point.lat]
          },
          'type': 'Feature',
          'properties': {
            'type': 'point',
            'planar_feature_type': feature_types[Math.floor(Math.random() * feature_types.length)],
            'date': d,
            'time': d,
            'strike': _.random(0, 180),
            'dip': _.random(0, 90),
            'name': 'x' + _.random(10, 99) + i.toString(),
            'id': Math.floor((new Date().getTime() + Math.random()) * 10)
          }
        };

        SpotsFactory.save(geojsonPoint).then(function (data) {
          $log.log('wrote: ', data);
        });
      }
    };
  }
}());
