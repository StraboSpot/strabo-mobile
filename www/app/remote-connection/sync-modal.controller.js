(function () {
  'use strict';

  angular
    .module('app')
    .controller('SyncModalController', SyncModalController);

  SyncModalController.$inject = ['$ionicPopup', '$log', '$scope', '$q', 'SpotFactory', 'RemoteServerFactory', 'UserFactory'];

  function SyncModalController($ionicPopup, $log, $scope, $q, SpotFactory, RemoteServerFactory, UserFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    vm.addDatasetSpots = addDatasetSpots;
    vm.closeModal = closeModal;
    vm.createDataset = createDataset;
    vm.deleteDataset = deleteDataset;
    vm.deleteSpots = deleteSpots;
    vm.encodedLogin = null;           // base64 encoded login
    vm.getDatasets = getDatasets;
    vm.getDatasetSpots = getDatasetSpots;
    vm.loginEmail = null;
    vm.progress = {                   // upload progress
      'showUploadDone': false,
      'showUploadProgress': false,
      'showDownloadDone': false,
      'showDownloadProgress': false,
      'current': 0,
      'total': null,
      'errors': ''
    };
    vm.showDatasetOpts = showDatasetOpts;
    vm.startDatasetOp = startDatasetOp;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      checkForLogin();
    }

    function checkForLogin() {
      // is the user logged in from before?
      var user = UserFactory.getUser();
      if (user) {
        $log.log('Logged in as: ', user.email);
        vm.loggedIn = true;
        vm.encodedLogin = user.encoded_login;
        vm.loginEmail = user.email; // set the email to the login email
        if (navigator.onLine) vm.getDatasets();
      }
      else {
        $log.log('Not logged in!');
        vm.loggedIn = false;
      }
    }

    function downloadImage(image, spot) {
      var deferred = $q.defer(); // init promise
      RemoteServerFactory.downloadImage(image.self, vm.encodedLogin).then(
        function (downloadImageResponse) {
          if (downloadImageResponse.status === 200 && downloadImageResponse.data) {
            var readDataUrl = function (file, callback) {
              var reader = new FileReader();
              reader.onloadend = function (evt) {
                callback(evt.target.result);
              };
              reader.readAsDataURL(file);
            };
            readDataUrl(downloadImageResponse.data, function (base64Image) {
              var imageProps = _.findWhere(spot.properties.images,
                {'self': downloadImageResponse.config.url});
              imageProps.src = base64Image;
              // Set the image height and width
              if (!imageProps.height || !imageProps.width) {
                var im = new Image();
                im.src = base64Image;
                imageProps.height = im.height;
                imageProps.width = im.width;
              }
              deferred.resolve();
            });
          }
          else {
            deferred.reject();
          }
        });
      return deferred.promise;
    }

    function saveSpot(spot) {
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

      SpotFactory.save(spot).then(function () {
        vm.progress.current++;
        if (vm.progress.current === vm.progress.total) {
          vm.progress.showDownloadDone = true;
        }
      });
    }

    /**
     * Public Functions
     */

    // Upload all spots to a dataset
    function addDatasetSpots() {
      // Get the dataset id
      var url_parts = vm.dataset.self.split('/');
      var dataset_id = url_parts.pop();

      function deleteAllDatasetSpots() {
        return RemoteServerFactory.deleteAllDatasetSpots(dataset_id, vm.encodedLogin);
      }

      function getAllLocalSpots() {
        return SpotFactory.getSpots();
      }

      function uploadImages(spot) {
        if (spot.properties.images) {
          _.each(spot.properties.images, function (image) {
            RemoteServerFactory.uploadImage(spot.properties.id, image, vm.encodedLogin).then(function (response) {
              if (response.status === 201) {
                $log.log('Image uploaded for', spot, 'Server response:', response);
              }
              else {
                $log.log('Error uploading image for', spot, 'Server response:', response);
              }
            });
          });
        }
      }

      function uploadSpots(spots) {
        if (!spots) {
          return;
        }

        var spotsCount = spots.length;
        $log.log('Spots to upload:', spotsCount, spots);

        var i = 1;

        vm.progress.total = spotsCount;
        vm.progress.current = i;

        if (spotsCount > 0) {
          vm.progress.showUploadProgress = true;
        }

        spots.forEach(function (spot) {
          if (spot.properties.self) {
            // Try to update the spot first
            $log.log('Attempting to update the spot: ', spot);
            RemoteServerFactory.updateFeature(spot, vm.encodedLogin).then(function (response) {
              $log.log('Update Feature server response: ', response);
              if (response.status === 201) {
                $log.log('Updated spot ', i, '/', spotsCount);
                uploadImages(spot);

                // Add spot to dataset
                RemoteServerFactory.addSpotToDataset(spot.properties.id, dataset_id,
                  vm.encodedLogin).then(
                  function (response2) {
                    if (response2.status === 201) {
                      $log.log('Spot', spot, 'added to Dataset', dataset_id, 'Server response:', response2);
                    }
                    else {
                      $log.log('Error adding spot', spot, 'added to Dataset', dataset_id, 'Server response:', response2);
                    }
                  }
                );

                // Update the progress
                vm.progress.current = i;
                if (i === spotsCount) vm.progress.showUploadDone = true;
                i++;
              }
              else {
                // Maybe this is a new spot, try to create the spot
                delete spot.properties.self;
                $log.log('Unable to update spot ', i, '/', spotsCount, ' - Maybe this is a new spot.');
                $log.log('Attempting to create the spot: ', spot);
                RemoteServerFactory.createFeature(spot, vm.encodedLogin).then(function (response) {
                  $log.log('Create Feature server response: ', response);
                  if (response.status === 201) {
                    spot.properties.self = response.data.properties.self;
                    SpotFactory.save(spot);
                    $log.log('Created spot ', i, '/', spotsCount);
                    uploadImages(spot);

                    // Add spot to dataset
                    RemoteServerFactory.addSpotToDataset(spot.properties.id, dataset_id,
                      vm.encodedLogin).then(
                      function (response2) {
                        if (response2.status === 201) {
                          $log.log('Spot', spot, 'added to Dataset', dataset_id, 'Server response:', response2);
                        }
                        else {
                          $log.log('Error adding spot', spot, 'to Dataset', dataset_id, 'Server response:', response2);
                        }
                      }
                    );
                  }
                  else {
                    throw new Error('Unable to create spot ' + i + '/' + spotsCount);
                  }

                  // Update the progress
                  vm.progress.current = i;
                  if (i === spotsCount) vm.progress.showUploadDone = true;
                  i++;
                });
              }
            });
          }
          else {
            $log.log('Attempting to create the spot: ', spot);
            RemoteServerFactory.createFeature(spot, vm.encodedLogin).then(function (response) {
              $log.log('Create Feature server response: ', response);
              if (response.status === 201) {
                spot.properties.self = response.data.properties.self;
                SpotFactory.save(spot);
                $log.log('Created spot ', i, '/', spotsCount);
                uploadImages(spot);

                // Add spot to dataset
                RemoteServerFactory.addSpotToDataset(spot.properties.id, dataset_id,
                  vm.encodedLogin).then(
                  function (response2) {
                    if (response2.status === 201) {
                      $log.log('Spot', spot, 'added to Dataset', dataset_id, 'Server response:', response2);
                    }
                    else {
                      $log.log('Error adding spot', spot, 'to Dataset', dataset_id, 'Server response:', response2);
                    }
                  }
                );
              }
              else {
                throw new Error('Unable to create spot ' + i + '/' + spotsCount);
              }

              // Update the progress
              vm.progress.current = i;
              if (i === spotsCount) vm.progress.showUploadDone = true;
              i++;
            });
          }
        });
      }

      function reportProblems(fault) {
        $log.log(fault);
      }

      deleteAllDatasetSpots()
        .then(getAllLocalSpots)
        .then(uploadSpots)
        .catch(reportProblems);
    }

    function closeModal(modal) {
      vm.progress = {                   // upload progress
        'showUploadDone': false,
        'showUploadProgress': false,
        'showDownloadDone': false,
        'showDownloadProgress': false,
        'current': 0,
        'total': null,
        'errors': ''
      };
      vmParent[modal].hide();
      vmParent.spots = SpotFactory.getSpots();
      vmParent.spotsDisplayed = angular.fromJson(angular.toJson(vmParent.spots)).slice(0, 20);
    }

    // Create a new dataset
    function createDataset() {
      RemoteServerFactory.createDataset({'name': vm.dataset_name}, vm.encodedLogin).then(
        function (response) {
          vm.operation = null;
          vm.dataset_name = '';
          vm.dataset = null;
          vm.getDatasets();
        }
      );
    }

    // Delete a dataset
    function deleteDataset() {
      RemoteServerFactory.deleteDataset(vm.dataset.self, vm.encodedLogin).then(
        function (response) {
          $log.log('deleted: ', response);
          vm.dataset = null;
          vm.getDatasets();
        }
      );
    }

    // Delete ALL spots for a user on the server
    function deleteSpots() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spots',
        'template': 'Are you sure you want to delete <b>ALL</b> spots for this user from the server? Spots on your local device will remain on your device.'
      });
      confirmPopup.then(function (res) {
        if (res) {
          RemoteServerFactory.deleteSpots(vm.encodedLogin).then(function (response) {
            $log.log('ALL spots deleted. Server response: ', response);
          });
        }
      });
    }

    // Get all of the datasets for a user
    function getDatasets() {
      if (vm.encodedLogin) {
        RemoteServerFactory.getDatasets(vm.encodedLogin).then(
          function (response) {
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
    }

    // Download all spots from a dataset
    function getDatasetSpots() {
      // Get the dataset id
      var url_parts = vm.dataset.self.split('/');
      var dataset_id = url_parts.pop();
      RemoteServerFactory.getDatasetSpots(dataset_id, vm.encodedLogin).then(
        function (response) {
          $log.log(response);
          if (response.status === 200) {
            if (response.data !== null) {
              vm.progress.total = response.data.features.length;
              vm.progress.current = 0;
              vm.progress.showDownloadProgress = true;
              response.data.features.forEach(function (spot) {
                if (spot.properties.images) {
                  var promises = [];
                  _.each(spot.properties.images, function (image) {
                    // If no title, set the title from the caption
                    if (image.annotated && !image.title) {
                      image.title = image.caption ? image.caption.substring(0, 24) : 'Unnamed';
                    }
                    if (!image.self) image.self = 'http://strabospot.org/db/image/' + image.id;
                    promises.push(downloadImage(image, spot));
                  });
                  $q.all(promises).then(function () {
                    saveSpot(spot);
                  });
                }
                else saveSpot(spot);
              });
            }
            else {
              $ionicPopup.alert({
                'title': 'Empty Dataset!',
                'template': 'There are no spots in this dataset.'
              });
              vm.progress.showDownloadProgress = false;
            }
          }
          else vm.progress.errors = 'Error contacting the server.';
        },
        function (errorMessage) {
          $log.warn(errorMessage);
        }
      );
    }

    function showDatasetOpts() {
      return navigator.onLine && vm.encodedLogin;
    }

    function startDatasetOp() {
      vm.progress = {                   // upload progress
        'showUploadDone': false,
        'showUploadProgress': false,
        'showDownloadDone': false,
        'showDownloadProgress': false,
        'current': 0,
        'total': null,
        'errors': ''
      };

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
    }
  }
}());
