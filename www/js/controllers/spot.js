angular.module('app')

  .controller('SpotCtrl', function($scope, $stateParams, $location, Spots, NewSpot, $ionicViewService, $cordovaGeolocation) {
  
    // Load or initialize Spot
    $scope.spots = Spots.all();

    // Initialize new Spot
    if (NewSpot.getNewSpot()) {
      $scope.spot = NewSpot.getNewSpot();
      NewSpot.clearNewSpot();
    }
    // Load current Spot
    else
      $scope.spot = $scope.spots[$stateParams.spotId];  

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

      if (typeof $scope.spot.properties.id == "undefined")
        $scope.spot.properties.id = $scope.spots.length;

      $scope.spots[$scope.spot.properties.id] = $scope.spot;
      Spots.save($scope.spots);

      // Go back one view in history
      var backView = $ionicViewService.getBackView();
      backView.go();
    };
  });