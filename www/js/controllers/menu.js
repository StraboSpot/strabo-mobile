angular.module('app')

.controller('MenuCtrl', function(
  $scope,
  $ionicModal,
  $timeout,
  StraboServerFactory,
  LoginFactory) {

  function reqFail(err) {
    $scope.error.message = "There was a failure communicating with the strabo server." +
      "You are likely working in offline mode and cannot reach the server or the server is currently down. " + err;
  }

  // Form data for the login modal
  $scope.loginData = {};

  // error message go here and is displayed to the user
  $scope.error = {};

  // authenticated data (is only populated when the user has successfully logged in)
  $scope.authenticated = {};

  // is the user logged in from before?
  LoginFactory.getLogin()
    .then(function(login) {
      if (login != null) {
        // we dont have a login
        $scope.authenticated.email = login.email;
      }
    });

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

  // login acts as both login and logout
  $scope.login = function() {
    // do we already have a login set?
    LoginFactory.getLogin()
      .then(function(login) {
        if (login == null) {
          // we dont have a login, so lets show the login modal
          $scope.modal.show();
        } else {
          // we do have a login so we should destroy the login because the user wants to logout
          LoginFactory.destroyLogin();
          $scope.loginData = {};
          $scope.authenticated = {};
          alert('you have just logged out');
        }
      });
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    // clear the error message, if any
    delete $scope.error.message;

    function reqSuccess(result) {
      // did the server say it was valid?
      if (result.data.valid === "true") {
        // yes
        LoginFactory.setLogin($scope.loginData)
          .then(function(login) {
            // set the authentication to the user
            $scope.authenticated.email = login.email;
            $scope.closeLogin();
          });
      } else {
        // no
        $scope.error.message = "Bad or improper login.  Please try again.";
        // clear the form variables
        delete $scope.loginData.email;
        delete $scope.loginData.password
      }
    }

    StraboServerFactory
      .authenticate($scope.loginData)
      .then(reqSuccess, reqFail);
  };
});
