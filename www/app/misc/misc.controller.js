(function () {
  'use strict';

  angular
    .module('app')
    .controller('MiscController', MiscController);

  MiscController.$inject = ['$ionicLoading', '$ionicModal', '$ionicPopup', '$log', '$q', '$rootScope', '$scope',
    '$state', '$timeout', '$window', 'DataModelsFactory', 'HelpersFactory', 'ProjectFactory', 'RemoteServerFactory',
    'SpotFactory', 'IS_WEB'];

  function MiscController($ionicLoading, $ionicModal, $ionicPopup, $log, $q, $rootScope, $scope, $state, $timeout,
                          $window, DataModelsFactory, HelpersFactory, ProjectFactory, RemoteServerFactory, SpotFactory,
                          IS_WEB) {
    var vm = this;

    var initializing = true;

    vm.dataChanged = false;
    vm.dbUrl = undefined;
    vm.isTestingMode = false;
    vm.msg = undefined;
    // vm.pointsToGenerate = 10;
    vm.spotDataModel = {};
    vm.spotModelModal = {};

    vm.closeModal = closeModal;
    vm.getSpotDataModel = getSpotDataModel;
    vm.resetDbUrl = resetDbUrl;
    vm.save = save;
    // vm.submit = submit;
    vm.toggleTestingMode = toggleTestingMode;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.dbUrl = RemoteServerFactory.getDbUrl();

      var project = ProjectFactory.getCurrentProject();
      vm.isTestingMode = project.is_testing_mode || false;

      $ionicModal.fromTemplateUrl('app/misc/misc-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.spotModelModal = modal;
      });

      if (IS_WEB) {
        $scope.$watch('vm.dbUrl', function (newValue, oldValue, scope) {
          if (!_.isEmpty(newValue)) {
            if (initializing) {
              vm.dataChanged = false;
              $timeout(function () {
                initializing = false;
              });
            }
            else {
              //$log.log('CHANGED vm.data', 'new value', newValue, 'oldValue', oldValue);
              vm.dataChanged = true;
            }
          }
        }, true);

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
          if (vm.dataChanged && fromState.name === 'app.misc') save();
        });
      }
    }

    // Return a random number between min and max
    function randCoords(min, max, interval) {
      if (angular.isUndefined(interval)) interval = 1;
      var r = Math.floor(Math.random() * (max - min + interval) / interval);
      return r * interval + min;
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

    // function generateRandomGeojsonPoint(num) {
    //   if (_.isEmpty(ProjectFactory.getSpotsDataset())) {
    //     $ionicPopup.alert({
    //       'title': 'No Default Dataset',
    //       'template': 'A default dataset for new Spots has not been specified. Set this from the Manage Project page.'
    //     });
    //     $state.go('app.manage-project');
    //   }
    //   else {
    //     $ionicLoading.show({
    //       'template': '<ion-spinner></ion-spinner>'
    //     });
    //     // Bounding area for United States
    //     /* var bounds = {
    //      'topRight': {'lat': 58, 'lng': -76},
    //      'bottomLeft': {'lat': 11, 'lng': -122}
    //      };*/

    //     // Bounding area for downtown Tucson
    //     var bounds = {
    //       'topRight': {'lat': 32.226293, 'lng': -110.972307},
    //       'bottomLeft': {'lat': 32.214196, 'lng': -110.985042}
    //     };

    //     var feature_types = ['bedding', 'contact', 'foliation', 'fracture', 'fault', 'shear_zone_bou', 'other',
    //       'vein'];

    //     var promises = [];
    //     for (var i = 0; i < num; i++) {
    //       var strike = _.random(0, 180);
    //       var featureType = feature_types[Math.floor(Math.random() * feature_types.length)];
    //       var geojsonPoint = {
    //         'geometry': {
    //           'type': 'Point',
    //           'coordinates': [
    //             randCoords(bounds.bottomLeft.lng, bounds.topRight.lng, 0.0001),
    //             randCoords(bounds.topRight.lat, bounds.bottomLeft.lat, 0.0001)
    //           ]
    //         },
    //         'properties': {
    //           'orientation_data': [{
    //             'id': HelpersFactory.getNewId(),
    //             'dip': _.random(0, 90),
    //             'feature_type': featureType,
    //             'label': featureType + strike.toString(),
    //             'type': 'planar_orientation',
    //             'strike': strike
    //           }],
    //           'name': 'x' + _.random(10, 99) + i.toString()
    //         }
    //       };
    //       promises.push(SpotFactory.setNewSpot(geojsonPoint));
    //     }
    //     $q.all(promises).then(function () {
    //       vm.msg = 'Finished generating Spots';
    //       $ionicLoading.hide();
    //     });
    //   }
    // }

    function getSpotDataModel() {
      vm.spotDataModel = DataModelsFactory.getSpotDataModel();

      vm.json = syntaxHighlight(angular.toJson(vm.spotDataModel, true));

      if (IS_WEB) {
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

    function resetDbUrl() {
      vm.dbUrl = 'https://strabospot.org/db';
    }

    function save() {
      RemoteServerFactory.setDbUrl(vm.dbUrl);
      vm.dataChanged = false;
    }

    // function submit(pointsToGenerate) {
    //   $log.log('Generating ' + pointsToGenerate + ' random Spots ...');
    //   generateRandomGeojsonPoint(pointsToGenerate);
    // }

    function toggleTestingMode() {
      ProjectFactory.saveProjectItem('is_testing_mode', vm.isTestingMode);
      if (!vm.isTestingMode) {
        var preferences = ProjectFactory.getPreferences();
        preferences.sed_lithologies = false;
        preferences.sed_structures = false;
        preferences.sed_interpretations = false;
        preferences.strat_mode = false;
        preferences.experimental = false;
        preferences.experimental_results = false;
        preferences.experimental_set_up = false;
        preferences.data = false;
        preferences.petrology = false;
        ProjectFactory.saveProjectItem('preferences', preferences);
      }
    }
  }
}());
