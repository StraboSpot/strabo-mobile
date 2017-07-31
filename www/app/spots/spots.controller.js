(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotsController', Spots);

  Spots.$inject = ['$cordovaDevice', '$cordovaFile', '$document', '$ionicHistory', '$ionicLoading', '$ionicModal',
    '$ionicPopover', '$ionicPopup', '$location', '$log', '$scope', '$state', '$window', 'HelpersFactory',
    'ProjectFactory', 'SpotFactory', 'SpotsFactory', 'UserFactory', 'IS_WEB'];

  function Spots($cordovaDevice, $cordovaFile, $document, $ionicHistory, $ionicLoading, $ionicModal, $ionicPopover,
                 $ionicPopup, $location, $log, $scope, $state, $window, HelpersFactory, ProjectFactory, SpotFactory,
                 SpotsFactory, UserFactory, IS_WEB) {
    var vm = this;

    var detailModal = {};
    var filterModal = {};

    vm.activeDatasets = [];
    vm.deleteSelected = false;
    vm.filterConditions = {};
    vm.isFilterOn = false;
    vm.showDetail = SpotsFactory.getSpotsListDetail();
    vm.spots = [];
    vm.spotsDisplayed = [];
    vm.spotIdSelected = undefined;

    vm.addFilters = addFilters;
    vm.applyFilters = applyFilters;
    vm.checkedDataset = checkedDataset;
    vm.closeDetailModal = closeDetailModal;
    vm.closeFilterModal = closeFilterModal;
    vm.deleteSpot = deleteSpot;
    vm.exportToCSV = exportToCSV;
    vm.getTagNames = getTagNames;
    vm.goToSpot = goToSpot;
    vm.hasRelationships = hasRelationships;
    vm.hasTags = hasTags;
    vm.isDatasetChecked = isDatasetChecked;
    vm.isOnlineLoggedIn = isOnlineLoggedIn;
    vm.isWeb = isWeb;
    vm.loadMoreSpots = loadMoreSpots;
    vm.moreSpotsCanBeLoaded = moreSpotsCanBeLoaded;
    vm.newSpot = newSpot;
    vm.resetFilters = resetFilters;
    vm.setListDetail = setListDetail;
    vm.toggleFilter = toggleFilter;
    vm.updateSpots = updateSpots;

    if (!IS_WEB) HelpersFactory.setBackView($ionicHistory.currentView().url);
    activate();

    /**
     * Private Functions
     */

    function activate() {
      if ($state.params && $state.params.spotId) vm.spotIdSelected = $state.params.spotId;

      SpotFactory.clearCurrentSpot();           // Make sure the current spot is empty
      setDisplayedSpots();

      createPageComponents();
      createPageEvents()
    }

    function createPageComponents() {
      SpotsFactory.createSpotsFilterModal($scope).then(function (modal) {
        filterModal = modal
      });

      SpotsFactory.createSpotsListDetailModal($scope).then(function (modal) {
        detailModal = modal
      });

      $ionicPopover.fromTemplateUrl('app/spots/spots-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });
    }

    function createPageEvents() {
      $scope.$on('$destroy', function () {
        filterModal.remove();
        detailModal.remove();
        vm.popover.remove();
      });
    }

    function setDisplayedSpots() {
      if (_.isEmpty(SpotsFactory.getFilterConditions())) {
        vm.spots = _.values(SpotsFactory.getActiveSpots());
        vm.isFilterOn = false;
      }
      else {
        vm.spots = _.values(SpotsFactory.getFilteredSpots());
        vm.isFilterOn = true;
      }
      vm.spots = SpotsFactory.sortSpots(vm.spots);
      if (!IS_WEB) vm.spotsDisplayed = vm.spots.slice(0, 25);
      else vm.spotsDisplayed = vm.spots;
    }

    /**
     * Public Functions
     */

    function addFilters() {
      vm.activeDatasets = ProjectFactory.getActiveDatasets();
      vm.filterConditions = SpotsFactory.getFilterConditions();
      filterModal.show();
    }

    function applyFilters() {
      if (SpotsFactory.areValidFilters()) {
        if (_.isEmpty(vm.filterConditions)) resetFilters();
        else setDisplayedSpots();
        filterModal.hide();
      }
    }

    function checkedDataset(datasetId) {
      if (_.contains(vm.filterConditions.datasets, datasetId)) {
        vm.filterConditions.datasets = _.without(vm.filterConditions.datasets, datasetId);
      }
      else {
        if (!vm.filterConditions.datasets) vm.filterConditions.datasets = [];
        vm.filterConditions.datasets.push(datasetId);
      }
    }

    function closeDetailModal() {
      SpotsFactory.setSpotsListDetail(vm.showDetail);
      detailModal.hide();
    }

    function closeFilterModal() {
      filterModal.hide();
    }

    function closeModal(modal) {
      vm[modal].hide();
    }

    function deleteSpot(spot) {
      vm.deleteSelected = true;

      if (SpotFactory.isSafeDelete(spot)) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Spot',
          'template': 'Are you sure you want to delete Spot ' + spot.properties.name + '?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            SpotFactory.destroy(spot.properties.id).then(function () {
              setDisplayedSpots();
              if (IS_WEB) {
                vm.spotIdSelected = undefined;
                $location.path('app/spotTab');
              }
            });
          }
          vm.deleteSelected = false;
        });
      }
      else {
        var alertPopup = $ionicPopup.alert({
          'title': 'Spot Deletion Prohibited!',
          'template': 'This Spot has at least one image being used as an image basemap. Remove any image basemaps' +
          ' from this Spot before deleting.'
        });
        alertPopup.then(function () {
          vm.deleteSelected = false;
        });
      }
    }

    // Export data to CSV
    function exportToCSV() {
      vm.popover.hide();

      // Convert the spot objects to a csv format
      function convertToCSV() {
        // Get all the fields for the csv header row
        var allHeaders = [];
        _.each(vm.spots,
          function (spot) {
            var headers = _.keys(spot.properties);
            // If there are custom fields, loop through the custom object grabbing those fields
            var i = _.indexOf(headers, 'custom');
            if (i !== -1) {
              headers = _.without(headers, 'custom');
              var customHeaders = _.keys(spot.properties.custom);
              customHeaders = _.map(customHeaders,
                function (header) {
                  return 'custom_' + header;
                }
              );
              allHeaders = _.union(headers, allHeaders, customHeaders);
            }
            else {
              allHeaders = _.union(headers, allHeaders);
            }
          }
        );
        // Add the two fields for the geometry
        allHeaders.push('geometry_type');
        allHeaders.push('geometry_coordinates');

        var allHeadersQuoted = _.map(allHeaders,
          function (ele) {
            return '\'' + ele + '\'';
          }
        );
        var csv = allHeadersQuoted.toString() + '\r\n';

        // Get all the values for each csv data row
        _.each(vm.spots,
          function (spot) {
            var row = new Array(allHeaders.length);
            row = _.map(row,
              function (ele) {
                return '';
              }
            );
            _.each(spot.properties,
              function (value, key) {
                // If the value is actually an object
                var i = _.indexOf(allHeaders, key);
                if (_.isObject(value)) {
                  // Separate date parts
                  if (value instanceof Date) {
                    if (key === 'time') {
                      row[i] = value.toLocaleTimeString();
                    }
                    else if (key === 'date') {
                      row[i] = value.toLocaleDateString();
                    }
                    else {
                      row[i] = value.toJSON();
                    }
                  }
                  // Flatten the child values
                  else {
                    row[i] = '\'' + _.flatten(value).join(', ') + '\'';
                  }
                }
                else {
                  row[i] = '\'' + value + '\'';
                }
              }
            );
            // Add the values for the geometry fields
            if (angular.isDefined(spot.geometry) && angular.isDefined(spot.geometry.type)) {
              var i = _.indexOf(allHeaders, 'geometry_type');
              row[i] = '\'' + spot.geometry.type + '\'';
              if (angular.isDefined(spot.geometry.coordinates)) {
                i = _.indexOf(allHeaders, 'geometry_coordinates');
                row[i] = '\'' + _.flatten(spot.geometry.coordinates).join(', ') + '\'';
              }
            }
            csv += row.toString() + '\r\n';
          }
        );
        return csv;
      }

      var spotData = convertToCSV(vm.spots);

      if (IS_WEB) {
        spotData = spotData.replace(/\r\n/g, '<br>');
        var win = $window.open();
        win.document.body.innerHTML = spotData;
        return;
      }

      var d = new Date();
      d = d.toLocaleDateString() + '-' + d.toLocaleTimeString();
      d = d.replace(/\//g, '-');
      d = d.replace(/:/g, '');
      d = d.replace(/ /g, '');
      var fileName = d + '-' + 'strabo-data.csv';

      var devicePath;
      switch ($cordovaDevice.getPlatform()) {
        case 'Android':
          devicePath = cordova.file.externalRootDirectory;
          break;
        case 'iOS':
          devicePath = cordova.file.documentsDirectory;
          break;
        default:
          // uh oh?  TODO: what about windows and blackberry?
          devicePath = cordova.file.externalRootDirectory;
          break;
      }

      var directory = 'strabo';

      function writeFile(dir) {
        $cordovaFile.writeFile(devicePath + dir, fileName, spotData, true).then(
          function (success) {
            $log.log(success);
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'CSV written to ' + devicePath + dir + fileName
            });
          },
          function (error) {
            $log.log(error);
          }
        );
      }

      $cordovaFile.checkDir(devicePath, directory).then(
        function (success) {
          $log.log(success);
          writeFile(success.fullPath);
        },
        function (error) {
          $cordovaFile.createDir(devicePath, directory, false).then(
            function (success) {
              $log.log(success);
              writeFile(success.fullPath);
            },
            function (error) {
              $log.log(error);
            }
          );
        }
      );
    }

    function getTagNames(spotId) {
      var tags = ProjectFactory.getTagsBySpotId(spotId);
      return _.pluck(tags, 'name').join(', ');
    }

    function goToSpot(id) {
      vm.spotIdSelected = id;
      if (!vm.deleteSelected) {
        $location.path('/app/spotTab/' + id + '/spot');
      }
    }

    function hasRelationships(spotId) {
      return !_.isEmpty(ProjectFactory.getRelationshipsBySpotId(spotId));
    }

    function hasTags(spotId) {
      return !_.isEmpty(ProjectFactory.getTagsBySpotId(spotId));
    }

    function isDatasetChecked(datasetId) {
      return _.contains(vm.filterConditions.datasets, datasetId) || false;
    }

    // Is the user online and logged in
    function isOnlineLoggedIn() {
      return navigator.onLine && UserFactory.getUser();
    }

    function isWeb() {
      return IS_WEB;
    }

    function loadMoreSpots() {
      vm.spotsDisplayed = vm.spots.slice(0, vm.spotsDisplayed.length + 20);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    function moreSpotsCanBeLoaded() {
      return vm.spotsDisplayed.length !== vm.spots.length;
    }

    // Create a new Spot
    function newSpot() {
      SpotFactory.setNewSpot({}).then(function (id) {
        vm.spotIdSelected = id;
        //SpotsFactory.setVisibleSpots(); //not needed? commenting this fixed https://github.com/StraboSpot/strabo-mobile/issues/380
        $location.path('/app/spotTab/' + id + '/spot');
      });
    }

    function resetFilters() {
      vm.filterConditions = {};
      SpotsFactory.setFilterConditions(vm.filterConditions);
      setDisplayedSpots();
    }

    function setListDetail() {
      vm.popover.hide();
      detailModal.show();
    }

    function toggleFilter(filter, emptyType) {
      if (vm.filterConditions[filter]) delete vm.filterConditions[filter]
      else vm.filterConditions[filter] = emptyType || undefined;
    }

    function updateSpots() {
      setDisplayedSpots();
    }
  }
}());
