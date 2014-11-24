angular.module('app')

.controller('SpotCtrl', function($scope, $stateParams, $location, SpotsFactory, NewSpot, MapView, $ionicViewService, $cordovaGeolocation, $cordovaDialogs) {

  // all the spots available in offline
  $scope.spots;

  SpotsFactory.all().then(function(spots) {
    $scope.spots = spots;

    // a single spot
    $scope.spot;

    $scope.point = {};

    // Initialize new Spot
    if (NewSpot.getNewSpot()) {
      $scope.spot = NewSpot.getNewSpot();

      // now clear the new spot from the service because we have the info in our current scope
      NewSpot.clearNewSpot();
    }
    // Load current Spot
    else {
      $scope.spot = _.filter($scope.spots, function(spot) {
        return spot.properties.id === $stateParams.spotId;
      })[0];
    }

    // is the new spot a single point?
    if ($scope.spot.geometry && $scope.spot.geometry.type === "Point") {
      // toggles the Lat/Lng input boxes based on available Lat/Lng data
      $scope.showLatLng = true;

      // pre-assign the lat/lng from the geometry
      $scope.point.latitude = $scope.spot.geometry.coordinates[1];
      $scope.point.longitude = $scope.spot.geometry.coordinates[0];
    }

    $scope.friendlyGeom = JSON.stringify($scope.spot.geometry);
  });



  // Define Spot parameters
  $scope.spotTypes = [{
    text: 'Type a',
    value: 'a'
  }, {
    text: 'Type b',
    value: 'b'
  }, {
    text: 'Type c',
    value: 'c'
  }];

  // Get current location
  $scope.getLocation = function() {
    $cordovaGeolocation.getCurrentPosition().then(function(position) {

      // assign the lat/lng upon getting location
      $scope.point.latitude = position.coords.latitude;
      $scope.point.longitude = position.coords.longitude;

      $scope.spot.geometry = {
        type: "Point",
        coordinates: [position.coords.longitude, position.coords.latitude]
      }
      $scope.friendlyGeom = JSON.stringify($scope.spot.geometry);
    }, function(err) {
      alert("Unable to get location: " + err.message);
    });
  }

  $scope.openMap = function() {
    // Save current spot
    NewSpot.setNewSpot($scope.spot);
    $location.path("/app/map");
  }

  // Add or modify Spot
  $scope.submit = function() {

    if (!$scope.spot.properties.name) {
      alert('Name required');
      return;
    }

    // define the geojson feature type
    $scope.spot.type = "Feature";

    // is the new spot a single point?
    if ($scope.spot.geometry.type === "Point") {
      // yes, replace the geojson geometry with the lat/lng from the input fields
      $scope.spot.geometry.coordinates[1] = $scope.point.latitude;
      $scope.spot.geometry.coordinates[0] = $scope.point.longitude;
    }

    // save the spot
    SpotsFactory.save($scope.spot);

    // Go back one view in history
    var backView = $ionicViewService.getBackView();
    backView.go();
  };
  
  // Delete the spot
  $scope.deleteSpot = function() {
  $cordovaDialogs.confirm('Delete this Spot?', 'Delete', ['OK','Cancel'])
    .then(function(buttonIndex) {
      // no button = 0, 'OK' = 1, 'Cancel' = 2
      var btnIndex = buttonIndex;
      if (btnIndex == 1) {
        SpotsFactory.destroy($scope.spot.properties.id);
        $location.path("/app/spots");
      }
    });
  }
  
  // View the spot on the map
  $scope.goToSpot = function() {
    var coords = $scope.spot.geometry.coordinates;
    var lon = coords[0]
    var lat = coords[1];
    // Get the center lat & lon of non-point features
    if (isNaN(lon) || isNaN(lat)) {
      if ($scope.spot.geometry.type == "Polygon")
        coords = coords[0];
      var lons = _.pluck(coords, 0);
      var lats = _.pluck(coords, 1);
      lon = (_.min(lons) + _.max(lons))/2;
      lat = (_.min(lats) + _.max(lats))/2;
    }
    var spotCenter = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
    MapView.setRestoreView(true);
    MapView.setMapView(new ol.View({center: spotCenter, zoom: 16}));
    $location.path("/app/map");
  }
});