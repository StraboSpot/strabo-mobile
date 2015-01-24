angular.module('app')

  .controller('MenuCtrl', function(
    $scope,
    $ionicModal,
    $timeout,
    LoginFactory) {
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      // do we already have a login set?
      if(LoginFactory.getLogin()) {
        // yes, then we should destroy the session because the user wants to log out
        LoginFactory.destroyLogin();
        $scope.loginData = {};
        alert('you have just logged out');
      } else {
        // no -- we dont already have a login set
        $scope.modal.show();
      }

    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      LoginFactory.setLogin($scope.loginData);

      $scope.closeLogin();


    };
  });
