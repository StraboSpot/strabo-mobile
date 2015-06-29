angular.module('app')

  .controller("SyncModalCtrl", function(
    $scope,
    $ionicPopup,
    SpotsFactory,
    SyncService,
    LoginFactory) {

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

    $scope.showDatasetOpts = function() {
      return navigator.onLine && $scope.encodedLogin;
    };

    $scope.startDatasetOp = function(){
      switch($scope.operation){
        case "download":
          $scope.getDatasetSpots();
          break;
        case "upload":
          $scope.addDatasetSpots();
          break;
        case "remove":
          $scope.deleteDataset();
          break;
        case "deleteAll":
          $scope.deleteSpots();
          break;
      }
      $scope.operation = null;
      $scope.progress.showUploadDone = false;
      $scope.progress.showDownloadDone = false;
    };

    // is the user logged in from before?
    LoginFactory.getLogin()
      .then(function(login) {
        if (login !== null) {
          // we do have a login -- lets set the authentication
          console.log("we have a login!", login);
          $scope.loggedIn = true;
          // Encode the login string
          $scope.encodedLogin = Base64.encode(login.email + ":" + login.password);

          // set the email to the login email
          $scope.loginEmail = login.email;

          $scope.getDatasets();

        } else {
          // nope, dont have a login
          console.log("no login!");
          $scope.loggedIn = false;
        }
      });

    // Get all of the datasets for a user
    $scope.getDatasets = function() {
      if ($scope.encodedLogin) {
        SyncService.getDatasets($scope.encodedLogin)
          .then(function(response) {
            $scope.datasets = [];
            $scope.datasets.push({"name": "-- new dataset --"});
            // Append response data to the beginning of array of datasets
            if (response.data)
              $scope.datasets = _.union(response.data.datasets, $scope.datasets);
            // Show second to last select option if more options than -- new dataset --
            if ($scope.datasets.length > 1)
              $scope.dataset = $scope.datasets[$scope.datasets.length - 2];
            else
              $scope.dataset = $scope.datasets[$scope.datasets.length - 1];
          }
        );
      }
    };

    // Create a new dataset
    $scope.createDataset = function() {
      SyncService.createDataset({"name": this.dataset_name}, $scope.encodedLogin)
        .then(function(response) {
          $scope.operation = null;
          $scope.dataset_name = "";
          $scope.dataset = null;
          $scope.getDatasets();
        }
      );
    };

    // Delete a dataset
    $scope.deleteDataset = function() {
      SyncService.deleteDataset(this.dataset.self, $scope.encodedLogin)
        .then(function(response) {
          console.log("deleted: ", response);
          $scope.dataset = null;
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

      var uploadImages = function (spot) {
        if (spot.images) {
          _.each(spot.images, function (image) {
            SyncService.uploadImage(spot.properties.id, image.src, $scope.encodedLogin).then(function(response) {
              if (response.status === 201)
                console.log("Image uploaded for", spot, "Server response:", response);
              else
                console.log("Error uploading image for", spot, "Server response:", response);
            });
          });
        }
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
                uploadImages(spot);

                // Add spot to dataset
                SyncService.addSpotToDataset(spot.properties.id, dataset_id, $scope.encodedLogin).then(function(response) {
                  if (response.status === 201)
                    console.log("Spot", spot, "added to Dataset", dataset_id, "Server response:", response);
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
                    uploadImages(spot);

                    // Add spot to dataset
                    SyncService.addSpotToDataset(spot.properties.id, dataset_id, $scope.encodedLogin).then(function(response) {
                      if (response.status === 201)
                        console.log("Spot", spot, "added to Dataset", dataset_id, "Server response:", response);
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
                uploadImages(spot);

                // Add spot to dataset
                SyncService.addSpotToDataset(spot.properties.id, dataset_id, $scope.encodedLogin).then(function(response) {
                  if (response.status === 201)
                    console.log("Spot", spot, "added to Dataset", dataset_id, "Server response:", response);
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

      var saveSpot = function(spot) {
        if (!_.filter($scope.spots, function(item) {
            return _.findWhere(item, { id: spot.properties.id });
          })[0])
          $scope.spots.push(spot);
        SpotsFactory.save(spot);
      };

      // Get the dataset id
      var url_parts = this.dataset.self.split("/");
      var dataset_id = url_parts.pop();
      SyncService.getDatasetSpots(dataset_id, $scope.encodedLogin).then(function(response) {
        console.log(response);
        if (response.data !== null) {
          $scope.progress.showDownloadDone = true;
          console.log("Downloaded", response.data);
          response.data.features.forEach(function(spot) {
            SyncService.getImages(spot.properties.id, $scope.encodedLogin).then(function(getImagesResponse) {
              if (getImagesResponse.data) {
                getImagesResponse.data.images.forEach(function (image_url) {
                  SyncService.downloadImage(image_url, $scope.encodedLogin).then(function(downloadImageResponse) {
                    if (downloadImageResponse.data) {
                      if (!spot.images)
                        spot.images = [];
                      spot.images.push({
                        src: downloadImageResponse.data
                      });
                    }
                    saveSpot(spot);
                  });
                });
              }
              else
                saveSpot(spot);
            })
          });
        }
        else
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
        template: 'Are you sure you want to delete <b>ALL</b> spots for this user from the server? Spots on your local device will remain on your device.'
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
