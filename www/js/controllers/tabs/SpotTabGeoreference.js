angular.module('app')
  .controller('SpotTabGeoreferenceCtrl', function ($scope,
                                                   $cordovaGeolocation,
                                                   CurrentSpot,
                                                   $location,
                                                   SpotsFactory,
                                                   MapView) {

    console.log('inside spot tab georeference ctrl');

    // Get current location
    $scope.getLocation = function () {
      $cordovaGeolocation.getCurrentPosition().then(function (position) {

        // assign the lat/lng upon getting location
        $scope.point.latitude = position.coords.latitude;
        $scope.point.longitude = position.coords.longitude;

        $scope.spot.geometry = {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude]
        };
      }, function (err) {
        $ionicPopup.alert({
          title: 'Alert!',
          template: "Unable to get location: " + err.message
        });
      });
    };

    $scope.openMap = function () {
      // Save current spot
      CurrentSpot.setCurrentSpot($scope.spot);
      $location.path("/app/map");
    };

    // View the spot on the map
    $scope.goToSpot = function () {
      var center = SpotsFactory.getCenter($scope.spot);
      var spotCenter = ol.proj.transform([center.lon, center.lat], 'EPSG:4326', 'EPSG:3857');
      MapView.setMapView(new ol.View({
        center: spotCenter,
        zoom: 16
      }));
      $location.path("/app/map");
    };

  });
