(function () {
  'use strict';

  angular
    .module('app')
    .controller('DebugController', DebugController);

  DebugController.$inject = ['$log', 'SpotFactory'];

  function DebugController($log, SpotFactory) {
    var vm = this;

    vm.pointsToGenerate = '';
    vm.submit = submit;

    function submit(pointsToGenerate) {
      $log.log('Generating ' + pointsToGenerate + ' random points.');
      generateRandomGeojsonPoint(pointsToGenerate);
    }

    function generateRandomGeojsonPoint(num) {
      // Bounding area for United States
      /* var bounds = {
       'topRight': {'lat': 58, 'lng': -76},
       'bottomLeft': {'lat': 11, 'lng': -122}
       };*/

      // Bounding area for downtown Tucson
      var bounds = {
        'topRight': {'lat': 32.226293, 'lng': -110.972307},
        'bottomLeft': {'lat': 32.214196, 'lng': -110.985042}
      };

      // Return a random number between min and max
      function rand(min, max, interval) {
        if (angular.isUndefined(interval)) interval = 1;
        var r = Math.floor(Math.random() * (max - min + interval) / interval);
        return r * interval + min;
      }

      var feature_types = ['bedding', 'contact', 'foliation', 'axial_planar_surface', 'fracture', 'joint',
        'fault_plane', 'shear_fracture', 'shear_zone', 'other', 'vein'];

      for (var i = 0; i < num; i++) {
        // Set the date and time to now
        var d = new Date(Date.now());
        d.setMilliseconds(0);

        var geojsonPoint = {
          'geometry': {
            'type': 'Point',
            'coordinates': [
              rand(bounds.bottomLeft.lng, bounds.topRight.lng, 0.0001),
              rand(bounds.topRight.lat, bounds.bottomLeft.lat, 0.0001)
            ]
          },
          'type': 'Feature',
          'properties': {
            'measured_plane': true,
            'planar_feature_type': feature_types[Math.floor(Math.random() * feature_types.length)],
            'date': d,
            'time': d,
            'strike': _.random(0, 180),
            'dip': _.random(0, 90),
            'name': 'x' + _.random(10, 99) + i.toString(),
            'id': Math.floor((new Date().getTime() + Math.random()) * 10)
          }
        };

        SpotFactory.save(geojsonPoint);
      }
    }
  }
}());
