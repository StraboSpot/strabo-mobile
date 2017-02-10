(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabController', SpotTabController);

  SpotTabController.$inject = ['$cordovaGeolocation', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory',
    'ProjectFactory', 'SpotFactory', 'TagFactory'];

  function SpotTabController($cordovaGeolocation, $ionicPopup, $log, $scope, $state, DataModelsFactory, ProjectFactory,
                             SpotFactory, TagFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'spot';

    vm.lat = undefined;
    vm.lng = undefined;
    vm.mapped = false;
    vm.showLatLng = false;
    vm.showXY = false;
    vm.x = undefined;
    vm.y = undefined;

    vm.addGeologicUnitTag = addGeologicUnitTag;
    vm.getCurrentLocation = getCurrentLocation;
    vm.setFromMap = setFromMap;
    vm.updateDatetime = updateDatetime;
    vm.updateLatitude = updateLatitude;
    vm.updateLongitude = updateLongitude;
    vm.updateX = updateX;
    vm.updateY = updateY;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotTabController');

      // Loading tab from Spots list
      if ($state.current.name === 'app.spotTab.' + thisTabName) loadTab($state);
      // Loading tab in Map side panel
      $scope.$on('load-tab', function (event, args) {
        if (args.tabName === thisTabName) {
          vmParent.saveSpot().finally(function () {
            vmParent.spotChanged = false;
            loadTab({
              'current': {'name': 'app.spotTab.' + thisTabName},
              'params': {'spotId': args.spotId}
            });
          });
        }
      });

      $scope.$on('update-spot-geometry', function (event, args) {
        vmParent.spot.geometry = args.movedSpotGeometry;
        vmParent.initializing = true;
        setDisplayedCoords();
      });
    }

    function loadTab(state) {
      vmParent.loadTab(state);  // Need to load current state into parent

      vmParent.showTrace = false;
      vmParent.showGeologicUnit = true;
      vmParent.showSurfaceFeature = false;
      if (vmParent.spot.geometry && vmParent.spot.geometry.type === 'LineString') {
        vmParent.showTrace = true;
        vmParent.showGeologicUnit = false;
        if (vmParent.spot.properties.trace) vmParent.data = vmParent.spot.properties.trace;
        vmParent.survey = DataModelsFactory.getDataModel('trace').survey;
        vmParent.choices = DataModelsFactory.getDataModel('trace').choices;
      }
      if (vmParent.spot.geometry && vmParent.spot.geometry.type === 'Polygon') {
        vmParent.showRadius = false;
        vmParent.showSurfaceFeature = true;
        if (vmParent.spot.properties.surface_feature) vmParent.data = vmParent.spot.properties.surface_feature;
        vmParent.survey = DataModelsFactory.getDataModel('surface_feature').survey;
        vmParent.choices = DataModelsFactory.getDataModel('surface_feature').choices;
      }

      // Has the spot been mapped yet?
      if (vmParent.spot && vmParent.spot.geometry && vmParent.spot.geometry.coordinates) {
        // If the geometry coordinates contain any null values, delete the geometry; it shouldn't be defined
        if (_.indexOf(_.flatten(vmParent.spot.geometry.coordinates), null) !== -1) delete vmParent.spot.geometry;
        else {
          vm.mapped = true;
          setDisplayedCoords();
        }
      }
    }

    function addSpotLevelTag() {
      vmParent.filterAllTagsType();
      vmParent.addTagModal.show();
    }

    function setDisplayedCoords() {
      // Only show Latitude and Longitude input boxes if the geometry type is Point
      if (vmParent.spot.geometry.type === 'Point') {
        if (_.has(vmParent.spot.properties, 'image_basemap')) {
          vm.showXY = true;
          vm.y = vmParent.spot.geometry.coordinates[1];
          vm.x = vmParent.spot.geometry.coordinates[0];
        }
        else {
          vm.showLatLng = true;
          vm.lat = vmParent.spot.geometry.coordinates[1];
          vm.lng = vmParent.spot.geometry.coordinates[0];
        }
      }
    }

    /**
     * Public Functions
     */

    function addGeologicUnitTag() {
      vmParent.selectedType = 'geologic_unit';
      addSpotLevelTag();
    }

    // Get current location of the user
    function getCurrentLocation() {
      $cordovaGeolocation.getCurrentPosition().then(function (position) {
        vm.lat = position.coords.latitude;
        vm.lng = position.coords.longitude;
        vmParent.spot.geometry = {
          'type': 'Point',
          'coordinates': [vm.lng, vm.lat]
        };
        vm.showLatLng = true;
        vm.mapped = true;
        if (position.coords.altitude) vmParent.spot.properties.altitude = position.coords.altitude;
      }, function (err) {
        $ionicPopup.alert({
          'title': 'Alert!',
          'template': 'Unable to get location: ' + err.message
        });
      });
    }

    // Open the map so the user can set the location for the spot
    function setFromMap() {
      SpotFactory.moveSpot = true;
      if (_.has(vmParent.spot.properties, 'image_basemap')) {
        vmParent.submit('/app/image-basemaps/' + vmParent.spot.properties.image_basemap);
      }
      else vmParent.submit('/app/map');
    }

    function updateDatetime(datetime) {
      vmParent.spot.properties.date = datetime.toISOString();
      vmParent.spot.properties.time = datetime.toISOString(); // ToDo: remove time property when no longer needed
    }

    // Update the value for the Latitude from the user input
    function updateLatitude(lat) {
      vmParent.spot.geometry.coordinates[1] = lat;
    }

    // Update the value for the Longitude from the user input
    function updateLongitude(lng) {
      vmParent.spot.geometry.coordinates[0] = lng;
    }

    // Update the value for the x from the user input
    function updateX(x) {
      vmParent.spot.geometry.coordinates[0] = x;
    }

    // Update the value for the Longitude from the user input
    function updateY(y) {
      vmParent.spot.geometry.coordinates[1] = y;
    }
  }
}());