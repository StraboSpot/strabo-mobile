(function () {
  'use strict';

  angular
    .module('app')
    .controller('ManageProjectController', ManageProjectController);

  ManageProjectController.$inject = ['$ionicModal', '$ionicLoading', '$ionicPopup', '$log', '$scope', '$state', '$q',
    'DataModelsFactory', 'FormFactory', 'OtherMapsFactory', 'ProjectFactory', 'RemoteServerFactory', 'SpotFactory', 'UserFactory'];

  function ManageProjectController($ionicModal, $ionicLoading, $ionicPopup, $log, $scope, $state, $q, DataModelsFactory,
                                   FormFactory, OtherMapsFactory, ProjectFactory, RemoteServerFactory, SpotFactory, UserFactory) {
    var vm = this;

    var deleteSelected;
    var notifyMessages = [];
    var user = UserFactory.getUser();

    vm.areDatasetsOn = areDatasetsOn;
    vm.closeModal = closeModal;
    vm.data = {};
    vm.datasets = [];
    vm.activeDatasets = [];
    vm.deleteDataset = deleteDataset;
    vm.deleteProject = deleteProject;
    vm.deleteType = deleteType;
    //vm.doSync = doSync;
    vm.filterDefaultTypes = filterDefaultTypes;
    vm.getNumberOfSpots = getNumberOfSpots;
    vm.initializeUpload = initializeUpload;
    vm.initializeDownload = initializeDownload;
    vm.isDatasetOn = isDatasetOn;
    vm.isSyncReady = isSyncReady;
    vm.newDataset = newDataset;
    vm.newDatasetName = '';
    vm.newProject = newProject;
    vm.otherFeatureTypes = [];
    vm.project = {};
    vm.projects = [];
    vm.selectProject = selectProject;
    vm.setSpotsDataset = setSpotsDataset;
    vm.showField = showField;
    vm.showNewProject = false;
    vm.showNewProjectDetail = false;
    vm.showExistingProjectsList = false;
    vm.showExitProjectModal = !_.isEmpty(ProjectFactory.getCurrentProject());
    vm.showProject = false;
    vm.showProjectButtons = false;
    vm.survey = {};
    vm.switchProject = switchProject;
    vm.syncDataset = syncDataset;
    vm.titleText = 'Manage Projects';
    vm.toggleDataset = toggleDataset;
    vm.toggleProject = toggleProject;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      initializeProject();

      /*  ProjectFactory.loadProjects().then(function (loadedProjects) {
       vm.projects = loadedProjects;
       initializeModal();
       });*/

      ProjectFactory.setUser(user);

      vm.survey = DataModelsFactory.getDataModel('project').survey;

      $ionicModal.fromTemplateUrl('app/project/open-project-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.projectModal = modal;
        openModal();
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.projectModal.remove();
      });
    }

    function allValidSpots(spots) {
      var validSpots = true;
      _.each(spots, function (spotId) {
        if (!SpotFactory.getSpotById(spotId)) {
          validSpots = false;
          ProjectFactory.removeSpotFromDataset(spotId);
        }
      });
      return validSpots;
    }

    function checkValidDateTime(spot) {
      // Make sure the date and time aren't null
      if (!spot.properties.date || !spot.properties.time) {
        if (!spot.properties.date) {
          if (spot.properties.time) spot.properties.date = spot.properties.time;
          else spot.properties.date = new Date(Date.now()).setMilliseconds(0);
        }
        if (!spot.properties.time && spot.properties.date) {
          if (spot.properties.date) spot.properties.time = spot.properties.date;
          else spot.properties.time = new Date(Date.now()).setMilliseconds(0);
        }
        SpotFactory.save(spot);
      }
    }

    function destroyProject() {
      var deferred = $q.defer(); // init promise
      ProjectFactory.destroyProject().then(function () {
        SpotFactory.clearAllSpots().then(function () {
          deferred.resolve();
        });
      });
      return deferred.promise;
    }

    function doDownloadDataset(dataset) {
      var deferred = $q.defer(); // init promise
      notifyMessages = [];
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Downloading Spots...'});
      doDownloadSpots(dataset).then(function (spots) {
        var promises = [];
        var currentSpots = ProjectFactory.getSpotIds()[dataset.id];
        var spotsToKeep = _.map(spots, function (spot) {
          return spot.properties.id;
        });
        notifyMessages.push('Downloading Images ...');
        notifyMessages.push('Saving Spots ...');
        $ionicLoading.show({'template': notifyMessages.join('<br>')});
        _.each(spots, function (spot) {
          var promise = doDownloadImages(spot).then(function (spotToSave) {
            //$log.log('Spot To Save', spotToSave);
            return saveSpot(spotToSave, dataset);
          });
          promises.push(promise);
        });
        $q.all(promises).then(function () {
          var spotsToDestroy = _.difference(currentSpots, spotsToKeep);
          if (spotsToDestroy) $log.log('Spots to destroy bc they are not on server', spotsToDestroy);
          _.each(spotsToDestroy, function (spotToDestroy) {
            SpotFactory.destroy(spotToDestroy);
          });
          deferred.resolve();
        });
      }, function (err) {
        $log.log(err);
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function doDownloadImages(spot) {
      var deferred = $q.defer(); // init promise
      if (spot.properties.images) {
        var promises = [];
        _.each(spot.properties.images, function (image) {
          // Check if we have the image already, otherwise download the image
          var downloadImage = true;
          var foundSpot = _.find(SpotFactory.getSpots(), function (savedSpot) {
            return savedSpot.properties.id === spot.properties.id;
          });
          if (foundSpot) {
            if (foundSpot.properties.images) {
              var foundImage = _.find(foundSpot.properties.images, function (savedImage) {
                return savedImage.id === image.id;
              });
              if (foundImage.src) {
                image.src = foundImage.src;
                downloadImage = false;
              }
            }
          }
          if (downloadImage) {
            var promise = RemoteServerFactory.getImage(image.id, UserFactory.getUser().encoded_login).then(
              function (response) {
                $log.log('Downloaded image. Response:', response);
                var deferred2 = $q.defer(); // init promise
                handleDownloadedImage(image, response).then(function () {
                  deferred2.resolve();
                });
                return deferred2.promise;
              });
            promises.push(promise);
          }
        });
        $q.all(promises).then(function () {
          deferred.resolve(spot);
        });
      }
      else deferred.resolve(spot);
      return deferred.promise;
    }

    function doDownloadProject() {
      notifyMessages = ['<ion-spinner></ion-spinner><br>'];
      var deferred = $q.defer(); // init promise
      ProjectFactory.loadProjectRemote(vm.project).then(function () {
        var promises = [];
        _.each(vm.activeDatasets, function (dataset) {
          promises.push(doDownloadDataset(dataset));
        });
        $q.all(promises).then(function () {
          deferred.resolve();
        }, function (err) {
          deferred.reject(err);
        });
      }, function (err) {
        $ionicPopup.alert({
          'title': 'Error communicating with server!',
          'template': err
        });
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function doDownloadSpots(dataset) {
      var deferred = $q.defer(); // init promise
      RemoteServerFactory.getDatasetSpots(dataset.id, UserFactory.getUser().encoded_login).then(function (response) {
        $log.log('Downloaded Spots. Response:', response);
        notifyMessages = ['<ion-spinner></ion-spinner><br>'];
        notifyMessages.push('Downloaded Spots');
        $ionicLoading.show({'template': notifyMessages.join('<br>')});
        if (response.data) deferred.resolve(response.data.features);
        else deferred.resolve({});
      }, function (response) {
        $log.log('Error geting spots in dataset. Response:', response);
        deferred.reject(response.data.Error);
      });
      return deferred.promise;
    }

    function doLoadProjectRemote(project) {
      destroyProject().then(function () {
        ProjectFactory.loadProjectRemote(project).then(function () {
          vm.closeModal();
          initializeProject();
        }, function (err) {
          $ionicPopup.alert({
            'title': 'Error communicating with server!',
            'template': err
          });
        });
      });
    }

    function doUpload() {
      notifyMessages = ['<ion-spinner></ion-spinner><br>'];
      var deferred = $q.defer(); // init promise
      doUploadProject().then(
        function () {
          doUploadDatasets().then(
            function () {
              $log.log('Finished uploading project');
              notifyMessages.push('Finished uploading project');
              $ionicLoading.show({'template': notifyMessages.join('<br>')});
              deferred.resolve();
            },
            function (err) {
              deferred.reject(err);
            });
        },
        function (err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function doUploadDatasets() {
      var deferred = $q.defer(); // init promise
      var promises = [];
      var project = ProjectFactory.getCurrentProject();
      var datasets = ProjectFactory.getActiveDatasets();
      _.each(datasets, function (dataset) {
        var promise = RemoteServerFactory.updateDataset(dataset, UserFactory.getUser().encoded_login).then(
          function (response) {
            $log.log('Finished updating dataset', dataset, '. Response:', response);
            return RemoteServerFactory.addDatasetToProject(project.id, dataset.id,
              UserFactory.getUser().encoded_login).then(
              function (response2) {
                $log.log('Finished adding dataset to project', project, '. Response:', response2);
                return doUploadSpots(dataset).then(
                  null,
                  function (err) {
                    deferred.reject(err);
                  });
              },
              function (response2) {
                $log.log('Error adding dataset to project. Response:', response2);
                deferred.reject(response2.data.Error);
              });
          },
          function (response) {
            $log.log('Error uploading dataset', dataset, '. Response:', response);
            deferred.reject(response.data.Error);
          });
        promises.push(promise);
      });
      $q.all(promises).then(function () {
        deferred.resolve();
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function doUploadProject() {
      var deferred = $q.defer(); // init promise
      var project = angular.copy(ProjectFactory.getCurrentProject());
      if (!_.isEmpty(OtherMapsFactory.getOtherMaps())) project.other_maps = OtherMapsFactory.getOtherMaps();
      RemoteServerFactory.updateProject(project, UserFactory.getUser().encoded_login).then(
        function (response) {
          $log.log('Finished uploading project', project, '. Response:', response);
          notifyMessages.push('Uploaded project properties.');
          $ionicLoading.show({
            'template': notifyMessages.join('<br>')
          });
          deferred.resolve();
        },
        function (response) {
          $log.log('Error uploading project', project, '. Response:', response);
          deferred.reject(response.data.Error);
        });
      return deferred.promise;
    }

    function doUploadSpots(dataset) {
      var deferred = $q.defer(); // init promise
      var spotIds = ProjectFactory.getSpotIds()[dataset.id];
      if (spotIds) {
        var totalSpotCount = spotIds.length;
        notifyMessages.push('Dataset ' + dataset.name + ': Uploading ' + totalSpotCount + ' Spots...');
        $ionicLoading.show({'template': notifyMessages.join('<br>')});
      }
      else {
        notifyMessages.push('Dataset ' + dataset.name + ': No Spots to upload.');
        $ionicLoading.show({'template': notifyMessages.join('<br>')});
      }

      // Create a feature collection of spots to upload for this dataset
      var spotCollection = {
        'type': 'FeatureCollection',
        'features': []
      };
      _.each(spotIds, function (spotId) {
        var spot = SpotFactory.getSpotById(spotId);
        if (!spot) ProjectFactory.removeSpotFromDataset(spotId);
        else {
          checkValidDateTime(spot);
          var spotNoImages = angular.copy(spot);
          _.each(spotNoImages.properties.images, function (image, i) {
            spotNoImages.properties.images[i] = _.omit(image, 'src');
          });
          spotCollection.features.push(spotNoImages);
        }
      });


      if (_.isEmpty(spotCollection.features)) deferred.resolve();
      else {
        RemoteServerFactory.updateDatasetSpots(dataset.id, spotCollection, UserFactory.getUser().encoded_login).then(
          function (response) {
            $log.log('Dataset ' + dataset.name + ': Finished uploading Spots. Response:', response);
            notifyMessages.push('Dataset ' + dataset.name + ': Finished uploading Spots');
            $ionicLoading.show({'template': notifyMessages.join('<br>')});

            var promises = [];
            _.each(spotIds, function (spotId) {
              var spot = SpotFactory.getSpotById(spotId);
              promises.push(doUploadImages(spot));
            });

            $q.all(promises).then(
              function () {
                deferred.resolve();
              },
              function (err) {
                deferred.reject(err);
              });
          },
          function (response2) {
            $log.log('Error updating Spots in dataset' + dataset.name + '. Response:', response2);
            deferred.reject(response2.data.Error);
          });
      }
      return deferred.promise;
    }

    function doUploadImages(spot) {
      var deferred = $q.defer(); // init promise
      var promises = [];
      if (spot.properties.images) {
        _.each(spot.properties.images, function (image) {
          var promise = RemoteServerFactory.verifyImageExistance(image.id, UserFactory.getUser().encoded_login).then(
            null,
            function () {
              var deferred2 = $q.defer(); // init promise
              // If the image doesn't exist on the server, upload the image
              $log.log('Uploading image for Spot ' + spot.properties.name + '...');
              notifyMessages.push('Uploading image for Spot ' + spot.properties.name + '...');
              $ionicLoading.show({'template': notifyMessages.join('<br>')});
              RemoteServerFactory.uploadImage(image, UserFactory.getUser().encoded_login).then(
                function (response) {
                  var i = _.findIndex(notifyMessages, function (notifyMessage) {
                    return notifyMessage.startsWith('Uploading image for Spot ' + spot.properties.name);
                  });
                  notifyMessages.splice(i, 1);
                  $log.log('Image uploaded for Spot', spot, 'Server response:', response);
                  $ionicLoading.show({'template': notifyMessages.join('<br>')});
                  deferred2.resolve();
                },
                function (response) {
                  $log.log('Error uploading image for', spot, 'Server response:', response);
                  deferred2.reject(response.data.Error);
                });
              return deferred2.promise;
            });
          promises.push(promise);
        });
        $q.all(promises).then(function () {
          deferred.resolve();
        }, function (err) {
          deferred.reject(err);
        });
      }
      else deferred.resolve();
      return deferred.promise;
    }

    function handleDownloadedImage(image, response) {
      var deferred = $q.defer(); // init promise
      readDataUrl(response.data).then(function (base64Image) {
        image.src = base64Image;
        if (!image.height || !image.width) {
          var im = new Image();
          im.src = base64Image;
          image.height = im.height;
          image.width = im.width;
        }
        deferred.resolve(image);
      });
      return deferred.promise;
    }

    function initializeDownloadDataset(dataset) {
      var deferred = $q.defer(); // init promise
      notifyMessages = [];
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Downloading Spots...'});
      doDownloadDataset(dataset).then(function () {
        $ionicLoading.hide();
        if (vm.getNumberOfSpots(dataset) === '(0 Spots)') {
          $ionicPopup.alert({
            'title': 'Success!',
            'template': 'No Spots to download.'
          });
        }
        else {
          $ionicPopup.alert({
            'title': 'Success!',
            'template': 'Spots downloaded successfully.'
          });
        }
        deferred.resolve();
      }, function (err) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          'title': 'Error communicating with server!',
          'template': 'There was a problem downloading the Spots for this dataset. Try again later. Server error message: ' + err
        });
        deferred.reject();
      });
      return deferred.promise;
    }

    function initializeModal() {
      vm.data = {};
      vm.showExistingProjectsList = false;
      vm.showExitProjectModal = !_.isEmpty(vm.project);
      if (!isSyncReady()) {
        vm.showProjectButtons = false;
        vm.showNewProjectDetail = true;
        vm.titleText = 'Create a New Project';
      }
      else {
        vm.showProjectButtons = true;
        vm.showNewProjectDetail = false;
        vm.titleText = 'Select a Project';
      }
    }

    function initializeProject() {
      vm.project = ProjectFactory.getCurrentProject();
      vm.datasets = ProjectFactory.getCurrentDatasets();
      vm.activeDatasets = ProjectFactory.getActiveDatasets();
      vm.spotsDataset = ProjectFactory.getSpotsDataset();
      vm.otherFeatureTypes = ProjectFactory.getOtherFeatures();

      if (areDatasetsOn() && _.isEmpty(vm.spotsDataset)) {
        ProjectFactory.saveSpotsDataset(vm.activeDatasets[0]);
        vm.spotsDataset = ProjectFactory.getSpotsDataset();
      }
      vm.showProject = !_.isEmpty(vm.project);
    }

    function openModal() {
      initializeModal();
      if (_.isEmpty(vm.project)) vm.projectModal.show();
      else if (ProjectFactory.switchProject === true) {
        ProjectFactory.switchProject = false;
        if (isSyncReady()) vm.projectModal.show();
        else {
          var confirmPopup = $ionicPopup.confirm({
            'title': 'Warning!',
            'template': 'Unable to upload the current project to the server. Switching projects will overwrite the current project. Are you sure you want to continue?'
          });
          confirmPopup.then(function (res) {
            if (res) vm.projectModal.show();
          });
        }
      }
    }

    function readDataUrl(file) {
      var deferred = $q.defer(); // init promise
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function (evt) {
        deferred.resolve(evt.target.result);
      };
      return deferred.promise;
    }

    function saveSpot(spot, dataset) {
      var deferred = $q.defer(); // init promise
      // If the geometry coordinates contain any null values, delete the geometry; it shouldn't be defined
      if (spot.geometry) {
        if (spot.geometry.coordinates) {
          if (_.indexOf(_.flatten(spot.geometry.coordinates), null) !== -1) {
            delete spot.geometry;
          }
        }
      }
      // Look for any current spots that match the id of the downloaded spot and remove the current spot
      /* var foundSpot = _.find(SpotFactory.getSpots(), function (savedSpot) {
       return savedSpot.properties.id === spot.properties.id;
       });
       if (!foundSpot) {*/
      SpotFactory.save(spot).then(function () {
        //$log.log('Saved new Spot from server:', spot);
        ProjectFactory.addSpotToDataset(spot.properties.id, dataset.id);
        deferred.resolve();
      }, function (err) {
        $log.log('Error saving Spot to local storage');
        deferred.reject(err);
      });
      //}
      /*else if (foundSpot.properties.modified_timestamp < new Date(spot.properties.modified_timestamp)) {
       SpotFactory.save(spot).then(function () {
       $log.log('Updated Spot from server:', spot);
       ProjectFactory.addSpotToDataset(spot.properties.id, dataset.id);
       deferred.resolve();
       }, function (err) {
       $log.log('Error saving Spot to local storage');
       deferred.reject(err);
       });
       }
       else if (foundSpot.properties.modified_timestamp > new Date(spot.properties.modified_timestamp)) {
       $log.log('Local Spot newer than Spot on server. Taking no action.');
       deferred.resolve();
       }
       else {
       $log.log('Local Spot has the same timestamp as the Spot on the server. Taking no action.');
       deferred.resolve();
       }*/
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function isSyncReady() {
      return ProjectFactory.isSyncReady();
    }

    function closeModal() {
      initializeModal();
      vm.projectModal.hide();
    }

    function deleteDataset(dataset) {
      var remainingActiveDatasets = _.reject(vm.activeDatasets, function (activeDataset) {
        return activeDataset.id === dataset.id;
      });
      if (_.isEmpty(remainingActiveDatasets)) {
        $ionicPopup.alert({
          'title': 'Too Few Active Datasets!',
          'template': 'You must set another active dataset before you delete the dataset ' + dataset.name + '.'
        });
      }
      else {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Dataset',
          'template': 'Are you sure you want to delete Dataset ' + dataset.name + '? This will also delete the Spots in this dataset.'
        });
        confirmPopup.then(function (res) {
          if (res) {
            ProjectFactory.destroyDataset(dataset).then(function (spotsToDestroy) {
              _.each(spotsToDestroy, function (spotToDestroy) {
                SpotFactory.destroy(spotToDestroy);
              });
              initializeProject();
            });
          }
        });
      }
    }

    function deleteProject(project) {
      deleteSelected = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Project',
        'template': 'Are you sure you want to delete the project ' + project.name + '? This will also delete all datasets and Spots contained within the project.'
      });
      confirmPopup.then(function (res) {
        deleteSelected = false;
        if (res) {
          RemoteServerFactory.deleteProject(project.id, UserFactory.getUser().encoded_login).then(function () {
            if (vm.project.id === project.id) {
              destroyProject().then(function () {
                initializeProject();
              });
            }
            ProjectFactory.loadProjectsRemote().then(function (projects) {
              vm.projects = projects;
            }, function (err) {
              $ionicPopup.alert({
                'title': 'Error communicating with server!',
                'template': err
              });
            });
          });
        }
      });
    }

    function deleteType(i) {
      var customTypes = _.reject(vm.otherFeatureTypes, function (type) {
        return _.contains(ProjectFactory.getDefaultOtherFeatureTypes(), type);
      });
      var usedType = _.filter(SpotFactory.getSpots(), function (spot) {
        if (spot.properties.other_features) {
          return _.find(spot.properties.other_features, function (otherFeature) {
              return otherFeature.type === customTypes[i];
            }) || false;
        }
        return false;
      });
      var spotNames = [];
      _.each(usedType, function (spot) {
        spotNames.push(spot.properties.name);
      });
      if (usedType.length === 1) {
        $ionicPopup.alert({
          'title': 'Type in Use',
          'template': 'This type is used in the following Spot. Please remove the type from this Spot before' +
          ' deleting this type. Spot: ' + spotNames.join(', ')
        });
      }
      else if (usedType.length > 1) {
        $ionicPopup.alert({
          'title': 'Type in Use',
          'template': 'This type is used in the following Spots. Please remove the type from these Spots before' +
          ' deleting this type. Spots: ' + spotNames.join(', ')
        });
      }
      else {
        ProjectFactory.destroyOtherFeature(i + ProjectFactory.getDefaultOtherFeatureTypes().length - 1);
      }
    }

    function doCreateNewProject() {
      destroyProject().then(function () {
        ProjectFactory.createNewProject(vm.data).then(function () {
          vm.closeModal();
          initializeProject();
        });
      });
    }

    /*function doSync() {
     if (isSyncReady()) {
     vm.showOfflineWarning = false;
     SyncFactory.doDownloadProject(vm.project, UserFactory.getUser().encoded_login).then(function (msg) {
     $log.log(msg);
     SyncFactory.doDownloadDatasets(vm.activeDatasets, UserFactory.getUser().encoded_login).then(function () {
     $log.log('Finished sync');
     });

     //doDownloadProject().then(function () {
     if (remoteProject date > local Project date) {
     destory local project
     save remote Project
     download datasets
     }
     //vm.data = UserFactory.getUser();
     //dataOrig = angular.copy(vm.data);
     //$log.log('Finished sync');
     }).finally(function () {
     // Stop the ion-refresher from spinning
     $scope.$broadcast('scroll.refreshComplete');
     });
     }
     else {
     vm.showOfflineWarning = true;
     // Stop the ion-refresher from spinning
     $scope.$broadcast('scroll.refreshComplete');
     }
     }*/

    function initializeDownload() {
      var names = _.pluck(vm.activeDatasets, 'name');
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Download Project!',
        'template': 'Local project properties and local copies of the datasets <b>' + names.join(
          ', ') + '</b> will be replaced with the copies on the server. Continue?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          notifyMessages = [];
          $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Downloading Project...'});
          doDownloadProject().then(function () {
            $ionicLoading.hide();
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'Project updated successfully.'
            });
            initializeProject();
          }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              'title': 'Error communicating with server!',
              'template': 'There was a problem updating project. Try again later. Server error message: ' + err
            });
          });
        }
      });
    }

    function initializeUpload() {
      var deferred = $q.defer(); // init promise
      var names = _.pluck(vm.activeDatasets, 'name');
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Upload Project!',
        'template': 'Project properties and copies of the datasets <b>' + names.join(
          ', ') + '</b> on the server will be replaced by your local copies. Continue?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          notifyMessages = [];
          $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Uploading...'});
          doUpload().then(function () {
            $ionicLoading.hide();
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'Project uploaded successfully.'
            });
            deferred.resolve();
          }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              'title': 'Error communicating with server!',
              'template': 'There was a problem uploading your project. Try again later. Server error message: ' + err
            });
            deferred.reject();
          });
        }
        else deferred.resolve();
      });
      return deferred.promise;
    }

    function filterDefaultTypes(type) {
      return _.indexOf(ProjectFactory.getDefaultOtherFeatureTypes(), type) === -1;
    }

    function getNumberOfSpots(dataset) {
      var spots = ProjectFactory.getSpotIds()[dataset.id];
      if (!allValidSpots(spots)) getNumberOfSpots(dataset);
      else {
        if (_.isEmpty(spots)) return '(0 Spots)';
        else if (spots.length === 1) return '(1 Spot)';
        return '(' + spots.length + ' Spots)';
      }
    }

    function isDatasetOn(dataset) {
      return _.find(vm.activeDatasets, function (datasetOn) {
        return datasetOn.id === dataset.id;
      });
    }

    function areDatasetsOn() {
      return !_.isEmpty(vm.activeDatasets);
    }

    function newDataset() {
      var myPopup = $ionicPopup.show({
        'template': '<input type="text" ng-model="vm.newDatasetName">',
        'title': 'Enter a name for this Dataset',
        'scope': $scope,
        'buttons': [{
          'text': 'Cancel'
        }, {
          'text': '<b>Save</b>',
          'type': 'button-positive',
          'onTap': function (e) {
            if (!vm.newDatasetName) {
              // Don't allow the user to close unless a name is entered
              e.preventDefault();
            }
            else return vm.newDatasetName;
          }
        }]
      });

      myPopup.then(function (res) {
        if (res) {
          ProjectFactory.createNewDataset(vm.newDatasetName);
          vm.newDatasetName = '';
          vm.datasets = ProjectFactory.getCurrentDatasets();
        }
      });
    }

    function newProject() {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        if (_.isEmpty(vm.project)) doCreateNewProject();
        else if (ProjectFactory.isSyncReady()) {
          var confirmPopup = $ionicPopup.confirm({
            'title': 'Upload Current Project?',
            'template': 'Upload current project, ' + vm.project.description.project_name + ', before creating your' +
            ' new project?',
            'cancelText': 'No',
            'okText': 'Yes'
          });
          confirmPopup.then(function (res) {
            if (res) {
              initializeUpload().then(function () {
                doCreateNewProject();
              }, function () {
                var confirmPopup2 = $ionicPopup.confirm({
                  'title': 'Upload Error',
                  'template': 'Your current project, ' + vm.project.description.project_name + ', cannot be' +
                  ' uploaded to the server at this time so it will be overwritten by the new project, ' +
                  vm.data.project_name + '. Are you sure you want to delete the project ' +
                  vm.project.description.project_name + ' including all datasets and Spots contained within the' +
                  ' project?'
                });
                confirmPopup2.then(function (res2) {
                  if (res2) doCreateNewProject();
                });
              });
            }
            else doCreateNewProject();
          });
        }
        else {
          var confirmPopup3 = $ionicPopup.confirm({
            'title': 'Final Chance!',
            'template': 'Since your current project, ' + vm.project.description.project_name + ', cannot be' +
            ' uploaded to the server at this time it will be overwritten by the new project, ' +
            vm.data.project_name + '. Are you sure you want to delete the project ' +
            vm.project.description.project_name + ' including all datasets and Spots contained within the project?'
          });
          confirmPopup3.then(function (res) {
            if (res) doCreateNewProject();
          });
        }
      }
    }

    function selectProject(project) {
      if (!deleteSelected) {
        $log.log('Selected:', project);
        if (_.isEmpty(vm.project)) doLoadProjectRemote(project);
        else {
          var confirmPopup = $ionicPopup.confirm({
            'title': 'Upload Current Project?',
            'template': 'Upload current project, ' + vm.project.description.project_name + ', before loading another' +
            ' project?',
            'cancelText': 'No',
            'okText': 'Yes'
          });
          confirmPopup.then(function (res) {
            if (res) {
              initializeUpload().then(function () {
                doLoadProjectRemote(project);
              }, function () {
                var confirmPopup2 = $ionicPopup.confirm({
                  'title': 'Upload Error',
                  'template': 'Your current project, ' + vm.project.description.project_name + ', cannot be' +
                  ' uploaded to the server at this time so it will be overwritten by the project, ' + project.name +
                  '. Are you sure you want to delete the project ' + vm.project.description.project_name + ' including' +
                  ' all datasets and Spots contained within the project?'
                });
                confirmPopup2.then(function (res2) {
                  if (res2) doLoadProjectRemote(project);
                });
              });
            }
            else doLoadProjectRemote(project);
          });
        }
      }
    }

    function setSpotsDataset() {
      // Check if the dataset for spots is still in the datasets that are on
      var found = _.find(vm.activeDatasets, function (datasetOn) {
        return vm.spotsDataset.id === datasetOn.id;
      });
      // If not set the dataset for spots as the Default Dataset
      if (!found) vm.spotsDataset = vm.activeDatasets[0];
      ProjectFactory.saveSpotsDataset(vm.spotsDataset);
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function switchProject() {
      ProjectFactory.switchProject = true;
      openModal();
    }

    function syncDataset(i) {
      if (vm.datasets[i].sync) {
        $log.log('Turn ON dataset sync for:', vm.datasets[i]);
      }
      else {
        $log.log('Turn OFF dataset sync for:', vm.datasets[i]);
      }
    }

    function toggleDataset(datasetToggled) {
      // Toggled Off - remove dataset from the list of active datasets
      var found = _.find(vm.activeDatasets, function (datasetOn) {
        return datasetOn.id === datasetToggled.id;
      });
      if (found) {
        vm.activeDatasets = _.reject(vm.activeDatasets, function (datasetOn) {
          return datasetOn.id === datasetToggled.id;
        });
        setSpotsDataset();
      }
      // Toggled On - add dataset to the list of active datasets
      else {
        vm.activeDatasets.push(datasetToggled);
        if (_.isEmpty(ProjectFactory.getSpotIds()[datasetToggled.id]) && isSyncReady()) {
          initializeDownloadDataset(datasetToggled).then(function () {
            setSpotsDataset();
          });
        }
        else if (_.isEmpty(ProjectFactory.getSpotIds()[datasetToggled.id]) && !isSyncReady()) {
          $ionicPopup.alert({
            'title': 'Cannot Update!',
            'template': 'Unable to reach the server to download any Spots that may be in this dataset.'
          });
        }
      }
      ProjectFactory.saveActiveDatasets(vm.activeDatasets);
    }

    function toggleProject(loadType) {
      if (loadType === 'new') {
        vm.showExistingProjectsList = false;
        vm.showNewProjectDetail = true;
      }
      else {
        vm.showExistingProjectsList = true;
        vm.showNewProjectDetail = false;
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Getting Projects from Server ...'});
        ProjectFactory.loadProjectsRemote().then(function (projects) {
          vm.projects = projects;
        }, function (err) {
          $ionicPopup.alert({
            'title': 'Error communicating with server!',
            'template': err
          });
        }).finally(function () {
          $ionicLoading.hide();
        });
      }
    }
  }
}());
