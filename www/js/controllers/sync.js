angular.module('app')

  .controller("SyncCtrl", function(
    $scope,
    $ionicPopup,
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
      showUploadDone: false,
      showDownloadDone: false,
      current: null,
      total: null
    };

    $scope.hideActionButtons = {
      login: false,
      logout: true
    };

    var hideLoginButton = function() {
      $scope.hideActionButtons.login = true;
      $scope.hideActionButtons.logout = false;
    };

    var hideLogoutButton = function() {
      $scope.hideActionButtons.login = false;
      $scope.hideActionButtons.logout = true;
    };

    $scope.showDatasetOpts = function() {
      return navigator.onLine && $scope.encodedLogin;
    };

    // is the user logged in from before?
    LoginFactory.getLogin()
      .then(function(login) {
        if (login !== null) {
          // we do have a login -- lets set the authentication
          console.log("we have a login!", login);

          // Encode the login string
          $scope.encodedLogin = Base64.encode(login.email + ":" + login.password);

          // set the email to the login email
          $scope.loginData.email = login.email;

          $scope.$apply(function(){
            hideLoginButton();
          });

          console.log($scope.hideActionButtons);

          $scope.getDatasets();

        } else {
          // nope, dont have a login
          console.log("no login!");

          $scope.$apply(function() {
            hideLogoutButton();
          });
        }
      });

    // Perform the login action when the user presses the login icon
    $scope.doLogin = function() {
      // Authenticate user login
      if (navigator.onLine) {
        SyncService.authenticateUser($scope.loginData)
          .then(function(response) {
            if (response.status === 200 && response.data.valid == "true") {
              console.log("Logged in successfully.");
              hideLoginButton();
              LoginFactory.setLogin($scope.loginData)
                .then(function(login) {
                  // Encode the login string
                  $scope.encodedLogin = Base64.encode($scope.loginData.email + ":" + $scope.loginData.password);
                  // Get the list of datasets for this user
                  $scope.getDatasets($scope.encodedLogin);
                });
            } else {
              $ionicPopup.alert({
                title: 'Login Failure!',
                template: 'Incorrect username or password.'
              });
            }
          },
          function(errorMessage) {
            $ionicPopup.alert({
              title: 'Alert!',
              template: errorMessage
            });
          }
        );
      } else
        $ionicPopup.alert({
          title: 'Offline!',
          template: 'Can\'t login while offline.'
        });
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

    // Get all of the datasets for a user
    $scope.getDatasets = function() {
      SyncService.getDatasets($scope.encodedLogin)
        .then(function(response) {
          if (response.data) {
            $scope.datasets = response.data.datasets;
            if ($scope.datasets.length > 0)
              $scope.dataset = $scope.datasets[0];
          }
          else
            $scope.datasets = null;
        }
      );
    };

    // Create a new dataset
    $scope.createDataset = function() {
      SyncService.createDataset({"name": this.dataset_name}, $scope.encodedLogin)
        .then(function(response) {
          $scope.dataset_name = "";
          $scope.getDatasets();
        }
      );
    };

    // Delete a dataset
    $scope.deleteDataset = function() {
      SyncService.deleteDataset(this.dataset.self, $scope.encodedLogin)
        .then(function(response) {
          console.log("deleted: ", response);
          $scope.getDatasets();
        }
      );
    };

    // Upload all spots to a dataset
    $scope.addDatasetSpots = function() {

      // Get the dataset id
      var url_parts = this.dataset.self.split("/");
      var dataset_id = url_parts.pop();

      var deleteAllDatasetSpots = function() {
        return SyncService.deleteAllDatasetSpots(dataset_id, $scope.encodedLogin);
      };

      var getAllLocalSpots = function() {
        return SpotsFactory.all();
      };

      var updateDataset = function(id) {
        console.log(id);
      };

      var uploadSpots = function(spots) {
        if (!spots)
          return;

        var spotsCount = spots.length;
        console.log("Spots to upload:", spotsCount, spots);

        var i = 1;

        $scope.progress.total = spotsCount;
        $scope.progress.current = i;

        if (spotsCount > 0)
          $scope.progress.showProgress = true;

        spots.forEach(function (spot) {
          if (spot.properties.self) {
            // Try to update the spot first
            console.log("Attempting to update the spot: ", spot);
            SyncService.updateFeature(spot, $scope.encodedLogin).then(function (response) {
              console.log("Update Feature server response: ", response);
              if (response.status === 201) {
                console.log("Updated spot ", i, "/", spotsCount);

                // Add spot to dataset
                SyncService.addSpotToDataset(spot.properties.id, dataset_id, $scope.encodedLogin).then(function(response) {
                  if (response.status === 201) {
                    console.log("Spot", spot, "added to Dataset", dataset_id, "Server response:", response);
                  }
                  else
                    console.log("Error adding spot", spot, "added to Dataset", dataset_id, "Server response:", response);
                });

                // Update the progress
                $scope.progress.current = i;
                if (i == spotsCount) {
                  $scope.progress.showProgress = false;
                  $scope.progress.showUploadDone = true;
                }
                i++;
              }
              else {
                // Maybe this is a new spot, try to create the spot
                delete spot.properties.self;
                console.log("Unable to update spot ", i, "/", spotsCount, " - Maybe this is a new spot.");
                console.log("Attempting to create the spot: ", spot);
                SyncService.createFeature(spot, $scope.encodedLogin).then(function (response) {
                  console.log("Create Feature server response: ", response);
                  if (response.status === 201) {
                    spot.properties.self = response.data.properties.self;
                    SpotsFactory.save(spot);
                    console.log("Created spot ", i, "/", spotsCount);

                    // Add spot to dataset
                    SyncService.addSpotToDataset(spot.properties.id, dataset_id, $scope.encodedLogin).then(function(response) {
                      if (response.status === 201) {
                        console.log("Spot", spot, "added to Dataset", dataset_id, "Server response:", response);
                      }
                      else
                        console.log("Error adding spot", spot, "to Dataset", dataset_id, "Server response:", response);
                    });
                  }
                  else
                    throw new Error("Unable to create spot " + i + "/" + spotsCount);

                  // Update the progress
                  $scope.progress.current = i;
                  if (i == spotsCount) {
                    $scope.progress.showProgress = false;
                    $scope.progress.showUploadDone = true;
                  }
                  i++;
                });
              }
            });
          }
          else {
            console.log("Attempting to create the spot: ", spot);
            SyncService.createFeature(spot, $scope.encodedLogin).then(function (response) {
              console.log("Create Feature server response: ", response);
              if (response.status === 201) {
                spot.properties.self = response.data.properties.self;
                SpotsFactory.save(spot);
                console.log("Created spot ", i, "/", spotsCount);

                // Add spot to dataset
                SyncService.addSpotToDataset(spot.properties.id, dataset_id, $scope.encodedLogin).then(function(response) {
                  if (response.status === 201) {
                    console.log("Spot", spot, "added to Dataset", dataset_id, "Server response:", response);
                  }
                  else
                    console.log("Error adding spot", spot, "to Dataset", dataset_id, "Server response:", response);
                });
            }
              else
                throw new Error("Unable to create spot " + i + "/" + spotsCount);

              // Update the progress
              $scope.progress.current = i;
              if (i == spotsCount) {
                $scope.progress.showProgress = false;
                $scope.progress.showUploadDone = true;
              }
              i++;
            });
          }
        });
      };

      var reportProblems = function(fault) {
        console.log(fault);
      };

      deleteAllDatasetSpots()
        .then(getAllLocalSpots)
        .then(uploadSpots)
        .catch(reportProblems);
    };

    // Download all spots from a dataset
    $scope.getDatasetSpots = function() {
      // Get the dataset id
      var url_parts = this.dataset.self.split("/");
      var dataset_id = url_parts.pop();
      SyncService.getDatasetSpots(dataset_id, $scope.encodedLogin)
        .then(function(response) {
          console.log(response);
          if (response.data !== null) {
            $scope.progress.showDownloadDone = true;
            console.log("Downloaded", response.data);
            response.data.features.forEach(function(spot) {
              SpotsFactory.save(spot);
            });
          } else
            $ionicPopup.alert({
              title: 'Empty Dataset!',
              template: 'There are no spots in this dataset.'
            });
        },
        function(errorMessage) {
          console.warn(errorMessage);
        }
      );
    };

    // Delete ALL spots for a user on the server
    $scope.deleteSpots = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Spots',
        template: 'Are you sure you want to delete <b>ALL</b> spots for this user from ther server?'
      });
      confirmPopup.then(function(res) {
        if (res) {
          SyncService.deleteSpots($scope.encodedLogin).then(function (response) {
            console.log("ALL spots deleted. Server response: ", response);
          });
        }
      });
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
