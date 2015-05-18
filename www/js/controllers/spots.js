angular.module('app')
  .controller('SpotsCtrl', function(
    $scope,
    $location,
    $ionicModal,
    $ionicPopup,
    SpotsFactory,
    LoginFactory,
    SyncService) {

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

    // Is the user logged in
    LoginFactory.getLogin()
      .then(function(login) {
        if (login !== null)
          $scope.loggedIn = true;
      });

    // Is the user online and logged in
    $scope.isOnlineLoggedIn = function() {
      return navigator.onLine && $scope.loggedIn;
    };

    // Create a new Spot
    $scope.newSpot = function() {
      $scope.openModal('allModal');
    };

    $scope.sync = function() {
      if (navigator.onLine && $scope.loggedIn)
        $scope.openModal('syncModal');
      else{
        if (!navigator.onLine && !$scope.loggedIn)
          $ionicPopup.alert({
            title: 'Get Online and Log In!',
            template: 'You must be online and logged in to sync with the Strabo database.'
          });
        else if (!navigator.onLine)
          $ionicPopup.alert({
            title: 'Not Online!',
            template: 'You must be online to sync with the Strabo database.'
          });
        else
          $ionicPopup.alert({
          title: 'Not Logged In!',
          template: 'You must be logged in to sync with the Strabo database. Log in on the Settings page.'
        });
      }
    };

    /////////////////
    // MODALS
    /////////////////

    $ionicModal.fromTemplateUrl('templates/modals/syncModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.syncModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/allModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.allModal = modal;
    });

    $scope.openModal = function(modal) {
      $scope[modal].show();
    };

    $scope.closeModal = function(modal) {
      $scope[modal].hide();
    };

    //Cleanup the modal when we're done with it!
    // Execute action on hide modal
    $scope.$on('allModal.hidden', function() {
      $scope.allModal.remove();
    });
    $scope.$on('syncModal.hidden', function() {
      $scope.syncModal.remove();
    });
});