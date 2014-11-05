angular.module('app')

  .controller('SpotCtrl', function($scope, $stateParams, $location, $filter, Spots, NewSpot, $ionicViewService, $cordovaGeolocation) {
  
    // Load or initialize Spot
    $scope.spots = Spots.all();
    
    // Load or initialize current Spot
    $scope.spot = Spots.getSpot($scope.spots, $stateParams.spotId, $filter);

    if (NewSpot.getNewLocation())
      $scope.spot = NewSpot.getNewLocation();
      //$scope.spot.geojson = JSON.stringify(NewSpot.getNewLocation().geojson);

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
      if(!$scope.spot.properties.name) {
        alert('Name required');
        return;
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