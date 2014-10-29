angular.module('app')

  .controller('SpotCtrl', function($scope, $stateParams, $location, $filter, Spots, $ionicViewService) {
    // Load or initialize Spot
    $scope.spots = Spots.all();
    
    // Load or initialize current Spot
    $scope.spot = Spots.getSpot($scope.spots, $stateParams.spotId, $filter);
    
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

      if (typeof $scope.spot.id == "undefined")
        $scope.spot.id = $scope.spots.length;

      $scope.spots[$scope.spot.id] = $scope.spot;
      Spots.save($scope.spots);

      // Go back one view in history
      var backView = $ionicViewService.getBackView();
      backView.go();
    };
  });