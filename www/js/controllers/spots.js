angular.module('app')

.controller('SpotsCtrl', function(
  $scope,
  $location,
  $ionicModal,
  $ionicPopup,
  SpotsFactory) {

  // Load or initialize Spots
  $scope.spots;

  SpotsFactory.all().then(function(spots) {
    $scope.spots = spots;
  });

  // clears all spots
  $scope.clearAllSpots = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Spots',
      template: 'Are you sure you want to delete <b>ALL</b> spots?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        SpotsFactory.clear(function () {
          // update the spots list
          SpotsFactory.all().then(function (spots) {
            $scope.spots = spots;
          });
        });
      }
    });
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