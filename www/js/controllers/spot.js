angular.module('app')

  .controller('SpotCtrl', function($scope, $stateParams, $location, Spots, NewSpot, $ionicViewService, $cordovaGeolocation) {
  
    // Load or initialize Spot
    $scope.spots = Spots.all();

    $scope.point = {};

    // Initialize new Spot
    if (NewSpot.getNewSpot()) {
      $scope.spot = NewSpot.getNewSpot();
      
      // now clear the new spot from the service because we have the info in our current scope
      NewSpot.clearNewSpot();
    }
    // Load current Spot
    else
      $scope.spot = $scope.spots[$stateParams.spotId];  

    // is the new spot a single point?
    if ($scope.spot.geometry && $scope.spot.geometry.type === "Point") {
      // toggles the Lat/Lng input boxes based on available Lat/Lng data
      $scope.showLatLng = true;  

      // pre-assign the lat/lng from the geometry
      $scope.point.latitude = $scope.spot.geometry.coordinates[1];
      $scope.point.longitude = $scope.spot.geometry.coordinates[0];
    }

    $scope.friendlyGeom = JSON.stringify($scope.spot.geometry);
    
    // Define Spot parameters
    $scope.spotTypes = [
        { text: 'Type a', value: 'a' },
        { text: 'Type b', value: 'b' },
        { text: 'Type c', value: 'c' }
      ];
    
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
    
    $scope.openMap = function(){
      // Save current spot
      NewSpot.setNewSpot($scope.spot);
      $location.path("/app/map");
    }
    
    // Add or modify Spot
    $scope.submit = function() {

      if(!$scope.spot.properties.name) {
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

      if (typeof $scope.spot.properties.id == "undefined")
        $scope.spot.properties.id = $scope.spots.length;

      $scope.spots[$scope.spot.properties.id] = $scope.spot;
      Spots.save($scope.spots);

      // Go back one view in history
      var backView = $ionicViewService.getBackView();
      backView.go();
    };
  });