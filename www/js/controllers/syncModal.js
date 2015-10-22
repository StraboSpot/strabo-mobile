'use strict';

angular
  .module('app')
  .controller('SyncModalController', function ($scope,
                                               $ionicPopup,
                                               $log,
                                               SpotsFactory,
                                               SyncService,
                                               LoginFactory) {
    // base64 encoded login
    $scope.encodedLogin = null;

    // upload progress
    $scope.progress = {
      'showProgress': false,
      'showUploadDone': false,
      'showDownloadDone': false,
      'current': null,
      'total': null
    };

    $scope.showDatasetOpts = function () {
      return navigator.onLine && $scope.encodedLogin;
    };

    $scope.startDatasetOp = function () {
      switch ($scope.operation) {
        case 'download':
          $scope.getDatasetSpots();
          break;
        case 'upload':
          $scope.addDatasetSpots();
          break;
        case 'remove':
          $scope.deleteDataset();
          break;
        case 'deleteAll':
          $scope.deleteSpots();
          break;
      }
      $scope.operation = null;
      $scope.progress.showUploadDone = false;
      $scope.progress.showDownloadDone = false;
    };

    // is the user logged in from before?
    LoginFactory.getLogin()
      .then(function (login) {
        if (login !== null) {
          // we do have a login -- lets set the authentication
          $log.log('we have a login!', login);
          $scope.loggedIn = true;
          // Encode the login string
          $scope.encodedLogin = Base64.encode(login.email + ':' + login.password);

          // set the email to the login email
          $scope.loginEmail = login.email;

          $scope.getDatasets();
        }
        else {
          // nope, dont have a login
          $log.log('no login!');
          $scope.loggedIn = false;
        }
      });

    $scope.downloadProgress = '';

    // Get all of the datasets for a user
    $scope.getDatasets = function () {
      if ($scope.encodedLogin) {
        SyncService.getDatasets($scope.encodedLogin)
          .then(function (response) {
            $scope.datasets = [];
            $scope.datasets.push({'name': '-- new dataset --'});
            // Append response data to the beginning of array of datasets
            if (response.data) {
              $scope.datasets = _.union(response.data.datasets, $scope.datasets);
            }
            // Show second to last select option if more options than -- new dataset --
            if ($scope.datasets.length > 1) {
              $scope.dataset = $scope.datasets[$scope.datasets.length - 2];
            }
            else {
              $scope.dataset = $scope.datasets[$scope.datasets.length - 1];
            }
          }
        );
      }
    };

    // Create a new dataset
    $scope.createDataset = function () {
      SyncService.createDataset({'name': this.dataset_name}, $scope.encodedLogin)
        .then(function (response) {
          $scope.operation = null;
          $scope.dataset_name = '';
          $scope.dataset = null;
          $scope.getDatasets();
        }
      );
    };

    // Delete a dataset
    $scope.deleteDataset = function () {
      SyncService.deleteDataset(this.dataset.self, $scope.encodedLogin)
        .then(function (response) {
          $log.log('deleted: ', response);
          $scope.dataset = null;
          $scope.getDatasets();
        }
      );
    };

    // Upload all spots to a dataset
    $scope.addDatasetSpots = function () {
      // Get the dataset id
      var url_parts = this.dataset.self.split('/');
      var dataset_id = url_parts.pop();

      var deleteAllDatasetSpots = function () {
        return SyncService.deleteAllDatasetSpots(dataset_id, $scope.encodedLogin);
      };

      var getAllLocalSpots = function () {
        return SpotsFactory.all();
      };

      var uploadImages = function (spot) {
        if (spot.images) {
          _.each(spot.images, function (image) {
            SyncService.uploadImage(spot.properties.id, image, $scope.encodedLogin).then(function (response) {
              if (response.status === 201) {
                $log.log('Image uploaded for', spot, 'Server response:', response);
              }
              else {
                $log.log('Error uploading image for', spot, 'Server response:', response);
              }
            });
          });
        }
      };

      var uploadSpots = function (spots) {
        if (!spots) {
          return;
        }

        var spotsCount = spots.length;
        $log.log('Spots to upload:', spotsCount, spots);

        var i = 1;

        $scope.progress.total = spotsCount;
        $scope.progress.current = i;

        if (spotsCount > 0) {
          $scope.progress.showProgress = true;
        }

        spots.forEach(function (spot) {
          if (spot.properties.self) {
            // Try to update the spot first
            $log.log('Attempting to update the spot: ', spot);
            SyncService.updateFeature(spot, $scope.encodedLogin).then(function (response) {
              $log.log('Update Feature server response: ', response);
              if (response.status === 201) {
                $log.log('Updated spot ', i, '/', spotsCount);
                uploadImages(spot);

                // Add spot to dataset
                SyncService.addSpotToDataset(spot.properties.id, dataset_id,
                  $scope.encodedLogin).then(function (response) {
                    if (response.status === 201) {
                      $log.log('Spot', spot, 'added to Dataset', dataset_id, 'Server response:', response);
                    }
                    else {
                      $log.log('Error adding spot', spot, 'added to Dataset', dataset_id, 'Server response:', response);
                    }
                  });

                // Update the progress
                $scope.progress.current = i;
                if (i === spotsCount) {
                  $scope.progress.showProgress = false;
                  $scope.progress.showUploadDone = true;
                }
                i++;
              }
              else {
                // Maybe this is a new spot, try to create the spot
                delete spot.properties.self;
                $log.log('Unable to update spot ', i, '/', spotsCount, ' - Maybe this is a new spot.');
                $log.log('Attempting to create the spot: ', spot);
                SyncService.createFeature(spot, $scope.encodedLogin).then(function (response) {
                  $log.log('Create Feature server response: ', response);
                  if (response.status === 201) {
                    spot.properties.self = response.data.properties.self;
                    SpotsFactory.save(spot);
                    $log.log('Created spot ', i, '/', spotsCount);
                    uploadImages(spot);

                    // Add spot to dataset
                    SyncService.addSpotToDataset(spot.properties.id, dataset_id,
                      $scope.encodedLogin).then(function (response) {
                        if (response.status === 201) {
                          $log.log('Spot', spot, 'added to Dataset', dataset_id, 'Server response:', response);
                        }
                        else {
                          $log.log('Error adding spot', spot, 'to Dataset', dataset_id, 'Server response:', response);
                        }
                      });
                  }
                  else {
                    throw new Error('Unable to create spot ' + i + '/' + spotsCount);
                  }

                  // Update the progress
                  $scope.progress.current = i;
                  if (i === spotsCount) {
                    $scope.progress.showProgress = false;
                    $scope.progress.showUploadDone = true;
                  }
                  i++;
                });
              }
            });
          }
          else {
            $log.log('Attempting to create the spot: ', spot);
            SyncService.createFeature(spot, $scope.encodedLogin).then(function (response) {
              $log.log('Create Feature server response: ', response);
              if (response.status === 201) {
                spot.properties.self = response.data.properties.self;
                SpotsFactory.save(spot);
                $log.log('Created spot ', i, '/', spotsCount);
                uploadImages(spot);

                // Add spot to dataset
                SyncService.addSpotToDataset(spot.properties.id, dataset_id,
                  $scope.encodedLogin).then(function (response) {
                    if (response.status === 201) {
                      $log.log('Spot', spot, 'added to Dataset', dataset_id, 'Server response:', response);
                    }
                    else {
                      $log.log('Error adding spot', spot, 'to Dataset', dataset_id, 'Server response:', response);
                    }
                  });
              }
              else {
                throw new Error('Unable to create spot ' + i + '/' + spotsCount);
              }

              // Update the progress
              $scope.progress.current = i;
              if (i === spotsCount) {
                $scope.progress.showProgress = false;
                $scope.progress.showUploadDone = true;
              }
              i++;
            });
          }
        });
      };

      var reportProblems = function (fault) {
        $log.log(fault);
      };

      deleteAllDatasetSpots()
        .then(getAllLocalSpots)
        .then(uploadSpots)
        .catch(reportProblems);
    };

    // Download all spots from a dataset
    $scope.getDatasetSpots = function () {
      var saveSpot = function (spot) {
        // If the geometry coordinates contain any null values, delete the geometry; it shouldn't be defined
        if (spot.geometry) {
          if (spot.geometry.coordinates) {
            if (_.indexOf(_.flatten(spot.geometry.coordinates), null) !== -1) {
              delete spot.geometry;
            }
          }
        }
        // Look for any current spots that match the id of the downloaded spot and remove the current spot
        if (!_.filter($scope.spots,
            function (item) {
              return _.findWhere(item, {'id': spot.properties.id});
            })[0]) {
          $scope.spots.push(spot);
        }
        SpotsFactory.save(spot);
      };

      // Get the dataset id
      var url_parts = this.dataset.self.split('/');
      var dataset_id = url_parts.pop();
      SyncService.getDatasetSpots(dataset_id, $scope.encodedLogin)
        .then(function (response) {
          $log.log(response);
          if (response.data !== null) {
            $scope.progress.showDownloadDone = true;
            var currentDownloadedCount = 0;
            response.data.features.forEach(function (spot) {
              SyncService.getImages(spot.properties.id, $scope.encodedLogin).then(function (getImagesResponse) {
                currentDownloadedCount++;
                $scope.downloadProgress = 'downloading ' + currentDownloadedCount + ' of ' + response.data.features.length;
                if (getImagesResponse.status === 200 && getImagesResponse.data) {
                  getImagesResponse.data.images.forEach(function (image) {
                    if (!spot.images) {
                      spot.images = [];
                    }
                    spot.images.push(image);
                    // Set an id if there is not one
                    if (!image.id) {
                      image['id'] = Math.floor((new Date().getTime() + Math.random()) * 10);
                    }
                    // Set the title from the caption
                    image['title'] = image.caption ? image.caption.substring(0,
                      24) : 'Untitled ' + _.indexOf(spot.images, image);
                    SyncService.downloadImage(image.self, $scope.encodedLogin).then(function (downloadImageResponse) {
                      if (downloadImageResponse.status === 200 && downloadImageResponse.data) {
                        var readDataUrl = function (file, callback) {
                          var reader = new FileReader();
                          reader.onloadend = function (evt) {
                            callback(evt.target.result);
                          };
                          reader.readAsDataURL(file);
                        };
                        readDataUrl(downloadImageResponse.data, function (base64Image) {
                          var imageProps = _.findWhere(spot.images, {'self': downloadImageResponse.config.url});
                          imageProps['src'] = base64Image;
                          // Set the image height and width
                          if (!imageProps.height || !imageProps.width) {
                            var im = new Image();
                            im.src = base64Image;
                            imageProps['height'] = im.height;
                            imageProps['width'] = im.width;
                          }
                          saveSpot(spot);
                        });
                      }
                    });
                  });
                }
                else {
                  saveSpot(spot);
                }
              });
            });
          }
          else {
            $ionicPopup.alert({
              'title': 'Empty Dataset!',
              'template': 'There are no spots in this dataset.'
            });
          }
        },
        function (errorMessage) {
          $log.warn(errorMessage);
        }
      );
    };

    // Delete ALL spots for a user on the server
    $scope.deleteSpots = function () {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spots',
        'template': 'Are you sure you want to delete <b>ALL</b> spots for this user from the server? Spots on your local device will remain on your device.'
      });
      confirmPopup.then(function (res) {
        if (res) {
          SyncService.deleteSpots($scope.encodedLogin).then(function (response) {
            $log.log('ALL spots deleted. Server response: ', response);
          });
        }
      });
    };
  });
