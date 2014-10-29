angular.module('app')

  .controller('SpotCtrl', function($scope, $stateParams, $location, $filter, Spots, NewSpot, $ionicViewService, $cordovaGeolocation) {
  
    // Load or initialize Spot
    $scope.spots = Spots.all();
    
    // Load or initialize current Spot
    $scope.spot = Spots.getSpot($scope.spots, $stateParams.spotId, $filter);
    if (NewSpot.getNewLocation().newSpotLat)
      $scope.spot.lat = NewSpot.getNewLocation().newSpotLat;
    if (NewSpot.getNewLocation().newSpotLng)
      $scope.spot.lng = NewSpot.getNewLocation().newSpotLng;
    NewSpot.clearNewLocation();
    
    // Define Spot parameters
    $scope.spotTypes = [
        { text: 'Type a', value: 'a' },
        { text: 'Type b', value: 'b' },
        { text: 'Type c', value: 'c' }
      ];
    
    // Get current location
    $scope.getLocation = function(){
      $cordovaGeolocation.getCurrentPosition().then(function (position) {
        $scope.spot.lat = position.coords.latitude;
        $scope.spot.lng = position.coords.longitude;
        }, function(err) {
          alert("Unable to get location: " + err.message);
      });
    }
    
    $scope.openMap = function(){
      $location.path("/app/map");
    }
    
    // Add or modify Spot
    $scope.submit = function() {
      if(!$scope.spot.name) {
        alert('Name required');
        return;
      }
      
      if (isNaN($scope.spot.lat) || $scope.spot.lat < -180 || $scope.spot.lat > 180) {
        alert('Invalid latitude');
        return;
      }
      
      if (isNaN($scope.spot.lng) || $scope.spot.lng < -180 || $scope.spot.lng > 180) {
        alert('Invalid longitude');
        return;
      }

      if (typeof $scope.spot.id == "undefined")
        $scope.spot.id = $scope.spots.length;

      $scope.spots[$scope.spot.id] = $scope.spot;
      Spots.save($scope.spots);

      // Go back one view in history
      var backView = $ionicViewService.getBackView();
      backView.go();
    };
  });