(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGeoreferenceController', SpotTabGeoreferenceController);

  SpotTabGeoreferenceController.$inject = ['$scope', '$stateParams', '$cordovaGeolocation', '$ionicPopup', '$location',
    '$log', 'CurrentSpotFactory', 'ImageMapFactory', 'SpotFactory', 'MapViewFactory'];

  function SpotTabGeoreferenceController($scope, $stateParams, $cordovaGeolocation, $ionicPopup, $location,
                                         $log, CurrentSpotFactory, ImageMapFactory, SpotFactory, MapViewFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    vm.getCurrentLocation = getCurrentLocation;
    vm.getGeometryType = getGeometryType;
    vm.setFromMap = setFromMap;
    // Only allow set location to user's location if geometry type is Point
    vm.showMyLocationButton = vmParent.spot.properties.type === 'point' && !vm.showXY;
    vm.showSetFromMapButton = true;
    vm.updateLatitude = updateLatitude;
    vm.updateLongitude = updateLongitude;
    vm.updateX = updateX;
    vm.updateY = updateY;
    vm.viewSpot = viewSpot;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotTabGeoreferenceController');

      // Has the spot been mapped yet?
      if (vmParent.spot.geometry) {
        if (vmParent.spot.geometry.coordinates) {
          // If the geometry coordinates contain any null values, delete the geometry; it shouldn't be defined
          if (_.indexOf(_.flatten(vmParent.spot.geometry.coordinates), null) !== -1) {
            delete vmParent.spot.geometry;
          }
          else {
            vm.mapped = true;
            vm.viewOnMapButton = true;

            // Only allow set location from map if geometry type is not MultiPoint, MultiLineString or MultiPolygon
            vm.showSetFromMapButton = !(vmParent.spot.geometry.type === 'MultiPoint' || vmParent.spot.geometry.type === 'MultiLineString' || vmParent.spot.geometry.type === 'MultiPolygon');

            // Only show Latitude and Longitude input boxes if the geometry type is Point
            if (vmParent.spot.geometry.type === 'Point') {
              if (_.has(vmParent.spot.properties, 'image_map')) {
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
        }
      }
    }

    /**
     * Public Functions
     */

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
      }, function (err) {
        $ionicPopup.alert({
          'title': 'Alert!',
          'template': 'Unable to get location: ' + err.message
        });
      });
    }

    function getGeometryType() {
      switch (vmParent.spot.properties.type) {
        case 'point':
          return 'Point';
        case 'line':
          return 'LineString';
        case 'polygon':
          return 'Polygon';
        case 'group':
          return 'Polygon';
      }
    }

    // Open the map so the user can set the location for the spot
    function setFromMap() {
      CurrentSpotFactory.setCurrentSpot(vmParent.spot);    // Save current spot
      if (_.has(vmParent.spot.properties, 'image_map')) {
        var image = _.findWhere(ImageMapFactory.getImageMaps(), {'id': vmParent.spot.properties.image_map});
        ImageMapFactory.setCurrentImageMap(image);    // Save referenced image map
        $location.path('/app/image-maps/' + vmParent.spot.properties.image_map);
      }
      else {
        $location.path('/app/map');
      }
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

    // View the spot on the map
    function viewSpot() {
      if (_.has(vmParent.spot.properties, 'image_map')) {
        var image = _.findWhere(ImageMapFactory.getImageMaps(), {'id': vmParent.spot.properties.image_map});
        ImageMapFactory.setCurrentImageMap(image);    // Save referenced image map
        $location.path('/app/image-maps/' + vmParent.spot.properties.image_map);
      }
      else {
        var center = SpotFactory.getCenter(vmParent.spot);
        var spotCenter = ol.proj.transform([center.lon, center.lat], 'EPSG:4326', 'EPSG:3857');
        MapViewFactory.setMapView(new ol.View({
          'center': spotCenter,
          'zoom': 16
        }));
        $location.path('/app/map');
      }
    }
  }
}());
