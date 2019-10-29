(function () {
  'use strict';

  angular
    .module('app')
    .controller('ManageProjectController', ManageProjectController);

  ManageProjectController.$inject = ['$document', '$ionicModal', '$ionicLoading', '$ionicPopover', '$ionicPopup',
    '$log', '$scope', '$state', '$q', '$window', 'FormFactory', 'HelpersFactory', 'ImageFactory', 'LiveDBFactory',
    'LocalStorageFactory', 'OtherMapsFactory', 'ProjectFactory', 'RemoteServerFactory', 'SpotFactory', 'UserFactory',
    'IS_WEB'];

  function ManageProjectController($document, $ionicModal, $ionicLoading, $ionicPopover, $ionicPopup, $log, $scope,
                                   $state, $q, $window, FormFactory, HelpersFactory, ImageFactory, LiveDBFactory,
                                   LocalStorageFactory, OtherMapsFactory, ProjectFactory, RemoteServerFactory,
                                   SpotFactory, UserFactory, IS_WEB) {
    var vm = this;

    var downloadErrors = false;
    var neededEditedImagesIds = [];
    var notifyMessages = [];
    var uploadErrors = false;
    var user = UserFactory.getUser();

    vm.activeDatasets = [];
    vm.data = {};
    vm.datasets = [];
    vm.exportFileName = undefined;
    vm.exportForDistFileName = undefined;
    vm.exportForAVOFileName = undefined;
    vm.exportItems = {};
    vm.fileBrowserModal = {};
    vm.importItem = undefined;
    vm.newDatasetName = '';
    vm.newProjectModal = {};
    vm.otherFeatureTypes = [];
    vm.popover = {};
    vm.project = {};
    vm.projects = [];
    vm.showNewProject = false;
    vm.showNewProjectDetail = false;
    vm.showExitProjectModal = true;
    vm.showProject = false;
    vm.showProjectButtons = false;
    vm.switchProjectModal = {};
    vm.titleText = 'Manage Projects';

    vm.areDatasetsOn = areDatasetsOn;
    vm.deleteDataset = deleteDataset;
    vm.deleteProject = deleteProject;
    vm.deleteType = deleteType;
    vm.exportAVOCSV = exportAVOCSV;
    vm.exportProject = exportProject;
    vm.exportProjectForDistribution = exportProjectForDistribution;
    vm.filterDefaultTypes = filterDefaultTypes;
    vm.getNumberOfSpots = getNumberOfSpots;
    vm.goToProjectDescription = goToProjectDescription;
    vm.hideLoading = hideLoading;
    vm.importProject = importProject;
    vm.importProjectForDistribution = importProjectForDistribution;
    vm.importSelectedFile = importSelectedFile;
    vm.importSelectedFileForDistribution = importSelectedFileForDistribution;
    vm.initializeUpload = initializeUpload;
    vm.initializeDownload = initializeDownload;
    vm.isDatasetOn = isDatasetOn;
    vm.isSyncReady = isSyncReady;
    vm.newDataset = newDataset;
    vm.newProject = newProject;
    vm.selectProject = selectProject;
    vm.setSpotsDataset = setSpotsDataset;
    vm.startNewProject = startNewProject;
    vm.switchProject = switchProject;
    vm.syncDataset = syncDataset;
    vm.toggleDataset = toggleDataset;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      initializeProject();
      createPageInteractions();

      ProjectFactory.setUser(user);
      FormFactory.setForm('project');
      if (!IS_WEB && $window.cordova) LocalStorageFactory.checkImagesDir();
      if (!IS_WEB && !$window.cordova) $log.warn('Not Web but unable get image directory. Running for development?');

      if (_.isEmpty(vm.project)) {
        vm.showExitProjectModal = false;
        var startPopupText = 'Please create a new project to continue.';
        if (vm.isSyncReady()) {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Set Your Project',
            template: 'Please create a new project or open an existing project to continue.',
            okText: 'Select Existing Project',

            cancelText: 'Create New Project',
            cancelType: 'button-positive'
          });
          confirmPopup.then(function (res) {
            if (res) switchProject();
            else startNewProject()
          });
        }
        else {
          var alertPopup = $ionicPopup.alert({
            title: 'Welcome to StraboSpot',
            template: 'Please press OK below and create a new project to continue.'
          });
          alertPopup.then(function (res) {
            startNewProject()
          });
        }
      }
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

    function createPageInteractions() {
      $ionicModal.fromTemplateUrl('app/project/manage/new-project-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.newProjectModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/project/manage/switch-project-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.switchProjectModal = modal;
      });

      $ionicPopover.fromTemplateUrl('app/project/manage/manage-project-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      $ionicModal.fromTemplateUrl('app/project/manage/file-browser-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.fileBrowserModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/project/manage/file-for-distribution-browser-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.fileForDistributionBrowserModal = modal;
      });

      // Cleanup the modal and popover when we're done with them
      $scope.$on('$destroy', function () {
        vm.switchProjectModal.remove();
        vm.newProjectModal.remove();
        vm.popover.remove();
      });
    }

    function destroyProject() {
      return ProjectFactory.destroyProject().then(function () {
        return SpotFactory.clearAllSpots()/*.then(function () {
          return ImageFactory.deleteAllImages();
        })*/;
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
          if (!downloadErrors) deferred.resolve();
          else deferred.reject('ERROR');
        })
        .catch(function (err) {
          downloadErrors = true;
          $log.log('Error downloading dataset.', err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function downloadImage(imageId, encodedLogin) {
      var deferred = $q.defer(); // init promise

      var serverURL = RemoteServerFactory.getDbUrl();
      var lastOccur = serverURL.lastIndexOf("/");
      var url = serverURL.substr(0, lastOccur) + '/pi/' + imageId;

      //var url = 'https://strabospot.org/pi/' + imageId; //change this to look at db location
      var devicePath = LocalStorageFactory.getDevicePath();
      var imagesDirectory = LocalStorageFactory.getImagesDirectory();
      var fileTransfer = new FileTransfer();

      LocalStorageFactory.checkImagesDir().then(function () {
        fileTransfer.download(url, devicePath + imagesDirectory + '/' + imageId + '.jpg', function (entry) {
          console.log('download complete: ' + entry.toURL());
          deferred.resolve();
        }, function (error) {
          $log.log('image download error: ', error);
          deferred.reject(error);
        });
      });

      return deferred.promise;
    }

    function downloadImages(neededImagesIds) {
      if (!IS_WEB && $window.cordova && neededImagesIds.length > 0) {
        var promises = [];
        var imagesDownloadedCount = 0;
        var imagesFailedCount = 0;
        var savedImagesCount = 0;

        return LocalStorageFactory.checkImagesDir().then(function () {
          _.each(neededImagesIds, function (neededImageId) {
            var promise = downloadImage(neededImageId, UserFactory.getUser().encoded_login)
              .then(function () {
                imagesDownloadedCount++;
                savedImagesCount++;
                notifyMessages.pop();
                outputMessage(
                  'NEW/MODIFIED Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImagesIds.length +
                  '<br>NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImagesIds.length);
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
        });
      }
      else if (!IS_WEB && !$window.cordova && neededImagesIds.length > 0) {
        $log.warn('No Cordova so unable to download images. Running for development?');
        notifyMessages.pop();
        outputMessage('Unable to Download Images');
      }
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
          }, function (err) {
            deferred.reject(err);
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

    function exportData() {
      var deferred = $q.defer(); // init promise
      var dateString = ProjectFactory.getTimeStamp();
      vm.exportFileName = dateString + '_' + vm.project.description.project_name.replace(/\s/g, '');
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="vm.exportFileName">',
        title: 'Confirm or Change File Name',
        subTitle: 'If you change the file name please do not use spaces, special characters (except a dash or underscore) or add a file extension.',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!vm.exportFileName) e.preventDefault();
              else return vm.exportFileName = vm.exportFileName.replace(/[^\w- ]/g, '');
            }
          }
        ]
      });

      myPopup.then(function (res) {
        if (res) {
          $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Exporting Project Text Data...'});
          LocalStorageFactory.exportProject(vm.exportFileName).then(function (filePath) {
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'Project text data written to ' + filePath
            }).then(function () {
              deferred.resolve();
            });
          }, function (err) {
            $ionicPopup.alert({
              'title': 'Error!',
              'template': 'Error exporting project text data. ' + err + ' Ending export.'
            }).then(function () {
              deferred.reject();
            });
          }).finally(function () {
            $ionicLoading.hide();
          });
        }
      });
      return deferred.promise;
    }

    function exportDataForDistribution() {
      var deferred = $q.defer(); // init promise
      var dateString = ProjectFactory.getTimeStamp();
      vm.exportForDistFileName = dateString + '_' + vm.project.description.project_name.replace(/\s/g, '');
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="vm.exportForDistFileName">',
        title: 'Confirm or Change Folder Name',
        subTitle: 'If you change the folder name please do not use spaces, special characters (except a dash or underscore) or add a file extension.',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!vm.exportForDistFileName) e.preventDefault();
              else return vm.exportForDistFileName = vm.exportForDistFileName.replace(/[^\w- ]/g, '');
            }
          }
        ]
      });

      myPopup.then(function (res) {
        if (res) {
          $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Exporting Data...'});
          LocalStorageFactory.exportProjectForDistribution(vm.exportForDistFileName).then(function (filePath) {
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'Project data written to ' + filePath
            }).then(function () {
              deferred.resolve();
            });
          }, function (err) {
            $ionicPopup.alert({
              'title': 'Error!',
              'template': 'Error exporting project data. ' + err + ' Ending export.'
            }).then(function () {
              deferred.reject();
            });
          }).finally(function () {
            $ionicLoading.hide();
          });
        }
      });
      return deferred.promise;
    }

    function exportProjectForDistribution() {
      vm.popover.hide().then(function () {
        exportDataForDistribution();
      });
    }

    function exportDataForAVOCSV() {
      var deferred = $q.defer(); // init promise
      var dateString = ProjectFactory.getTimeStamp();
      vm.exportForAVOFileName = dateString + '_' + vm.project.description.project_name.replace(/\s/g, '');
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="vm.exportForAVOFileName">',
        title: 'Confirm or Change CSV File Name',
        subTitle: 'If you change the file name please do not use spaces, special characters (except a dash or underscore) or add a file extension.',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!vm.exportForAVOFileName) e.preventDefault();
              else return vm.exportForAVOFileName = vm.exportForAVOFileName.replace(/[^\w- ]/g, '');
            }
          }
        ]
      });

      myPopup.then(function (res) {
        if (res) {
          $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Exporting Data...'});
          LocalStorageFactory.exportProjectForAVO(vm.exportForAVOFileName).then(function (filePath) {

            var templateText = "";
            if (LocalStorageFactory.getDeviceName() == "iOS") {
              templateText = 'AVO data has been written to /StraboCSV/' + filePath + '.csv and data has been copied to clipboard.';
            }
            else templateText = 'AVO data has been written to /StraboCSV/' + filePath + '.csv';

            $ionicPopup.alert({
              'title': 'Success!',
              'template': templateText
            }).then(function () {
              deferred.resolve();
            });
          }, function (err) {
            $ionicPopup.alert({
              'title': 'Error!',
              'template': 'Error exporting CSV data. ' + err + ''
            }).then(function () {
              deferred.reject();
            });
          }).finally(function () {
            $ionicLoading.hide();
          });
        }
      });
      return deferred.promise;
    }

    function exportAVOCSV() {
      vm.popover.hide().then(function () {
        exportDataForAVOCSV();
      });
    }

    // Determine which images aren't already on the device and need to be downloaded
    function gatherNeededImages(spots) {
      var neededImagesIds = [];
      if (!IS_WEB && $window.cordova) {
        var promises = [];
        outputMessage('Determining needed images...');
        _.each(spots, function (spot) {
          if (spot.properties.images) {
            _.each(spot.properties.images, function (image) {
              var promise = LocalStorageFactory.getImageById(image.id)
                .then(function (src) {
                  if (src === 'img/image-not-found.png') {
                    $log.log('Need to download image', image.id);
                    neededImagesIds.push(image.id);
                  }
                  else $log.log('Image', image.id, 'already exists on device. Not downloading.');
                });
              promises.push(promise);
            });
          }
        });
        return Promise.all(promises).then(function () {
          notifyMessages.pop();
          outputMessage('NEW images to download: ' + neededImagesIds.length +
            '<br> MODIFIED images to download: ' + neededEditedImagesIds.length);
          neededImagesIds = _.union(neededImagesIds, neededEditedImagesIds);
          return Promise.resolve(neededImagesIds);
        });
      }
      else if (!IS_WEB && !$window.cordova) {
        $log.warn('No Cordova so unable to download images. Running for development?');
        notifyMessages.pop();
        outputMessage('Unable to Download Images');
        return Promise.resolve(neededImagesIds);
      }
    }

    function importData() {
      vm.fileNames = [];

      LocalStorageFactory.gatherLocalFiles().then(function (entries) {
        //$log.log(entries);
        _.each(_.pluck(entries, 'name'), function (file) {
          if (file.endsWith('.json')) vm.fileNames.push(file.split('.')[0]);
        });
        if (!_.isEmpty(vm.fileNames)) vm.fileBrowserModal.show();
        else {
          $ionicPopup.alert({
            'title': 'Files Not Found!',
            'template': 'No valid files to import found. Export a file first.'
          });
        }
      }, function (err) {
        if (err === 1) {
          $ionicPopup.alert({
            'title': 'Import Folder Not Found!',
            'template': 'The StraboSpot folder was not found. Export a file first or create this folder and add a valid project file.'
          });
        }
        else {
          $ionicPopup.alert({
            'title': 'Error!',
            'template': 'Error finding local files. Error code: ' + err
          });
        }
      });
    }

    function importDataForDistribution() {
      vm.fileForDistributionNames = [];

      LocalStorageFactory.gatherLocalDistributionFiles().then(function (entries) {
        $log.log("Distributed Files: ", entries);
        _.each(_.pluck(entries, 'name'), function (file) {
          if (file.charAt(0) != '.') {
            vm.fileForDistributionNames.push(file);
          }
        });
        if (!_.isEmpty(vm.fileForDistributionNames)) vm.fileForDistributionBrowserModal.show();
        else {
          $ionicPopup.alert({
            'title': 'Files Not Found!',
            'template': 'No valid files to import found. Export a file first.'
          });
        }
      }, function (err) {
        if (err === 1) {
          $ionicPopup.alert({
            'title': 'Import Folder Not Found!',
            'template': 'The StraboSpot folder was not found. Export a file first or create this folder and add a valid project file.'
          });
        }
        else {
          $ionicPopup.alert({
            'title': 'Error!',
            'template': 'Error finding local files. Error code: ' + err
          });
        }
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
          outputMessage('<br>Error Updating Dataset! Error: ' + err);
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
          vm.switchProjectModal.hide();
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

    function reloadProject() {
      $log.log('Reloading project ...');
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Reloading Project..'});
      ProjectFactory.prepProject().then(function () {
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Reloaded Project<br>Loading Spots...'});
        SpotFactory.loadSpots().then(function () {
          $ionicLoading.hide();
          $ionicPopup.alert({
            'title': 'Success!',
            'template': 'Finished importing project.'
          });
          $state.reload();
        });
      });
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
        var savedSpot = SpotFactory.getSpotById(spot.properties.id);
        if (!_.isEqual(spot, savedSpot)) {
          $log.log('New/Modified Spot:', spot);
          spotsNeededCount++;

          // Check for edited Images that need to be downloaded
          if (spot.properties.images && savedSpot.properties.images) {
            _.each(spot.properties.images, function (image) {
              var editedImageProps = _.find(savedSpot.properties.images, function (savedImage) {
                return savedImage.id && image.id && savedImage.id === image.id && image.modified_timestamp
                  && savedImage.modified_timestamp && image.modified_timestamp > savedImage.modified_timestamp;
              });
              if (editedImageProps) neededEditedImagesIds.push(editedImageProps.id);
            });
          }

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
          $log.error('Upload errors');
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
          RemoteServerFactory.addDatasetToProject(project.id, dataset.id, UserFactory.getUser().encoded_login)
            .then(function (response2) {
                $log.log('Finished adding dataset to project', project, '. Response:', response2);
                uploadSpots(dataset).then(function () {
                  $log.log('Uploaded Spots');
                  deferred.resolve();
                }, function () {
                  $log.log('Error uploading Spots');
                  deferred.reject();
                });
              },
              function (err) {
                uploadErrors = true;
                $log.error('Error adding dataset to project. Response:', err);
                outputMessage('Error Updating Dataset.');
                if (err.statusText) outputMessage('Server Error: ' + err.statusText);
                deferred.reject();
              });
        }, function (err) {
          uploadErrors = true;
          $log.log('Error updating dataset');
          outputMessage('Error Updating Dataset.');
          if (err.statusText) outputMessage('Server Error: ' + err.statusText);
          deferred.reject();
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
        }, function () {
          $log.error('Error uploading dataset.');
          deferred.reject('Error uploading dataset.');
        });
      }

      if (currentRequest < datasets.length) makeNextRequest();
      else deferred.resolve();
      return deferred.promise;
    }

    function uploadImages(spots) {
      return new Promise(function (resolve, reject1) {
        spots = _.values(spots);
        var imagesToUploadCount = 0;
        var imagesUploadedCount = 0;
        var imagesUploadFailedCount = 0;
        var iSpotLoop = 0;
        var iImagesLoop = 0;

        outputMessage('Gathering Images to Upload...');

        function areMoreImages(spot) {
          return _.has(spot, 'properties') && _.has(spot.properties,
            'images') && iImagesLoop < spot.properties.images.length;
        }

        function areMoreSpots() {
          return iSpotLoop + 1 < spots.length;
        }

        // Upload images synchronously
        function makeNextSpotRequest(spot) {
          if (areMoreImages(spot)) {
            $log.log('Found image:', spot.properties.images[iImagesLoop].id, spot.properties.images[iImagesLoop],
              'in Spot:', spot);
            makeNextImageRequest(spot.properties.images[iImagesLoop]).then(function () {
              makeNextSpotRequest(spots[iSpotLoop]);
            });
          }
          else if (areMoreSpots()) {
            iSpotLoop++;
            iImagesLoop = 0;
            makeNextSpotRequest(spots[iSpotLoop]);
          }
          else {
            if (imagesToUploadCount === 0) {
              notifyMessages.pop();
              outputMessage('No NEW Images to Upload');
            }
            else {
              outputMessage('Finished Uploading Images');
              if (imagesUploadFailedCount > 0) outputMessage('Images Failed: ' + imagesUploadFailedCount);
            }
            resolve();
          }
        }

        function makeNextImageRequest(imageProps) {
          return shouldUploadImage(imageProps)
            .then(getImageFile)
            .then(convertImageFile)
            .then(uploadImage)
            .catch(function (err) {
              if (err !== 'already exists') {
                uploadErrors = true;
                imagesUploadFailedCount++;
                $log.error(err);
              }
            })
            .finally(function () {
              iImagesLoop++;
              return Promise.resolve();
            })
        }

        function shouldUploadImage(imageProps) {
          return RemoteServerFactory.verifyImageExistance(imageProps.id, UserFactory.getUser().encoded_login)
            .then(function (response) {
              if (response.data
                && ((response.data.modified_timestamp && imageProps.modified_timestamp
                  && imageProps.modified_timestamp > response.data.modified_timestamp)
                || (!response.data.modified_timestamp && imageProps.modified_timestamp))) {
                $log.log('Need to upload image:', imageProps.id);
                imagesToUploadCount++;
                notifyMessages.pop();
                return Promise.resolve(imageProps);
              }
              else {
                $log.log('No need to upload image:', imageProps.id, 'Server response:', response);
                return Promise.reject('already exists');
              }
            }, function () {
              $log.log('Need to upload image:', imageProps.id);
              imagesToUploadCount++;
              notifyMessages.pop();
              return Promise.resolve(imageProps);
            });
        }

        function getImageFile(imageProps) {
          outputMessage('Processing image...');
          $log.log('Getting file URI ...');
          return ImageFactory.getImageFileURIById(imageProps.id).then(function (src) {
            if (src !== 'img/image-not-found.png') {
              $log.log('Got file URI for image', imageProps.id, src);
              return Promise.resolve([imageProps, src]);
            }
            else return Promise.reject('Local file not found for image', imageProps.id);
          }, function () {
            return Promise.reject('Local file not found for image', imageProps.id);
          });
        }

        function convertImageFile(data) {
          var imageProps = data[0];
          var src = data[1];
          $log.log('Converting file URI to Blob...');
          return HelpersFactory.fileURItoBlob(src).then(function (blob) {
            $log.log('Finished converting file URI to blob for image', imageProps.id);
            return Promise.resolve([imageProps, blob]);
          }, function () {
            return Promise.reject('Error converting file URI to blob for image', imageProps.id);
          });
        }

        function uploadImage(data) {
          var imageProps = data[0];
          var blob = data[1];
          notifyMessages.pop();
          var count = imagesUploadedCount + 1;
          outputMessage('Uploading image ' + count + '...');
          $log.log('Uploading image', imageProps.id, 'to server...');
          return RemoteServerFactory.uploadImage(imageProps, blob, UserFactory.getUser().encoded_login).then(function () {
            imagesUploadedCount++;
            notifyMessages.pop();
            outputMessage('Images Uploaded: ' + imagesUploadedCount);
            $log.log('Finished uploading image', imageProps.id, 'to the server');
            return Promise.resolve();
          }, function () {
            return Promise.reject('Error uploading image', imageProps.id);
          });
        }

        if (iSpotLoop < spots.length) makeNextSpotRequest(spots[iSpotLoop]);
        else resolve();
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
        return RemoteServerFactory.updateDatasetSpots(dataset.id, spotCollection, UserFactory.getUser().encoded_login)
          .then(function () {
            notifyMessages.pop();
            outputMessage('Finished Uploading ' + totalSpotCount + ' Spots');
            return uploadImages(spots);
          }, function (err) {
            uploadErrors = true;
            outputMessage('Error updating Spots in dataset' + dataset.name);
            if (err && err.data && err.data.Error) $log.error(err.data.Error);
            if (err && err.statusText) outputMessage('Server Error: ' + err.statusText);
            return Promise.reject('Error updating Spots in dataset');
          });
      }
    }

    /**
     * Public Functions
     */

    function areDatasetsOn() {
      return !_.isEmpty(vm.activeDatasets);
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
          'title': 'Delete Dataset Warning!',
          'template': 'Are you sure you want to <span style="color:red">DELETE</span> the Dataset' +
            ' <b>' + dataset.name + '</b>? This will also delete the Spots in this dataset.',
          'cssClass': 'warning-popup'
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
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Project Warning!',
        'template': 'Are you sure you want to <span style="color:red">DELETE</span> the project' +
          ' <b>' + project.name + '</b>. This will also delete all datasets and Spots contained within the project.',
        'cssClass': 'warning-popup'
      });
      confirmPopup.then(function (res) {
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
          vm.newProjectModal.hide();
          initializeProject();
        });
      });
    }

    function exportProject() {
      vm.popover.hide().then(function () {
        exportData();
      });
    }

    function filterDefaultTypes(type) {
      return _.indexOf(ProjectFactory.getDefaultOtherFeatureTypes(), type) === -1;
    }

    function getNumberOfSpots(dataset) {
      var spots = ProjectFactory.getSpotIds()[dataset.id];
      if (_.isEmpty(spots)) return '(0 Spots)';
      else if (spots.length === 1) return '(1 Spot)';
      return '(' + spots.length + ' Spots)';
    }

    function goToProjectDescription() {
      $state.go('app.description');
    }

    function hideLoading() {
      $ionicLoading.hide();
    }


    function importProject() {
      vm.popover.hide().then(function () {
        importData();
      });
    }

    function importProjectForDistribution() {
      vm.popover.hide().then(function () {
        importDataForDistribution();
      });
    }

    function importSelectedFile(name) {
      vm.fileBrowserModal.hide().then(function () {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Warning!!!',
          'template': 'This will <span style="color:red">OVERWRITE</span> the current open project. Do you want to continue?',
          'cssClass': 'warning-popup'
        });
        confirmPopup.then(function (res) {
          if (res) {
            $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Destroying Current Project..'});
            $log.log('Destroying current project ...');
            var promises = [];
            promises.push(ProjectFactory.destroyProject());
            promises.push(SpotFactory.clearAllSpots());
            //promises.push(ImageFactory.deleteAllImages());

            $q.all(promises).then(function () {
              $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Importing Project..'});
              LocalStorageFactory.importProject(name + '.json').then(function () {
                reloadProject();
              }, function (err) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                  'title': 'Error!',
                  'template': 'Error importing project. ' + err
                });
              });
            });
          }
        });
      });
    }

    function importSelectedFileForDistribution(name) {
      vm.fileForDistributionBrowserModal.hide().then(function () {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Warning!!!',
          'template': 'This will <span style="color:red">OVERWRITE</span> the current open project. Do you want to continue?',
          'cssClass': 'warning-popup'
        });
        confirmPopup.then(function (res) {
          if (res) {
            $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Destroying Current Project..'});
            $log.log('Destroying current project ...');
            var promises = [];
            promises.push(ProjectFactory.destroyProject());
            promises.push(SpotFactory.clearAllSpots());
            //promises.push(ImageFactory.deleteAllImages());

            $q.all(promises).then(function () {
              $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Importing Project..'});
              LocalStorageFactory.importProjectForDistribution(name).then(function () {
                reloadProject();
              }, function (err) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                  'title': 'Error!',
                  'template': 'Error importing project. ' + err
                });
              });
            });
          }
        });
      });
    }

    function initializeDownload() {
      vm.popover.hide().then(function () {
        downloadErrors = false;
        var downloadConfirmText = '';
        if (_.isEmpty(vm.activeDatasets)) {
          downloadConfirmText = 'No active datasets to download! Only the project properties will be downloaded and will ' +
            '<span style="color:red">OVERWRITE</span> the properties for the current open project. Continue?'
        }
        else {
          var names = _.pluck(vm.activeDatasets, 'name');
          downloadConfirmText = 'Project properties and datasets <b>' + names.join(', ') + '</b> will be downloaded' +
            ' and will <span style="color:red">OVERWRITE</span> the current open project properties and selected' +
            ' datasets. Continue?';
        }
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Download Warning!',
          'template': downloadConfirmText,
          'cssClass': 'warning-popup'
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
              outputMessage('<br>Error Updating Project! Error: ' + err);
            }).finally(function () {
              $ionicLoading.show({
                scope: $scope, template: notifyMessages.join('<br>') + '<br><br>' +
                  '<a class="button button-clear button-outline button-light" ng-click="vm.hideLoading()">OK</a>'
              });
            });
          }
        });
      });
    }

    function initializeUpload() {
      vm.popover.hide().then(function () {
        var deferred = $q.defer(); // init promise
        uploadErrors = false;
        var uploadConfirmText = '';
        if (_.isEmpty(vm.activeDatasets)) {
          uploadConfirmText = 'No active datasets to upload! Only the project properties will be uploaded and will ' +
            '<span style="color:red">OVERWRITE</span> the properties for this project on the server. Continue?';
        }
        else {
          var names = _.pluck(vm.activeDatasets, 'name');
          uploadConfirmText = 'Project properties and the active datasets <b>' + names.join(', ') + '</b> will be' +
            ' uploaded and will <span style="color:red">OVERWRITE</span> the project properties and selected' +
            ' datasets on the server. Continue?'
        }
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Upload Warning!',
          'template': uploadConfirmText,
          'cssClass': 'warning-popup'
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
      });
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
      if (_.isEmpty(vm.data.project_name)) {
        var formCtrl = angular.element(document.getElementById('straboFormCtrlId')).scope();
        var ele = $document[0].getElementById("project_name");
        ele.html = "Unnamed Project";
        var formEle = formCtrl.straboForm[ele.id];
        formEle.$valid = true;
        vm.data.project_name = "Unnamed Project";
      }
      var valid = FormFactory.validate(vm.data);
      if (valid) doCreateNewProject();
    }

    function selectProject(project) {
      $log.log('Selected:', project);
      if (_.isEmpty(vm.project)) loadProjectRemote(project);
      else {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Local Project Warning!',
          'template': 'Switching projects will <span style="color:red">DELETE</span> the local copy of the' +
            ' current project <b>' + vm.project.description.project_name + '</b> including all datasets and Spots' +
            ' contained within this project. Make sure you have already uploaded the project to the server if you' +
            ' wish to preserve the data. Continue?',
          'cssClass': 'warning-popup'
        });
        confirmPopup.then(function (res) {
          if (res) loadProjectRemote(project);
        });
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

    function startNewProject() {
      vm.popover.hide().then(function () {
        vm.data = {};
        vm.showExitProjectModal = false;
        if (_.isEmpty(vm.project) || !_.has(vm.project.description, 'project_name')) vm.newProjectModal.show();
        else {
          vm.showExitProjectModal = true;
          var confirmText = 'Creating a new project will <span style="color:red">DELETE</span> the local copy of the' +
            ' current project <b>' + vm.project.description.project_name + '</b> including all datasets and Spots' +
            ' contained within this project.';
          if (ProjectFactory.isSyncReady()) {
            confirmText += ' Make sure you have already uploaded the project to the server if you wish to preserve the' +
              ' data. Continue?';
          }
          else {
            confirmText += ' Create an account and log in to upload the project to the server if you wish preserve' +
              ' the data. Continue';
          }
          var confirmPopup = $ionicPopup.confirm({
            'title': 'Delete Local Project Warning!',
            'template': confirmText,
            'cssClass': 'warning-popup'
          });
          confirmPopup.then(function (res) {
            if (res) vm.newProjectModal.show();
          });
        }
      });
    }

    function switchProject() {
      vm.popover.hide().then(function () {
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Getting Projects from Server ...'});
        ProjectFactory.loadProjectsRemote().then(function (projects) {
          vm.projects = projects;
          vm.switchProjectModal.show();
        }, function (err) {
          $ionicPopup.alert({
            'title': 'Error communicating with server!',
            'template': err
          });
        }).finally(function () {
          $ionicLoading.hide();
        });
      });
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
        if (_.isEmpty(ProjectFactory.getSpotIds()[datasetToggled.id]) &&
          !_.isEmpty(UserFactory.getUser()) && navigator.onLine) {
          initializeDownloadDataset(datasetToggled);
        }
        else if (_.isEmpty(ProjectFactory.getSpotIds()[datasetToggled.id]) &&
          !_.isEmpty(UserFactory.getUser()) && !navigator.onLine) {
          $ionicPopup.alert({
            'title': 'Cannot Update Dataset!',
            'template': 'Unable to reach the server to check if there are already Spots in this dataset to download.'
          });
        }
      }
      ProjectFactory.saveActiveDatasets(vm.activeDatasets);
    }
  }
}());
