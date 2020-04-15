(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabController', SpotTabController);

  SpotTabController.$inject = ['$ionicLoading', '$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory',
    'HelpersFactory', 'LiveDBFactory', 'ProjectFactory', 'SpotFactory', 'IS_WEB'];

  function SpotTabController($ionicLoading, $ionicModal, $ionicPopup, $log, $scope, $state, FormFactory,
                             HelpersFactory, LiveDBFactory, ProjectFactory, SpotFactory, IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'spot';

    vm.isCreateGeologicUnitTag = false;
    vm.isSelectGeologicUnitTag = false;
    vm.lat = undefined;
    vm.lng = undefined;
    vm.x = undefined;
    vm.y = undefined;

    vm.addGeologicUnitTag = addGeologicUnitTag;
    vm.closeGeologicUnitTagModal = closeGeologicUnitTagModal;
    vm.createGeologicUnitTag = createGeologicUnitTag;
    vm.getCoordArray = getCoordArray;
    vm.isImageBasemapSpot = isImageBasemapSpot;
    vm.isMapped = isMapped;
    vm.isPixelMapping = isPixelMapping;
    vm.isPointSpot = isPointSpot;
    vm.isStratSectionSpot = isStratSectionSpot;
    vm.setCurrentLocation = setCurrentLocation;
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

      $ionicModal.fromTemplateUrl('app/spot/spot-tab/add-geologic-unit-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vmParent.addGeologicUnitTagModal = modal;
      });

      $scope.$on('update-spot-geometry', function (event, args) {
        vmParent.spot.geometry = args.movedSpotGeometry;
        vmParent.initializing = true;
        setDisplayedCoords();
      });
    }

    // Get current location of the user
    function getCurrentLocation() {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner><br>Getting location...'
      });
      if (navigator.geolocation) {
        const geolocationOptions = {
          'maximumAge': 0,
          'timeout': 10000,
          'enableHighAccuracy': true
        };
        navigator.geolocation.getCurrentPosition(gotCurrentPosition, showGeolocationError,
          geolocationOptions);
      }
      else showGeolocationError('Geolocation is not supported by this browser.');
    }

    function gotCurrentPosition(position) {
      vm.lat = HelpersFactory.roundToDecimalPlaces(position.coords.latitude, 6);
      vm.lng = HelpersFactory.roundToDecimalPlaces(position.coords.longitude, 6);
      if (isPixelMapping()) {
        vmParent.spot.properties.lng = vm.lng;
        vmParent.spot.properties.lat = vm.lat;
      }
      else {
        vmParent.spot.geometry = {
          'type': 'Point',
          'coordinates': [vm.lng, vm.lat]
        };
      }
      if (position.coords.altitude) {
        vmParent.spot.properties.altitude = HelpersFactory.roundToDecimalPlaces(position.coords.altitude, 2);
      }
      if (position.coords.accuracy) {
        vmParent.spot.properties.gps_accuracy = HelpersFactory.roundToDecimalPlaces(position.coords.accuracy, 2);
      }
      $ionicLoading.hide();
    }

    function loadTab(state) {
      vmParent.loadTab(state);  // Need to load current state into parent

      if (vmParent.spot && !_.isEmpty(vmParent.spot)) {
        vmParent.showTrace = false;
        vmParent.showGeologicUnit = true;
        vmParent.showSurfaceFeature = false;

        if (vmParent.spot && vmParent.spot.geometry && vmParent.spot.geometry.type === 'LineString') {
          vmParent.showTrace = true;
          vmParent.showGeologicUnit = false;
          if (vmParent.spot.properties.trace) vmParent.data = vmParent.spot.properties.trace;
          FormFactory.setForm('trace');
        }
        if (vmParent.spot && vmParent.spot.geometry &&
          (vmParent.spot.geometry.type === 'Polygon' || vmParent.spot.geometry.type === 'GeometryCollection')) {
          vmParent.showRadius = false;
          vmParent.showSurfaceFeature = true;
          if (vmParent.spot.properties.surface_feature) vmParent.data = vmParent.spot.properties.surface_feature;
          FormFactory.setForm('surface_feature');
        }

        // Has the spot been mapped yet?
        if (vmParent.spot && vmParent.spot.geometry && vmParent.spot.geometry.coordinates) {
          // If the geometry coordinates contain any null values, delete the geometry; it shouldn't be defined
          if (_.indexOf(_.flatten(vmParent.spot.geometry.coordinates), null) !== -1) delete vmParent.spot.geometry;
          else setDisplayedCoords();
        }
      }
    }

    function reloadTab() {
      vmParent.addGeologicUnitTagModal.hide();
      loadTab({
        'current': {'name': 'app.spotTab.' + thisTabName},
        'params': {'spotId': vmParent.spot.properties.id}
      });
    }

    function setDisplayedCoords() {
      // Show Lat and Long if Pixel Coordinates or if the geometry type is Point
      if (isPixelMapping()) {
        vm.lat = vmParent.spot.properties.lat;
        vm.lng = vmParent.spot.properties.lng;
        if (vmParent.spot.geometry.type === 'Point') {
          vm.y = vmParent.spot.geometry.coordinates[1];
          vm.x = vmParent.spot.geometry.coordinates[0];
        }
      }
      else if (vmParent.spot.geometry.type === 'Point') {
        vm.lat = vmParent.spot.geometry.coordinates[1];
        vm.lng = vmParent.spot.geometry.coordinates[0];
      }
    }

    function showGeolocationError(err) {
      $ionicPopup.alert({
        'title': 'Alert!',
        'template': 'Unable to get location: ' + err.message
      });
      $ionicLoading.hide();
    }

    /**
     * Public Functions
     */

    function addGeologicUnitTag() {
      if (!IS_WEB) {
        vmParent.saveSpot().then(function () {
          vmParent.data = {};
          vm.isCreateGeologicUnitTag = false;
          vm.isSelectGeologicUnitTag = true;
          vmParent.addGeologicUnitTagModal.show();
        });
      }
      else {
        if (vmParent.spotChanged) {
          $ionicPopup.alert({
            'title': 'Save Spot First!',
            'template': 'Save your Spot before editing geologic units.'
          });
        }
        else {
          vmParent.data = {};
          vm.isCreateGeologicUnitTag = false;
          vm.isSelectGeologicUnitTag = true;
          vmParent.addGeologicUnitTagModal.show();
        }
      }
    }

    function closeGeologicUnitTagModal() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (_.isEmpty(vmParent.data)) reloadTab();
      else {
        if (!vmParent.data.unit_label_abbreviation) {
          $ionicPopup.alert({
            'title': 'No Unit Label!',
            'template': 'Please give a unit label to this tag.'
          });
        }
        else {
          vmParent.data.id = HelpersFactory.getNewId().toString();
          vmParent.data.type = 'geologic_unit';
          vmParent.data.name = vmParent.data.unit_label_abbreviation;
          vmParent.data.spots = [];
          vmParent.data.spots.push(vmParent.spot.properties.id);
          ProjectFactory.saveTag(vmParent.data).then(function () {
            reloadTab();
            $log.log('Tag saved');
            if (IS_WEB) {
              $log.log('Save tags to LiveDB.', ProjectFactory.getCurrentProject());
              LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
            }
          });
        }
      }
    }

    function createGeologicUnitTag() {
      vm.isCreateGeologicUnitTag = true;
      vm.isSelectGeologicUnitTag = false;
      FormFactory.setForm('rock_unit');
    }

    // Get the array of coordinates as a string
    function getCoordArray() {
      if (vmParent.spot.geometry.coordinates) {
        var coordString = JSON.stringify(vmParent.spot.geometry.coordinates);
        return '[' + coordString.replace(/^\[+|\]+$/g, '') + ']';         // Remove extra [ and ] from start and end
      }
      else return '[multiple geometries]'
    }

    // Is the Spot mapped on an image basemap?
    function isImageBasemapSpot() {
      return vmParent.spot && vmParent.spot.properties && vmParent.spot.properties.image_basemap;
    }

    // Has the Spot been mapped?
    function isMapped() {
      return vmParent.spot && vmParent.spot.geometry;
    }

    // Does the Spot have pixel coordinates
    function isPixelMapping() {
      return isImageBasemapSpot() || isStratSectionSpot();
    }

    // Is the Spot a Point
    function isPointSpot() {
      return vmParent.spot && vmParent.spot.geometry && vmParent.spot.geometry.type === 'Point';
    }

    // Is the Spot mapped ona strat section
    function isStratSectionSpot() {
      return vmParent.spot && vmParent.spot.properties && vmParent.spot.properties.strat_section_id;
    }

    function setCurrentLocation() {
      if (vmParent.spot && vmParent.spot.geometry) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Modify Lat/Long',
          'template': 'Are you sure you want to update the lat and long for this spot?'
        });
        confirmPopup.then(function (res) {
          if (res) getCurrentLocation();
        });
      }
      else getCurrentLocation();
    }

    // Open the map so the user can set the location for the spot
    function setFromMap() {
      SpotFactory.moveSpot = true;
      SpotFactory.setKeepSpotSelected(true);
      if (_.has(vmParent.spot.properties, 'image_basemap')) {
        vmParent.submit('/app/image-basemaps/' + vmParent.spot.properties.image_basemap);
      }
      else if (_.has(vmParent.spot.properties, 'strat_section_id')) {
        vmParent.submit('/app/strat_sections/' + vmParent.spot.properties.strat_section_id);
      }
      else vmParent.submit('/app/map');
    }

    function updateDatetime(datetime) {
      vmParent.spot.properties.date = datetime.toISOString();
      vmParent.spot.properties.time = datetime.toISOString(); // ToDo: remove time property when no longer needed
    }

    // Update the value for the Latitude from the user input
    function updateLatitude(lat) {
      if (isPixelMapping()) vmParent.spot.properties.lat = lat;
      else vmParent.spot.geometry.coordinates[1] = lat;
    }

    // Update the value for the Longitude from the user input
    function updateLongitude(lng) {
      if (isPixelMapping()) vmParent.spot.properties.lng = lng;
      else vmParent.spot.geometry.coordinates[0] = lng;
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
