(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGeoreferenceController', SpotTabGeoreferenceController);

  SpotTabGeoreferenceController.$inject = ['$scope', '$stateParams', '$cordovaGeolocation', '$ionicPopup', '$location',
    '$log', 'CurrentSpot', 'ImageMapService', 'SpotsFactory', 'MapView'];

  function SpotTabGeoreferenceController($scope, $stateParams, $cordovaGeolocation, $ionicPopup, $location,
                                         $log, CurrentSpot, ImageMapService, SpotsFactory, MapView) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab georeference Controller');

    vm.showSetFromMapButton = true;

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

    // Only allow set location to user's location if geometry type is Point
    vm.showMyLocationButton = vmParent.spot.properties.type === 'point' && !vm.showXY;

    // Update the value for the Latitude from the user input
    vm.updateLatitude = function (lat) {
      vmParent.spot.geometry.coordinates[1] = lat;
    };

    // Update the value for the Longitude from the user input
    vm.updateLongitude = function (lng) {
      vmParent.spot.geometry.coordinates[0] = lng;
    };

    // Update the value for the x from the user input
    vm.updateX = function (x) {
      vmParent.spot.geometry.coordinates[0] = x;
    };

    // Update the value for the Longitude from the user input
    vm.updateY = function (y) {
      vmParent.spot.geometry.coordinates[1] = y;
    };

    // View the spot on the map
    vm.viewSpot = function () {
      if (_.has(vmParent.spot.properties, 'image_map')) {
        var image = _.findWhere(ImageMapService.getImageMaps(), {'id': vmParent.spot.properties.image_map});
        ImageMapService.setCurrentImageMap(image);    // Save referenced image map
        $location.path('/app/image-maps/' + vmParent.spot.properties.image_map);
      }
      else {
        var center = SpotsFactory.getCenter(vmParent.spot);
        var spotCenter = ol.proj.transform([center.lon, center.lat], 'EPSG:4326', 'EPSG:3857');
        MapView.setMapView(new ol.View({
          'center': spotCenter,
          'zoom': 16
        }));
        $location.path('/app/map');
      }
    };

    // Get current location of the user
    vm.getCurrentLocation = function () {
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
    };

    // Open the map so the user can set the location for the spot
    vm.setFromMap = function () {
      CurrentSpot.setCurrentSpot(vmParent.spot);    // Save current spot
      if (_.has(vmParent.spot.properties, 'image_map')) {
        var image = _.findWhere(ImageMapService.getImageMaps(), {'id': vmParent.spot.properties.image_map});
        ImageMapService.setCurrentImageMap(image);    // Save referenced image map
        $location.path('/app/image-maps/' + vmParent.spot.properties.image_map);
      }
      else {
        $location.path('/app/map');
      }
    };

    vm.getGeometryType = function () {
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
    };
  }
}());
