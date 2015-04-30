angular.module('app')

  .controller("SyncCtrl", function(
    $scope,
    SpotsFactory,
    SyncService,
    LoginFactory) {

    // Form data for the login modal
    $scope.loginData = { };

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

    $scope.showProjectOpts = function() {
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

          $scope.getProjects();

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
                  // Get the list of projects for this user
                  $scope.getProjects($scope.encodedLogin);
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

    // Get all of the projects for a user
    $scope.getProjects = function() {
      SyncService.getProjects($scope.encodedLogin)
        .then(function(response) {
          $scope.projects = response.data.projects;
        }
      );
    };

    // Create a new project
    $scope.createProject = function() {
      SyncService.createProject({"name": this.project_name}, $scope.encodedLogin)
        .then(function(response) {
          $scope.getProjects();
        }
      );
    };

    // Delete a project
    $scope.deleteProject = function() {
      SyncService.deleteProject(this.project.self, $scope.encodedLogin)
        .then(function(response) {
          console.log("deleted: ", response);
          $scope.getProjects();
        }
      );
    };

    // Upload all spots to a project
    $scope.addProjectSpots = function() {
      // Get the project id
      var url_parts = this.project.self.split("/");
      var project_id = url_parts.pop();

      // Delete all spots already in this project on server
      var deleteProjectSpots = function() {
        return SyncService.deleteProjectSpots(project_id, $scope.encodedLogin);
      };

      var getAllLocalSpots = function(response) {
        // console.log("getAllLocalSpots", response);
        if (response.status === 204) {
          return SpotsFactory.all();
        }
        throw new Error("bad http status code");
      };

      var uploadProjectSpots = function(spots) {
        var spotsCount = spots.length;
        console.log("Spots to upload:", spotsCount, spots);

        var currentSpotIndex = 1;

        $scope.progress.total = spotsCount;
        $scope.progress.current = currentSpotIndex;

        if (spotsCount > 0) {
          $scope.progress.showProgress = true;
        }

        var changedIds = [];

        spots.forEach(function(spot) {
          // Assign a temporary Id to each spot
          //spot.properties.tempId = spot.properties.id;
          var oldId = spot.properties.id;

          // upload the spot to the server
          SyncService.addProjectSpot(spot, project_id, $scope.encodedLogin)
            // then delete our local spot data
            .then(function(response) {
              console.log("Uploaded spot. Server response:", response);
              if (response.status === 201) {
                newId = response.data.properties.id;
                if (oldId != newId)
                  changedIds.push({"oldId": oldId, "newId": newId});
                SpotsFactory.destroy(oldId);
                return response.data;
              } else {
                throw new Error("server could not create the feature");
              }
            })
            // then save the response from the server as a new spot
            .then(function(spot) {
              //delete spot.properties.tempId;
              return SpotsFactory.save(spot);
            })
            // cleanup and notification
            .then(function(spot) {
              console.log("Created new spot", spot);
            },
            null,
            // notification
            function() {
              $scope.progress.current = currentSpotIndex;
              console.log("Spot ", currentSpotIndex, "/", spotsCount, " uploaded");
              if (currentSpotIndex == spotsCount) {
                $scope.progress.showProgress = false;
                $scope.progress.showUploadDone = true;
                fixIds(changedIds);
              }
              // increment the spot we just saved
              currentSpotIndex++;
            });
        });
      };

      // Update the ids for all the links, groups and group members
      var fixIds = function(changedIds) {
        SpotsFactory.all().then(function (spots) {
          console.log(changedIds);
          spots.forEach(function (obj, i) {
            if (obj.properties.links) {
              console.log("fix link ids")
            }
            if (obj.properties.groups) {
              console.log("fix group ids")
            }
            if (obj.properties.group_members) {
              console.log("fix group memeber ids")
            }
          });
        });
      };

      var reportProblems = function(fault) {
        console.log(fault);
      };

      deleteProjectSpots()
        .then(getAllLocalSpots)
        .then(uploadProjectSpots)
        .catch(reportProblems);
    };

    // Download all spots from a project
    $scope.getProjectSpots = function() {
      // Get the project id
      var url_parts = this.project.self.split("/");
      var project_id = url_parts.pop();
      SyncService.getProjectSpots(project_id, $scope.encodedLogin)
        .then(function(response) {
          console.log(response);
          if (response.data !== null) {
            $scope.progress.showDownloadDone = true;
            console.log("Downloaded", response.data);
            response.data.features.forEach(function(spot) {
              SpotsFactory.save(spot);
            });
          } else
            alert("No spots linked to this account to download.");
        },
        function(errorMessage) {
          console.warn(errorMessage);
        }
      );
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
