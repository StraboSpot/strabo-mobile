(function () {
  'use strict';

  angular
    .module('app')
    .controller('ManageProjectController', ManageProjectController);

  ManageProjectController.$inject = ['$ionicModal', '$ionicLoading', '$ionicPopup', '$log', '$scope', '$q',
    'DataModelsFactory', 'FormFactory', 'ImageFactory', 'LiveDBFactory', 'OtherMapsFactory', 'ProjectFactory',
    'RemoteServerFactory', 'SpotFactory', 'UserFactory', 'IS_WEB'];

  function ManageProjectController($ionicModal, $ionicLoading, $ionicPopup, $log, $scope, $q, DataModelsFactory,
                                   FormFactory, ImageFactory, LiveDBFactory, OtherMapsFactory, ProjectFactory,
                                   RemoteServerFactory, SpotFactory, UserFactory, IS_WEB) {
    var vm = this;

    var deleteSelected;
    var downloadErrors = false;
    var notifyMessages = [];
    var uploadErrors = false;
    var user = UserFactory.getUser();

    vm.data = {};
    vm.datasets = [];
    vm.activeDatasets = [];
    vm.isWeb = IS_WEB;
    vm.newDatasetName = '';
    vm.otherFeatureTypes = [];
    vm.project = {};
    vm.projects = [];
    vm.showNewProject = false;
    vm.showNewProjectDetail = false;
    vm.showExistingProjectsList = false;
    vm.showExitProjectModal = !_.isEmpty(ProjectFactory.getCurrentProject());
    vm.showProject = false;
    vm.showProjectButtons = false;
    vm.survey = {};
    vm.titleText = 'Manage Projects';

    vm.areDatasetsOn = areDatasetsOn;
    vm.closeModal = closeModal;
    vm.deleteDataset = deleteDataset;
    vm.deleteProject = deleteProject;
    vm.deleteType = deleteType;
    //vm.doSync = doSync;
    vm.filterDefaultTypes = filterDefaultTypes;
    vm.getNumberOfSpots = getNumberOfSpots;
    vm.hideLoading = hideLoading;
    vm.initializeUpload = initializeUpload;
    vm.initializeDownload = initializeDownload;
    vm.isDatasetOn = isDatasetOn;
    vm.isSyncReady = isSyncReady;
    vm.newDataset = newDataset;
    vm.newProject = newProject;
    vm.selectProject = selectProject;
    vm.setSpotsDataset = setSpotsDataset;
    vm.showField = showField;
    vm.switchProject = switchProject;
    vm.syncDataset = syncDataset;
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

      if (IS_WEB && _.isEmpty(vm.project)) {
        vm.data.project_name = 'Sample';
        doCreateNewProject();
      }

      $ionicModal.fromTemplateUrl('app/project/manage/open-project-modal.html', {
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

    // Make sure the date and time aren't null
    // ToDo: This can be cleaned up when we no longer need date and time, just datetime
    function checkValidDateTime(spot) {
      if (!spot.properties.date || !spot.properties.time) {
        var date = spot.properties.date || spot.properties.time;
        if (!date) {
          date = new Date(Date.now());
          date.setMilliseconds(0);
        }
        spot.properties.date = spot.properties.time = date.toISOString();
        SpotFactory.save(spot);
      }
      return spot;
    }

    function destroyProject() {
      return ProjectFactory.destroyProject().then(function () {
        return SpotFactory.clearAllSpots().then(function () {
          return ImageFactory.deleteAllImages();
        });
      });
    }

    function downloadDataset(dataset) {
      var deferred = $q.defer(); // init promise
      outputMessage('Downloading Dataset ' + dataset.name + '...');
      downloadSpots(dataset.id)
        .then(saveSpots)
        .then(gatherNeededImages)
        .then(downloadImages)
        .finally(function () {
          deferred.resolve();
        })
        .catch(function (err) {
          downloadErrors = true;
          $log.log('Error downloading dataset', err);
        });
      return deferred.promise;
    }

    function downloadImages(neededImagesIds) {
      var promises = [];
      var imagesDownloadedCount = 0;
      var imagesFailedCount = 0;
      var savedImagesCount = 0;
      _.each(neededImagesIds, function (neededImageId) {
        var promise = RemoteServerFactory.getImage(neededImageId, UserFactory.getUser().encoded_login)
          .then(function (response) {
            if (response.data) {
              imagesDownloadedCount++;
              notifyMessages.pop();
              outputMessage('NEW Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImagesIds.length +
                '<br>NEW Images Saved: ' + savedImagesCount + ' of ' + neededImagesIds.length);
              return readDataUrl(response.data).then(function (base64Image) {
                return ImageFactory.saveImage(neededImageId, base64Image).then(function () {
                  savedImagesCount++;
                  notifyMessages.pop();
                  outputMessage('NEW Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImagesIds.length +
                    '<br>NEW Images Saved: ' + savedImagesCount + ' of ' + neededImagesIds.length);
                });
              });
            }
            else {
              imagesFailedCount++;
              $log.error('Error downloading Image', neededImageId, 'Server Response:', response);
            }
          }, function (err) {
            imagesFailedCount++;
            $log.error('Error downloading Image', neededImageId, 'Error:', err);
          });
        promises.push(promise);
      });
      return $q.all(promises).then(function () {
        if (imagesFailedCount > 0) {
          downloadErrors = true;
          outputMessage('Image Downloads Failed: ' + imagesFailedCount);
        }
      });
    }

    function downloadProject() {
      notifyMessages = ['<ion-spinner></ion-spinner><br>Downloading Project...'];
      $ionicLoading.show({'template': notifyMessages});
      return ProjectFactory.loadProjectRemote(vm.project).then(function () {
        var deferred = $q.defer();
        var currentRequest = 0;

        // Download datasets synchronously
        function makeNextRequest() {
          downloadDataset(vm.activeDatasets[currentRequest]).then(function () {
            currentRequest++;
            if (currentRequest > 0 && currentRequest < vm.activeDatasets.length) {
              notifyMessages.push('------------------------');
              $ionicLoading.show({'template': notifyMessages.join('<br>')});
            }
            if (currentRequest < vm.activeDatasets.length) makeNextRequest();
            else deferred.resolve();
          });
        }

        if (currentRequest < vm.activeDatasets.length) makeNextRequest();
        else deferred.resolve();
        return deferred.promise;
      });
    }

    function downloadSpots(datasetId) {
      notifyMessages.push('Downloading Spots ...');
      return RemoteServerFactory.getDatasetSpots(datasetId, UserFactory.getUser().encoded_login)
        .then(function (response) {
          $log.log('Get DatasetSpots Response:', response);
          notifyMessages.pop();
          outputMessage('Downloaded Spots');
          var spots = {};
          if (response.data && response.data.features) spots = response.data.features;
          return {'spots': spots, 'datasetId': datasetId}
        }, function (err) {
          downloadErrors = true;
          notifyMessages.pop();
          outputMessage('Error Downloading Spots');
          if (err.statusText) outputMessage('Server Error: ' + err.statusText);
          throw err;
        });
    }

    function gatherNeededImages(spots) {
      var neededImagesIds = [];
      var promises = [];
      outputMessage('Determining needed images...');
      _.each(spots, function (spot) {
        if (spot.properties.images) {
          _.each(spot.properties.images, function (image) {
            var promise = ImageFactory.getImageById(image.id).then(function (value) {
              if (!value && !_.contains(neededImagesIds, image.id)) neededImagesIds.push(image.id);
            });
            promises.push(promise);
          });
        }
      });
      return $q.all(promises).then(function () {
        notifyMessages.pop();
        outputMessage('NEW images to download: ' + neededImagesIds.length);
        return neededImagesIds;
      });
    }

    function initializeDownloadDataset(dataset) {
      downloadErrors = false;
      // Make sure dataset exists on server first (ie. it is not a new dataset)
      RemoteServerFactory.getDataset(dataset.id, UserFactory.getUser().encoded_login).then(function () {
        notifyMessages = [];
        notifyMessages = ['<ion-spinner></ion-spinner>'];
        $ionicLoading.show({'template': notifyMessages});
        downloadDataset(dataset).then(function () {
          notifyMessages.splice(0, 1);
          if (!downloadErrors) outputMessage('<br>Dataset Updated Successfully!');
          else outputMessage('<br>Errors Updating Dataset!');
          setSpotsDataset();
        }, function (err) {
          notifyMessages.splice(0, 1);
          outputMessage('<br>Error Updating Dataset! Error:' + err);
        }).finally(function () {
          $ionicLoading.show({
            scope: $scope, template: notifyMessages.join('<br>') + '<br><br>' +
            '<a class="button button-clear button-outline button-light" ng-click="vm.hideLoading()">OK</a>'
          });
        });
      }, function () {
        setSpotsDataset();
      });
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
      $ionicLoading.show();
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
      $ionicLoading.hide();
    }

    function loadProjectRemote(project) {
      $ionicLoading.show();
      destroyProject().then(function () {
        ProjectFactory.loadProjectRemote(project).then(function () {
          vm.closeModal();
          initializeProject();
        }, function (err) {
          $ionicPopup.alert({
            'title': 'Error communicating with server!',
            'template': err
          });
          $ionicLoading.hide();
        });
      }, function () {
        $ionicLoading.hide();
      });
    }

    function outputMessage(msg) {
      notifyMessages.push(msg);
      $ionicLoading.show({'template': notifyMessages.join('<br>')});
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

    function saveSpot(spot, datasetId) {
      // If the geometry coordinates contain any null values, delete the geometry; it shouldn't be defined
      if (spot.geometry && spot.geometry.coordinates) {
        if (_.indexOf(_.flatten(spot.geometry.coordinates), null) !== -1) {
          delete spot.geometry;
        }
      }
      return SpotFactory.saveDownloadedSpot(spot).then(function () {
        ProjectFactory.addSpotToDataset(spot.properties.id, datasetId);
      });
    }

    function saveSpots(data) {
      var spots = data.spots;
      var datasetId = data.datasetId;
      var originalSpotsIds = ProjectFactory.getSpotIds()[datasetId];
      //$log.log(spots);
      var promises = [];
      var spotsNeededCount = 0;
      var spotsSavedCount = 0;
      $ionicLoading.show({'template': notifyMessages.join('<br>')});
      _.each(spots, function (spot) {
        // Only need to save Spot if downloaded Spot differs from local Spot
        if (!_.isEqual(spot, SpotFactory.getSpotById(spot.properties.id))) {
          //$log.log('New/Modified Spot:', spot);
          spotsNeededCount++;
          var promise = saveSpot(spot, datasetId)
            .then(function () {
              spotsSavedCount++;
              notifyMessages.pop();
              outputMessage('NEW/MODIFIED Spots Saved: ' + spotsSavedCount + ' of ' + spotsNeededCount);
            });
          promises.push(promise);
        }
      });
      outputMessage('NEW/MODIFIED Spots to save: ' + spotsNeededCount);
      return $q.all(promises).then(function () {
        $log.log('Finished saving Spots');
        // Delete Spots for this dataset that are stored locally but are not on the server
        var downloadedSpotsIds = _.map(spots, function (spot) {
          return spot.properties.id;
        });
        var spotsToDestroyIds = _.difference(originalSpotsIds, downloadedSpotsIds);
        if (spotsToDestroyIds.length > 0) $log.log('Spots to destroy bc they are not on server', spotsToDestroyIds);
        _.each(spotsToDestroyIds, function (spotToDestroyId) {
          SpotFactory.destroy(spotToDestroyId);
        });
        return spots;
      });
    }

    function upload() {
      notifyMessages = ['<ion-spinner></ion-spinner><br>'];
      return uploadProject()
        .then(uploadDatasets)
        .catch(function (err) {
          uploadErrors = true;
          throw err;
        });
    }

    function uploadDataset(dataset) {
      var deferred = $q.defer(); // init promise
      outputMessage('Uploading Dataset ' + dataset.name + '...');
      var project = ProjectFactory.getCurrentProject();

      RemoteServerFactory.updateDataset(dataset, UserFactory.getUser().encoded_login)
        .then(function (response) {
          $log.log('Finished updating dataset', dataset, '. Response:', response);
          return RemoteServerFactory.addDatasetToProject(project.id, dataset.id, UserFactory.getUser().encoded_login)
            .then(function (response2) {
                $log.log('Finished adding dataset to project', project, '. Response:', response2);
                return uploadSpots(dataset).then(function () {
                  deferred.resolve();
                });
              },
              function (err) {
                uploadErrors = true;
                $log.log('Error adding dataset to project. Response:', err);
                outputMessage('Error Updating Dataset.');
                if (err.statusText) outputMessage('Server Error: ' + err.statusText);
                deferred.resolve();
              });
        }, function (err) {
          uploadErrors = true;
          outputMessage('Error Updating Dataset.');
          if (err.statusText) outputMessage('Server Error: ' + err.statusText);
          deferred.resolve();
        });
      return deferred.promise;
    }

    function uploadDatasets() {
      var deferred = $q.defer(); // init promise
      var datasets = ProjectFactory.getActiveDatasets();
      var currentRequest = 0;

      // Upload datasets synchronously
      function makeNextRequest() {
        uploadDataset(datasets[currentRequest]).then(function () {
          currentRequest++;
          if (currentRequest > 0 && currentRequest < datasets.length) {
            notifyMessages.push('------------------------');
            $ionicLoading.show({'template': notifyMessages.join('<br>')});
          }
          if (currentRequest < datasets.length) makeNextRequest();
          else deferred.resolve();
        });
      }

      if (currentRequest < datasets.length) makeNextRequest();
      else deferred.resolve();
      return deferred.promise;
    }

    function uploadImages(spots) {
      var imagesToUpload = [];
      var imagesToUploadCount = 0;
      var imagesUploadedCount = 0;
      var imagesUploadFailedCount = 0;
      var promises = [];
      outputMessage('Checking Images to Upload...');
      _.each(spots, function (spot) {
        _.each(spot.properties.images, function (image) {
          var promise = RemoteServerFactory.verifyImageExistance(image.id, UserFactory.getUser().encoded_login).then(
            function (response) {
              $log.log('Image', image, 'in Spot', spot.properties.id, spot, 'EXISTS on server. Server response',
                response);
            },
            function () {
              imagesToUpload.push(image);
              imagesToUploadCount++;
              notifyMessages.pop();
              outputMessage('Images to Upload: ' + imagesToUploadCount);
              return ImageFactory.getImageById(image.id).then(function (src) {
                if (src) {
                  return RemoteServerFactory.uploadImage(image.id, src, UserFactory.getUser().encoded_login).then(
                    function () {
                      imagesUploadedCount++;
                      notifyMessages.pop();
                      outputMessage('Images Uploaded: ' + imagesUploadedCount + ' of ' + imagesToUploadCount);
                    }, function () {
                      uploadErrors = true;
                      imagesUploadFailedCount++;
                    });
                }
                else {
                  $log.log('No image source found for image', image.id, 'in Spot', spot.properties.id, spot);
                  uploadErrors = true;
                  imagesUploadFailedCount++;
                  return $q.when(null);
                }
              });
            });
          promises.push(promise);
        });
      });
      return $q.all(promises).then(function () {
        if (imagesToUploadCount === 0) {
          notifyMessages.pop();
          outputMessage('No NEW Images to Upload');
        }
        else {
          outputMessage('Finished Uploading Images');
          if (imagesUploadFailedCount > 0) outputMessage('Images Failed: ' + imagesUploadFailedCount);
        }
      });
    }

    function uploadProject() {
      var deferred = $q.defer(); // init promise
      var project = angular.fromJson(angular.toJson(ProjectFactory.getCurrentProject()));
      if (!_.isEmpty(OtherMapsFactory.getOtherMaps())) project.other_maps = OtherMapsFactory.getOtherMaps();
      RemoteServerFactory.updateProject(project, UserFactory.getUser().encoded_login).then(
        function (response) {
          $log.log('Finished uploading project', project, '. Response:', response);
          notifyMessages.push('Uploaded project properties.');
          $ionicLoading.show({'template': notifyMessages.join('<br>')});
          deferred.resolve();
        },
        function (response) {
          uploadErrors = true;
          $log.log('Error uploading project', project, '. Response:', response);
          if (response.data && response.data.Error) deferred.reject(response.data.Error);
          deferred.reject();
        });
      return deferred.promise;
    }

    function uploadSpots(dataset) {
      var spots = SpotFactory.getSpotsByDatasetId(dataset.id);
      var totalSpotCount = _.size(spots);

      _.each(spots, function (spot) {
        spot = checkValidDateTime(spot);
        // ToDo: With new image database src isn't supposed to be in Spot but leave this code for now just in case
        _.each(spot.properties.images, function (image, i) {
          spot.properties.images[i] = _.omit(image, 'src');
        });
      });

      if (_.isEmpty(spots)) {
        outputMessage('No Spots to Upload');
        return $q.when(null);
      }
      else {
        // Create a feature collection of spots to upload for this dataset
        var spotCollection = {
          'type': 'FeatureCollection',
          'features': _.values(spots)
        };
        outputMessage('Uploading ' + totalSpotCount + ' Spots...');
        return RemoteServerFactory.updateDatasetSpots(dataset.id, spotCollection,
          UserFactory.getUser().encoded_login).then(
          function () {
            notifyMessages.pop();
            outputMessage('Finished Uploading ' + totalSpotCount + ' Spots');
            return uploadImages(spots);
          }, function (err) {
            uploadErrors = true;
            outputMessage('Error updating Spots in dataset' + dataset.name);
            if (err && err.data && err.data.Error) $log.error(err.data.Error);
            if (err && err.statusText) outputMessage('Server Error: ' + err.statusText);
            return $q.when(null);
          });
      }
    }

    /**
     * Public Functions
     */

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
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner>'});
      destroyProject().then(function () {
        ProjectFactory.createNewProject(vm.data).then(function () {
          $log.log('Save Project to LiveDB:', ProjectFactory.getCurrentProject());
          LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
          $ionicLoading.hide();
          vm.closeModal();
          initializeProject();
        });
      });
    }

    /*function doSync() {
     if (isSyncReady()) {
     vm.showOfflineWarning = false;
     SyncFactory.downloadProject(vm.project, UserFactory.getUser().encoded_login).then(function (msg) {
     $log.log(msg);
     SyncFactory.doDownloadDatasets(vm.activeDatasets, UserFactory.getUser().encoded_login).then(function () {
     $log.log('Finished sync');
     });

     //downloadProject().then(function () {
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

    function areDatasetsOn() {
      return !_.isEmpty(vm.activeDatasets);
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

    function hideLoading() {
      $ionicLoading.hide();
    }

    function initializeDownload() {
      downloadErrors = false;
      var downloadConfirmText = '';
      if (_.isEmpty(vm.activeDatasets)) {
        downloadConfirmText = 'No active datasets! Project properties will be downloaded and will REPLACE' +
          ' local project properties. Continue?'
      }
      else {
        var names = _.pluck(vm.activeDatasets, 'name');
        downloadConfirmText = 'Project properties and datasets <b>' + names.join(', ') + '</b> will be downloaded' +
          ' and will REPLACE local copies. Continue?';
      }
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Download Project!',
        'template': downloadConfirmText
      });
      confirmPopup.then(function (res) {
        if (res) {
          downloadProject().then(function () {
            notifyMessages.splice(0, 1);
            if (!downloadErrors) outputMessage('<br>Project Updated Successfully!');
            else outputMessage('<br>Errors Updating Project!');
            initializeProject();
          }, function (err) {
            notifyMessages.splice(0, 1);
            outputMessage('<br>Error Updating Project! Error:' + err);
          }).finally(function () {
            $ionicLoading.show({
              scope: $scope, template: notifyMessages.join('<br>') + '<br><br>' +
              '<a class="button button-clear button-outline button-light" ng-click="vm.hideLoading()">OK</a>'
            });
          });
        }
      });
    }

    function initializeUpload() {
      var deferred = $q.defer(); // init promise
      uploadErrors = false;
      var uploadConfirmText = '';
      if (_.isEmpty(vm.activeDatasets)) {
        uploadConfirmText = 'No active datasets! Project properties will be uploaded and will REPLACE' +
          ' project properties on the server. Continue?';
      }
      else {
        var names = _.pluck(vm.activeDatasets, 'name');
        uploadConfirmText = 'Project properties and datasets <b>' + names.join(', ') + '</b> will be uploaded' +
          ' and will REPLACE copies on the server. Continue?'
      }
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Upload Project!',
        'template': uploadConfirmText
      });
      confirmPopup.then(function (res) {
        if (res) {
          notifyMessages = [];
          $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Uploading...'});
          upload().then(function () {
            notifyMessages.splice(0, 1); // Remove spinner
            if (uploadErrors) outputMessage('<br>Project Finished Uploading but with Errors!');
            else outputMessage('<br>Project Uploaded Successfully!');
            deferred.resolve();
          }, function (err) {
            notifyMessages.splice(0, 1); // Remove spinner
            outputMessage('<br>Error Uploading Project!');
            if (err) outputMessage('Server Error: ' + err);
            deferred.reject();
          }).finally(function () {
            $ionicLoading.show({
              scope: $scope, template: notifyMessages.join('<br>') + '<br><br>' +
              '<a class="button button-clear button-outline button-light" ng-click="vm.hideLoading()">OK</a>'
            });
          });
        }
        else deferred.resolve();
      });
      return deferred.promise;
    }

    function isDatasetOn(dataset) {
      return _.find(vm.activeDatasets, function (datasetOn) {
        return datasetOn.id === dataset.id;
      });
    }

    function isSyncReady() {
      return ProjectFactory.isSyncReady();
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
        if (_.isEmpty(vm.project)) loadProjectRemote(project);
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
                loadProjectRemote(project);
              }, function () {
                var confirmPopup2 = $ionicPopup.confirm({
                  'title': 'Upload Error',
                  'template': 'Your current project, ' + vm.project.description.project_name + ', cannot be' +
                  ' uploaded to the server at this time so it will be overwritten by the project, ' + project.name +
                  '. Are you sure you want to delete the project ' + vm.project.description.project_name + ' including' +
                  ' all datasets and Spots contained within the project?'
                });
                confirmPopup2.then(function (res2) {
                  if (res2) loadProjectRemote(project);
                });
              });
            }
            else loadProjectRemote(project);
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
        if (_.isEmpty(ProjectFactory.getSpotIds()[datasetToggled.id]) && !_.isEmpty(
            UserFactory.getUser()) && navigator.onLine) {
          initializeDownloadDataset(datasetToggled);
        }
        else if (_.isEmpty(ProjectFactory.getSpotIds()[datasetToggled.id]) && !_.isEmpty(
            UserFactory.getUser()) && !navigator.onLine) {
          $ionicPopup.alert({
            'title': 'Cannot Update Dataset!',
            'template': 'Unable to reach the server to check if there are already Spots in this dataset to download.'
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
