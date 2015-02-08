angular.module('app')

.controller("SyncCtrl", function(
  $scope,
  SpotsFactory,
  SyncService,
  LoginFactory) {

  // Form data for the login modal
  $scope.loginData = {};

  // base64 encoded login
  $scope.encodedLogin = null;

  // upload progress
  $scope.progress = {
    showProgress: false,
    current: null,
    total: null
  };

  $scope.hideActionButtons = {
    login: true,
    logout: true
  };

  var hideLoginButton = function() {
    $scope.hideActionButtons = {
      login: true,
      logout: false
    };
  };

  var hideLogoutButton = function() {
    $scope.hideActionButtons = {
      login: false,
      logout: true
    };
  };

  // is the user logged in from before?
  LoginFactory.getLogin()
    .then(function(login) {
      if (login !== null) {
        // we do have a login -- lets set the authentication
        console.log("we have a login!");

        // Encode the login string
        $scope.encodedLogin = Base64.encode(login.email + ":" + login.password);

        // set the email to the login email
        $scope.loginData.email = login.email;
        hideLoginButton();
      } else {
        // nope, dont have a login
        console.log("no login!");
        hideLogoutButton();
      }
    });


  // Perform the login action when the user presses the login icon
  $scope.doLogin = function() {
    // Authenticate user login
    if (navigator.onLine) {
      SyncService.authenticateUser($scope.loginData)
        .then(
          function(response) {
            if (response.status === 200 && response.data.valid == "true") {
              console.log("Logged in successfully.");
              hideLoginButton();
              LoginFactory.setLogin($scope.loginData)
                .then(function(login) {
                  // Encode the login string
                  $scope.encodedLogin = Base64.encode($scope.loginData.email + ":" + $scope.loginData.password);
                });
            } else {
              alert("Login failure. Incorrect username or password.");
            }
          },
          function(errorMessage) {
            alert(errorMessage);
          }
        );
    } else
      alert("Can't login while offline.");
  };

  // Perform the logout action when the user presses the logout icon
  $scope.doLogout = function() {
    console.log('Logged out');
    // we do have a login so we should destroy the login because the user wants to logout
    LoginFactory.destroyLogin();
    $scope.encodedLogin = null;
    $scope.loginData = {
      email: null,
      password: null
    };
    hideLogoutButton();
  };

  // Download Spots from database if in Internet mode
  $scope.downloadSpots = function() {
    if (navigator.onLine) {
      if ($scope.encodedLogin) {
        SyncService.downloadSpots($scope.encodedLogin)
          .then(
            function(response) {
              console.log(response);
              if (response.data !== null) {
                alert("finished downloading from server");
                console.log("Downloaded", response.data);
                response.data.features.forEach(function(spot) {
                  // save the spot -- if the id is defined, we overwrite existing id; otherwise create new id/spot
                  SpotsFactory.save(spot, spot.properties.id);
                });
              } else
                alert("No spots linked to this account to download.");
            },
            function(errorMessage) {
              console.warn(errorMessage);
            }
          );
      } else
        alert("You must log in first.");
    } else
      alert("Spots can't be downloaded while offline.");
  };

  // Upload Spots to database if in Internet mode
  $scope.uploadSpots = function() {
    if (navigator.onLine) {
      if ($scope.encodedLogin) {

        var deleteFeaturesFromServer = function() {
          return SyncService.deleteMyFeatures($scope.encodedLogin);
        };

        var getAllLocalSpots = function(response) {
          // console.log("getAllLocalSpots", response);
          if (response.status === 204) {
            return SpotsFactory.all();
          }
          throw new Error("bad http status code");
        };

        var uploadAllSpots = function(spots) {
          var spotsCount = spots.length;
          console.log("spots", spots);

          var currentSpotIndex = 1;

          $scope.progress.total = spotsCount;
          $scope.progress.current = currentSpotIndex;

          if (spotsCount > 0) {
            $scope.progress.showProgress = true;
          }

          spots.forEach(function(spot) {
            // Assign a temporary Id to each spot
            spot.properties.tempId = spot.properties.id;

            // upload the spot to the server
            SyncService.createFeature(spot, $scope.encodedLogin)
              // then delete our local spot data
              .then(function(response) {
                console.log(response);
                if (response.status === 201) {
                  return SpotsFactory.destroy(spot.properties.tempId);
                } else {
                  throw new Error("server could not create the feature");
                }
              })
              // then save the response from the server as a new spot
              .then(function() {
                delete spot.properties.tempId;
                return SpotsFactory.save(spot, spot.properties.id);
              })
              // cleanup and notification
              .then(function(spot) {
                  console.log("Created new spot", spot);
                },
                null,
                // notification
                function() {
                  $scope.progress.current = currentSpotIndex;
                  console.log(currentSpotIndex, " ", spotsCount);
                  if (currentSpotIndex == spotsCount) {
                    $scope.progress.showProgress = false;
                    alert("finished uploading to server");
                  }
                  // increment the spot we just saved
                  currentSpotIndex++;
                });
          }); //spots.forEach
        };

        var reportProblems = function(fault) {
          console.log(fault);
        };

        deleteFeaturesFromServer()
          .then(getAllLocalSpots)
          .then(uploadAllSpots)
          .catch(reportProblems);

        //
        // SpotsFactory.getSpotCount().then(function(count) {
        //   if (count == 0) {
        //     var response = confirm("No local spots. Deleting all your spots in the online server/database.", "Warning!");
        //     if (response == true) {
        //       // Delete all spots associated with a login
        //       SyncService.deleteMyFeatures($scope.encodedLogin);
        //       SpotsFactory.all().then(function(spots) {
        //         spots.forEach(function(spot, index) {
        //           try {
        //             // Assign a temporary Id to each spot
        //             spot.properties.tempId = spot.properties.id;
        //             SyncService.createFeature(spot, $scope.encodedLogin)
        //               .then(
        //                 function(spot) {
        //                   // Delete the local spot
        //                   SpotsFactory.destroy(spot.properties.tempId);
        //                   // Delete the temporary Id
        //                   if (spot.properties.tempId)
        //                     delete spot.properties.tempId;
        //                   // Save the response from the server as a new spot
        //                   SpotsFactory.save(spot, spot.properties.id);
        //                   console.log("Created new spot", spot);
        //                 }
        //               );
        //           } catch (err) {
        //             console.log("Upload Error");
        //           }
        //         });
        //       });
        //     }
        //   } //(count == 0)
        // });
        //
        //

        // var qq = function(count) {
        //   if (count === 0)
        // };

        // SpotsFactory.getSpotCount()
        //   .then(doSomething)

        // if (!SpotsFactory.getSpotCount() || SpotsFactory.getSpotCount() == 0)

      } else
        alert("You must log in first.");
    } else
      alert("Spots can't be uploaded while offline.");
  };

  // Create Base64 Object
  var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(e) {
      var t = "";
      var n, r, i, s, o, u, a;
      var f = 0;
      e = Base64._utf8_encode(e);
      while (f < e.length) {
        n = e.charCodeAt(f++);
        r = e.charCodeAt(f++);
        i = e.charCodeAt(f++);
        s = n >> 2;
        o = (n & 3) << 4 | r >> 4;
        u = (r & 15) << 2 | i >> 6;
        a = i & 63;
        if (isNaN(r)) {
          u = a = 64
        } else if (isNaN(i)) {
          a = 64
        }
        t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
      }
      return t
    },
    decode: function(e) {
      var t = "";
      var n, r, i;
      var s, o, u, a;
      var f = 0;
      e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (f < e.length) {
        s = this._keyStr.indexOf(e.charAt(f++));
        o = this._keyStr.indexOf(e.charAt(f++));
        u = this._keyStr.indexOf(e.charAt(f++));
        a = this._keyStr.indexOf(e.charAt(f++));
        n = s << 2 | o >> 4;
        r = (o & 15) << 4 | u >> 2;
        i = (u & 3) << 6 | a;
        t = t + String.fromCharCode(n);
        if (u != 64) {
          t = t + String.fromCharCode(r)
        }
        if (a != 64) {
          t = t + String.fromCharCode(i)
        }
      }
      t = Base64._utf8_decode(t);
      return t
    },
    _utf8_encode: function(e) {
      e = e.replace(/\r\n/g, "\n");
      var t = "";
      for (var n = 0; n < e.length; n++) {
        var r = e.charCodeAt(n);
        if (r < 128) {
          t += String.fromCharCode(r)
        } else if (r > 127 && r < 2048) {
          t += String.fromCharCode(r >> 6 | 192);
          t += String.fromCharCode(r & 63 | 128)
        } else {
          t += String.fromCharCode(r >> 12 | 224);
          t += String.fromCharCode(r >> 6 & 63 | 128);
          t += String.fromCharCode(r & 63 | 128)
        }
      }
      return t
    },
    _utf8_decode: function(e) {
      var t = "";
      var n = 0;
      var r = c1 = c2 = 0;
      while (n < e.length) {
        r = e.charCodeAt(n);
        if (r < 128) {
          t += String.fromCharCode(r);
          n++
        } else if (r > 191 && r < 224) {
          c2 = e.charCodeAt(n + 1);
          t += String.fromCharCode((r & 31) << 6 | c2 & 63);
          n += 2
        } else {
          c2 = e.charCodeAt(n + 1);
          c3 = e.charCodeAt(n + 2);
          t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
          n += 3
        }
      }
      return t
    }
  }
});
