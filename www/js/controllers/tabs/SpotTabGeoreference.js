angular.module('app')
  .controller('SpotTabGeoreferenceCtrl', function ($scope,
                                                   $cordovaGeolocation,
                                                   $location,
                                                   CurrentSpot,
                                                   SpotsFactory,
                                                   MapView) {

    console.log('inside spot tab georeference ctrl');

    $scope.showSetFromMapButton = true;

    // Has the spot been mapped yet?
    if ($scope.spot.geometry) {
      // If the geometry coordinates contain any null values, delete the geometry; it shouldn't be defined
      if ($scope.spot.geometry.coordinates) {
        if (_.indexOf(_.flatten($scope.spot.geometry.coordinates), null) != -1)
          delete $scope.spot.geometry;
        else {
          $scope.mapped = true;

          // Only allow set location from map if geometry type is not MultiPoint, MultiLineString or MultiPolygon
          $scope.showSetFromMapButton = !($scope.spot.geometry.type == "MultiPoint" || $scope.spot.geometry.type == "MultiLineString" || $scope.spot.geometry.type == "MultiPolygon");

          // Only show Latitude and Longitude input boxes if the geometry type is Point
          if ($scope.spot.geometry.type === "Point") {
            $scope.showLatLng = true;
            $scope.lat = $scope.spot.geometry.coordinates[1];
            $scope.lng = $scope.spot.geometry.coordinates[0];
          }
        }
      }
    }

    // Only allow set location to user's location if geometry type is Point
    $scope.showMyLocationButton = ($scope.spot.properties.type == "point");

    // Update the value for the Latitude from the user input
    $scope.updateLatitude = function (lat) {
      $scope.spot.geometry.coordinates[1] = lat;
    };

    // Update the value for the Longitude from the user input
    $scope.updateLongitude = function (lng) {
      $scope.spot.geometry.coordinates[0] = lng;
    };

    // View the spot on the map
    $scope.viewSpot = function () {
      var center = SpotsFactory.getCenter($scope.spot);
      var spotCenter = ol.proj.transform([center.lon, center.lat], 'EPSG:4326', 'EPSG:3857');
      MapView.setMapView(new ol.View({
        center: spotCenter,
        zoom: 16
      }));
      $location.path("/app/map");
    };

    // Get current location of the user
    $scope.getCurrentLocation = function () {
      $cordovaGeolocation.getCurrentPosition().then(function (position) {
        $scope.lat = position.coords.latitude;
        $scope.lng = position.coords.longitude;
        $scope.spot.geometry = {
          type: "Point",
          coordinates: [$scope.lng, $scope.lat]
        };
        $scope.showLatLng = true;
        $scope.mapped = true;
      }, function (err) {
        $ionicPopup.alert({
          title: 'Alert!',
          template: "Unable to get location: " + err.message
        });
      });
    };

    // Open the map so the user can set the location for the spot
    $scope.setFromMap = function () {
      CurrentSpot.setCurrentSpot($scope.spot);    // Save current spot
      $location.path("/app/map");
    };

    $scope.getGeometryType = function () {
      switch ($scope.spot.properties.type) {
        case "point":
          return "Point";
        case "line":
          return "LineString";
        case "polygon":
          return "Polygon";
        case "group":
          return "Polygon";
      }
    };

  });
