(function () {
  'use strict';

  angular
    .module('app')
    .controller('DebugController', DebugController);

  DebugController.$inject = ['$document', '$ionicModal', '$log', '$scope', '$window', 'DataModelsFactory',
    'SpotFactory'];

  function DebugController($document, $ionicModal, $log, $scope, $window, DataModelsFactory, SpotFactory) {
    var vm = this;

    vm.spotDataModel = {};

    vm.closeModal = closeModal;
    vm.getSpotDataModel = getSpotDataModel;
    vm.pointsGenerated = undefined;
    vm.pointsToGenerate = undefined;
    vm.spotModelModal = {};
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $ionicModal.fromTemplateUrl('app/debug/debug-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.spotModelModal = modal;
      });
    }

    function syntaxHighlight(json) {
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
          var field = '';
          var cls = '';
          _.each(match.split('; '), function (part, i) {
            if (i !== 0) field += '; ';
            if (/:$/.test(part)) cls = 'key';
            else if (/Type:/.test(part)) cls = 'type';
            else if (/Label:/.test(part)) cls = 'label';
            else if (/Hint:/.test(part)) cls = 'hint';
            else if (/REQUIRED/.test(part)) cls = 'required';
            else cls = 'string';
            field += '<span class="' + cls + '">' + part + '</span>';
          });
          return field;
        });
    }

    /**
     * Public Functions
     */

    function closeModal(modal) {
      vm[modal].hide();
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

      var feature_types = ['bedding', 'contact', 'foliation', 'fracture', 'fault', 'shear_zone_boundary', 'other',
        'vein'];

      var initialNumberOfSpots = SpotFactory.getSpots().length;

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
            'orientation_data': [{
              'dip': _.random(0, 90),
              'feature_type': feature_types[Math.floor(Math.random() * feature_types.length)],
              'orientation_type': 'planar_orientation',
              'strike': _.random(0, 180)
            }],
            'date': d,
            'time': d,
            'name': 'x' + _.random(10, 99) + i.toString(),
            'id': Math.floor((new Date().getTime() + Math.random()) * 10)
          }
        };

        SpotFactory.save(geojsonPoint).then(function (spots) {
          vm.pointsGenerated = spots.length - initialNumberOfSpots;
        });
      }
    }

    function getSpotDataModel() {
      vm.spotDataModel = DataModelsFactory.getSpotDataModel();

      vm.json = syntaxHighlight(angular.toJson(vm.spotDataModel, true));

      // If this is a web browser and not using cordova
      if ($document[0].location.protocol !== 'file:') { // Phonegap is not present
        var win = $window.open();
        var html = '<head>';
        html += '<style>pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; } .type { color: green; }';
        html += '.required { color: darkorange; } .label { color: blue; } .hint { color: magenta; } .key { color: red; }</style>';
        html += '</head><body>';
        html += '<h4>Spot Data Model</h4>';
        html += '<small>This list shows all possible Spot fields. Note not all fields will be populated. If not a top-level field, required fields are only required when field is displayed (based on skip logic).</small>';
        html += '<pre>' + vm.json + '</pre>';
        win.document.writeln(html);
      }
      else vm.spotModelModal.show();
    }

    function submit(pointsToGenerate) {
      $log.log('Generating ' + pointsToGenerate + ' random Spots ...');
      generateRandomGeojsonPoint(pointsToGenerate);
    }
  }
}());
