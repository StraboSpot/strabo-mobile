(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagController', TagController);

  TagController.$inject = ['$ionicHistory', '$ionicModal', '$ionicPopup', '$location', '$log', '$scope', '$state',
    'DataModelsFactory', 'HelpersFactory', 'FormFactory', 'ProjectFactory', 'SpotFactory'];

  function TagController($ionicHistory, $ionicModal, $ionicPopup, $location, $log, $scope, $state, DataModelsFactory,
                         HelpersFactory, FormFactory, ProjectFactory, SpotFactory) {
    var vm = this;

    var isDelete = false;
    var visibleDatasets = [];

    vm.addSpot = addSpot;
    vm.addSpotModal = {};
    vm.checkedDataset = checkedDataset;
    vm.choices = [];
    vm.closeModal = closeModal;
    vm.data = {};
    vm.filter = filter;
    vm.getSpotName = getSpotName;
    vm.go = go;
    vm.goToSpot = goToSpot;
    vm.isDatasetChecked = isDatasetChecked;
    vm.isOptionChecked = isOptionChecked;
    vm.loadMoreSpots = loadMoreSpots;
    vm.moreSpotsCanBeLoaded = moreSpotsCanBeLoaded;
    vm.removeSpot = removeSpot;
    vm.resetFilters = resetFilters;
    vm.showField = showField;
    vm.spots = [];
    vm.spotsDisplayed = [];
    vm.survey = [];
    vm.toggleChecked = toggleChecked;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      loadTag();
      vm.survey = DataModelsFactory.getDataModel('tag').survey;
      vm.choices = DataModelsFactory.getDataModel('tag').choices;
      visibleDatasets = SpotFactory.getVisibleDatasets();

      vm.currentSpot = SpotFactory.getCurrentSpot();
      if (!vm.currentSpot) HelpersFactory.setBackView($ionicHistory.currentView().url);
      else {
        // If we're adding a new tag from within a spot
        if (!vm.data.spots) vm.data.spots = [];
        if (!_.contains(vm.data.spots, vm.currentSpot.properties.id)) vm.data.spots.push(vm.currentSpot.properties.id);
      }

      $ionicModal.fromTemplateUrl('app/project/add-spot-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.addSpotModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.addSpotModal.remove();
      });

      $ionicModal.fromTemplateUrl('app/spot/spots-filter-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.filterModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.filterModal.remove();
      });
    }

    function loadTag() {
      var id = $state.params.tag_id;
      vm.data = ProjectFactory.getTag(id);
      vm.data.id = id;  // Just in case vm.tag is undefined
      $log.log('Loaded Tag:', vm.data);
    }

    function setVisibleSpots() {
      var activeSpots = SpotFactory.getActiveSpots();
      if (_.isEmpty(visibleDatasets)) {
        vm.spots = activeSpots;
        vm.filterOn = false;
      }
      else {
        var datasetIdsToSpotIds = ProjectFactory.getSpotIds();
        var visibleSpotsIds = [];
        _.each(visibleDatasets, function (visibleDataset) {
          visibleSpotsIds.push(datasetIdsToSpotIds[visibleDataset]);
        });
        visibleSpotsIds = _.flatten(visibleSpotsIds);
        vm.spots = _.filter(activeSpots, function (activeSpot) {
          return _.contains(visibleSpotsIds, activeSpot.properties.id);
        });
        vm.filterOn = true;
      }
      vm.spots = _.sortBy(vm.spots, function (spot) {
        return spot.properties.modified_timestamp;
      }).reverse();
      vm.spotsDisplayed = angular.copy(vm.spots).slice(0, 25);
    }

    /**
     * Public Functions
     */

    function addSpot() {
      vm.addSpotModal.show();
      setVisibleSpots();
    }

    function checkedDataset(dataset) {
      $log.log('visibleDatasets:', visibleDatasets);
      var i = _.indexOf(visibleDatasets, dataset);
      if (i === -1) visibleDatasets.push(dataset);
      else visibleDatasets.splice(i, 1);
      SpotFactory.setVisibleDatasets(visibleDatasets);
      $log.log('visibleDatasets after:', visibleDatasets);
    }

    function closeModal(modal) {
      if (!modal) {
        setVisibleSpots();
        vm.filterModal.hide();
      }
      else vm[modal].hide();
    }

    function filter() {
      vm.activeDatasets = ProjectFactory.getActiveDatasets();
      vm.filterModal.show();
    }

    function isDatasetChecked(id) {
      return _.find(visibleDatasets, function (visibleDataset) {
        return visibleDataset === id;
      });
    }

    function getSpotName(spotId) {
      return SpotFactory.getNameFromId(spotId);
    }

    function go(path) {
      if (Object.keys(vm.data).length > 1) {
        var valid = FormFactory.validate(vm.survey, vm.data);
        if (valid) {
          if (ProjectFactory.getAddNewActiveTag()) {
            ProjectFactory.setActiveTags(vm.data);
            ProjectFactory.setAddNewActiveTag(false);
          }
          ProjectFactory.saveTag(vm.data).then(function () {
            $location.path(path);
          });
        }
      }
      else $location.path(path);
    }

    function goToSpot(spotId) {
      if (!isDelete) SpotFactory.goToSpot(spotId);
    }

    function isOptionChecked(spotId) {
      if (vm.data.spots) return vm.data.spots.indexOf(spotId) !== -1;
      return false;
    }

    function loadMoreSpots() {
      var moreSpots = angular.copy(vm.spots).splice(vm.spotsDisplayed.length,
        vm.spotsDisplayed.length + 20);
      vm.spotsDisplayed = _.union(vm.spotsDisplayed, moreSpots);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    function moreSpotsCanBeLoaded() {
      return vm.spotsDisplayed.length !== vm.spots.length;
    }

    function removeSpot(spotId) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Remove Spot',
        'template': 'Are you sure you want to remove the Spot <b>' + getSpotName(
          spotId) + '</b> from this Tag Group? This will <b>not</b> delete the Spot itself.'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.removeTagFromSpot(vm.data.id, spotId).then(function () {
            loadTag();
          });
        }
        isDelete = false;
      });
    }

    function resetFilters() {
      visibleDatasets = [];
      setVisibleSpots();
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function toggleChecked(spotId) {
      if (!vm.data.spots) vm.data.spots = [];
      var i = vm.data.spots.indexOf(spotId);
      if (i === -1) vm.data.spots.push(spotId);
      else vm.data.spots.splice(i, 1);
    }
  }
}());
