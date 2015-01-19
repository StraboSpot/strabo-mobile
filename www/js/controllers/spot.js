angular.module('app')

.controller('SpotCtrl', function(
  $scope,
  $stateParams,
  $location,
  SpotsFactory,
  NewSpot,
  MapView,
  $ionicViewService,
  $cordovaGeolocation,
  $cordovaDialogs,
  $cordovaCamera) {

  // camera images are stored here
  $scope.cameraImages = [];

  $scope.camera = function() {
    // all plugins must be wrapped in a ready function
    document.addEventListener("deviceready", function () {

      var cameraOptions = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.PNG,
        targetWidth: 100,
        targetHeight: 100,
        // popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(cameraOptions).then(function(imageURI) {
        // push the image data to our camera images array
        $scope.cameraImages.push({
          src: "data:image/png;base64," + imageURI
        });

      }, function(err) {
        console.log("error: ", err);
      });
    });
  }




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

  // Define Spot attributes
  $scope.attitude_type = [
    { text: 'planar', value: 'planar' },
    { text: 'linear', value: 'linear' },
    { text: 'planar and linear', value: 'planar and linear' }
  ];

  $scope.plane_type = [
    { text: 'bedding', value: 'bedding' },
    { text: 'flow layering', value: 'flow layering' },
    { text: 'foliation', value: 'foliation' },
    { text: 'joint', value: 'joint' },
    { text: 'fracture', value: 'fracture' },
    { text: 'fault plane', value: 'fault plane' },
    { text: 'axial surface', value: 'axial surface' },
    { text: 'stylolite', value: 'stylolite' }
  ];

  $scope.plane_quality = [
    { text: 'known', value: 'known' },
    { text: 'approximate', value: 'approximate' },
    { text: 'inferred', value: 'inferred' },
    { text: 'approximate(?)', value: 'approximate(?)' },
    { text: 'inferred(?)', value: 'inferred(?)' },
    { text: 'unknown', value: 'unknown' }
  ];

  $scope.plane_facing = [
    { text: 'upright', value: 'upright' },
    { text: 'overturned', value: 'overturned' },
    { text: 'vertical', value: 'vertical' },
    { text: 'approximate(?)', value: 'approximate(?)' },
    { text: 'unknown', value: 'unknown' }
  ];

  $scope.typeSelected = function() {
    console.log($scope.spot.properties.attitude_type);
  };

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
      alert('Name required.');
      return;
    }
    if ($scope.spot.properties.strike < 0 || $scope.spot.properties.strike > 360 || $scope.spot.properties.strike == null) {
      alert('Strike must be between 0-360.');
      return;
    }
    if ($scope.spot.properties.dip < 0 || $scope.spot.properties.dip > 90 || $scope.spot.properties.dip == null) {
      alert('Dip must be between 0-90.');
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

    // camera images should be saved too
    $scope.spot.images = $scope.cameraImages;

    // save the spot -- if the id is defined, we overwrite existing id; otherwise create new id/spot
    SpotsFactory.save($scope.spot, $scope.spot.properties.id).then(function(data){
      console.log("wrote", data);
    });

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
    console.log($scope.spot);
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
    MapView.setMapView(new ol.View({center: spotCenter, zoom: 16}));
    $location.path("/app/map");
  }
});
