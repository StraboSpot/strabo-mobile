angular.module('app')

.controller('SpotsCtrl', function(
  $scope,
  $location,
  $ionicModal,
  SpotsFactory) {

  // Load or initialize Spots
  $scope.spots;

  SpotsFactory.all().then(function(spots) {
    $scope.spots = spots;
  });

  // clears all spots
  $scope.clearAllSpots = function() {
    if (window.confirm("Do you want to delete ALL the spots?")) {
      SpotsFactory.clear(function() {
        alert("all spots have been cleared");
        // update the spots list
        SpotsFactory.all().then(function(spots) {
          $scope.spots = spots;
        });
      });
    }
  };

  // Create a new Spot
  $scope.newSpot = function() {
    $scope.openModal();
  };

  /////////////////
  // MODAL
  /////////////////

  $ionicModal.fromTemplateUrl('templates/modals/allModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.allModal = modal;
  });

  $scope.openModal = function() {
    $scope.allModal.show();
  };

  $scope.closeModal = function() {
    $scope.allModal.hide();
  };

  //Cleanup the modal when we're done with it!
  // Execute action on hide modal
  $scope.$on('allModal.hidden', function() {
    $scope.allModal.remove();
  });
});