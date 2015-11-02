(function () {
  'use strict';

  angular
    .module('app')
    .controller('SyncModalController', SyncModalController);

  SyncModalController.$inject = ['$scope', '$ionicPopup', '$log', 'SpotsFactory', 'SyncService', 'LoginFactory'];

  function SyncModalController($scope, $ionicPopup, $log, SpotsFactory, SyncService, LoginFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    // base64 encoded login
    vm.encodedLogin = null;

    // upload progress
    vm.progress = {
      'showProgress': false,
      'showUploadDone': false,
      'showDownloadDone': false,
      'current': null,
      'total': null
    };

    vm.showDatasetOpts = function () {
      return navigator.onLine && vm.encodedLogin;
    };

    vm.startDatasetOp = function () {
      switch (vm.operation) {
        case 'download':
          vm.getDatasetSpots();
          break;
        case 'upload':
          vm.addDatasetSpots();
          break;
        case 'remove':
          vm.deleteDataset();
          break;
        case 'deleteAll':
          vm.deleteSpots();
          break;
      }
      vm.operation = null;
      vm.progress.showUploadDone = false;
      vm.progress.showDownloadDone = false;
    };

    // is the user logged in from before?
    LoginFactory.getLogin()
      .then(function (login) {
        if (login !== null) {
          // we do have a login -- lets set the authentication
          $log.log('we have a login!', login);
          vm.loggedIn = true;
          // Encode the login string
          vm.encodedLogin = Base64.encode(login.email + ':' + login.password);

          // set the email to the login email
          vm.loginEmail = login.email;

          vm.getDatasets();
        }
        else {
          // nope, dont have a login
          $log.log('no login!');
          vm.loggedIn = false;
        }
      });

    vm.downloadProgress = '';

    // Get all of the datasets for a user
    vm.getDatasets = function () {
      if (vm.encodedLogin) {
        SyncService.getDatasets(vm.encodedLogin)
          .then(function (response) {
            vm.datasets = [];
            vm.datasets.push({'name': '-- new dataset --'});
            // Append response data to the beginning of array of datasets
            if (response.data) {
              vm.datasets = _.union(response.data.datasets, vm.datasets);
            }
            // Show second to last select option if more options than -- new dataset --
            if (vm.datasets.length > 1) {
              vm.dataset = vm.datasets[vm.datasets.length - 2];
            }
            else {
              vm.dataset = vm.datasets[vm.datasets.length - 1];
            }
          }
        );
      }
    };

    // Create a new dataset
    vm.createDataset = function () {
      SyncService.createDataset({'name': vm.dataset_name}, vm.encodedLogin)
        .then(function (response) {
          vm.operation = null;
          vm.dataset_name = '';
          vm.dataset = null;
          vm.getDatasets();
        }
      );
    };

    // Delete a dataset
    vm.deleteDataset = function () {
      SyncService.deleteDataset(vm.dataset.self, vm.encodedLogin)
        .then(function (response) {
          $log.log('deleted: ', response);
          vm.dataset = null;
          vm.getDatasets();
        }
      );
    };

    // Upload all spots to a dataset
    vm.addDatasetSpots = function () {
      // Get the dataset id
      var url_parts = vm.dataset.self.split('/');
      var dataset_id = url_parts.pop();

      var deleteAllDatasetSpots = function () {
        return SyncService.deleteAllDatasetSpots(dataset_id, vm.encodedLogin);
      };

      var getAllLocalSpots = function () {
        return SpotsFactory.all();
      };

      var uploadImages = function (spot) {
        if (spot.images) {
          _.each(spot.images, function (image) {
            SyncService.uploadImage(spot.properties.id, image, vm.encodedLogin).then(function (response) {
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

        vm.progress.total = spotsCount;
        vm.progress.current = i;

        if (spotsCount > 0) {
          vm.progress.showProgress = true;
        }

        spots.forEach(function (spot) {
          if (spot.properties.self) {
            // Try to update the spot first
            $log.log('Attempting to update the spot: ', spot);
            SyncService.updateFeature(spot, vm.encodedLogin).then(function (response) {
              $log.log('Update Feature server response: ', response);
              if (response.status === 201) {
                $log.log('Updated spot ', i, '/', spotsCount);
                uploadImages(spot);

                // Add spot to dataset
                SyncService.addSpotToDataset(spot.properties.id, dataset_id,
                  vm.encodedLogin).then(function (response) {
                    if (response.status === 201) {
                      $log.log('Spot', spot, 'added to Dataset', dataset_id, 'Server response:', response);
                    }
                    else {
                      $log.log('Error adding spot', spot, 'added to Dataset', dataset_id, 'Server response:', response);
                    }
                  });

                // Update the progress
                vm.progress.current = i;
                if (i === spotsCount) {
                  vm.progress.showProgress = false;
                  vm.progress.showUploadDone = true;
                }
                i++;
              }
              else {
                // Maybe this is a new spot, try to create the spot
                delete spot.properties.self;
                $log.log('Unable to update spot ', i, '/', spotsCount, ' - Maybe this is a new spot.');
                $log.log('Attempting to create the spot: ', spot);
                SyncService.createFeature(spot, vm.encodedLogin).then(function (response) {
                  $log.log('Create Feature server response: ', response);
                  if (response.status === 201) {
                    spot.properties.self = response.data.properties.self;
                    SpotsFactory.save(spot);
                    $log.log('Created spot ', i, '/', spotsCount);
                    uploadImages(spot);

                    // Add spot to dataset
                    SyncService.addSpotToDataset(spot.properties.id, dataset_id,
                      vm.encodedLogin).then(function (response) {
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
                  vm.progress.current = i;
                  if (i === spotsCount) {
                    vm.progress.showProgress = false;
                    vm.progress.showUploadDone = true;
                  }
                  i++;
                });
              }
            });
          }
          else {
            $log.log('Attempting to create the spot: ', spot);
            SyncService.createFeature(spot, vm.encodedLogin).then(function (response) {
              $log.log('Create Feature server response: ', response);
              if (response.status === 201) {
                spot.properties.self = response.data.properties.self;
                SpotsFactory.save(spot);
                $log.log('Created spot ', i, '/', spotsCount);
                uploadImages(spot);

                // Add spot to dataset
                SyncService.addSpotToDataset(spot.properties.id, dataset_id,
                  vm.encodedLogin).then(function (response) {
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
              vm.progress.current = i;
              if (i === spotsCount) {
                vm.progress.showProgress = false;
                vm.progress.showUploadDone = true;
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
    vm.getDatasetSpots = function () {
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
        if (!_.filter(vmParent.spots,
            function (item) {
              return _.findWhere(item, {'id': spot.properties.id});
            })[0]) {
          vmParent.spots.push(spot);
        }
        SpotsFactory.save(spot);
      };

      // Get the dataset id
      var url_parts = vm.dataset.self.split('/');
      var dataset_id = url_parts.pop();
      SyncService.getDatasetSpots(dataset_id, vm.encodedLogin)
        .then(function (response) {
          $log.log(response);
          if (response.data !== null) {
            vm.progress.showDownloadDone = true;
            var currentDownloadedCount = 0;
            response.data.features.forEach(function (spot) {
              SyncService.getImages(spot.properties.id, vm.encodedLogin).then(function (getImagesResponse) {
                currentDownloadedCount++;
                vm.downloadProgress = 'downloading ' + currentDownloadedCount + ' of ' + response.data.features.length;
                if (getImagesResponse.status === 200 && getImagesResponse.data) {
                  getImagesResponse.data.images.forEach(function (image) {
                    if (!spot.images) {
                      spot.images = [];
                    }
                    spot.images.push(image);
                    // Set an id if there is not one
                    if (!image.id) {
                      image.id = Math.floor((new Date().getTime() + Math.random()) * 10);
                    }
                    // Set the title from the caption
                    image.title = image.caption ? image.caption.substring(0,
                      24) : 'Untitled ' + _.indexOf(spot.images, image);
                    SyncService.downloadImage(image.self, vm.encodedLogin).then(function (downloadImageResponse) {
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
                          imageProps.src = base64Image;
                          // Set the image height and width
                          if (!imageProps.height || !imageProps.width) {
                            var im = new Image();
                            im.src = base64Image;
                            imageProps.height = im.height;
                            imageProps.width = im.width;
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
    vm.deleteSpots = function () {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spots',
        'template': 'Are you sure you want to delete <b>ALL</b> spots for this user from the server? Spots on your local device will remain on your device.'
      });
      confirmPopup.then(function (res) {
        if (res) {
          SyncService.deleteSpots(vm.encodedLogin).then(function (response) {
            $log.log('ALL spots deleted. Server response: ', response);
          });
        }
      });
    };
  }
}());
