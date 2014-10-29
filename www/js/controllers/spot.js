angular.module('app')

  .controller('SpotCtrl', function($scope, $stateParams, $location, $filter, Spots, NewSpot, $ionicViewService) {
  
    // Load or initialize Spot
    $scope.spots = Spots.all();
    
    // Load or initialize current Spot
    $scope.spot = Spots.getSpot($scope.spots, $stateParams.spotId, $filter);
    if (!$scope.spot.lat)
      $scope.spot.lat = NewSpot.getNewLocation().newSpotLat;
    if (!$scope.spot.lng)
      $scope.spot.lng = NewSpot.getNewLocation().newSpotLng;
    NewSpot.clearNewLocation();
    
    // Define Spot parameters
    $scope.spotTypes = [
        { text: 'Type a', value: 'a' },
        { text: 'Type b', value: 'b' },
        { text: 'Type c', value: 'c' }
      ];
    
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