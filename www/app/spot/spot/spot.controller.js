(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicHistory', '$ionicLoading', '$ionicModal', '$ionicPopover',
    '$ionicPopup', '$location', '$log', '$q', '$rootScope', '$scope', '$state', '$timeout', 'FormFactory',
    'HelpersFactory', 'MapViewFactory', 'ProjectFactory', 'SpotFactory', 'StratSectionFactory', 'TagFactory', 'IS_WEB'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicHistory, $ionicLoading, $ionicModal, $ionicPopover, $ionicPopup, $location,
                          $log, $q, $rootScope, $scope, $state, $timeout, FormFactory, HelpersFactory, MapViewFactory,
                          ProjectFactory, SpotFactory, StratSectionFactory, TagFactory, IS_WEB) {
    var vmParent = $scope.vm;
    var vm = this;

    // Tags Variables
    vm.addGeologicUnitTagModal = {};
    vm.addTagModal = {};
    vm.addTagModalTitle = undefined;
    vm.allTags = [];
    vm.allTagsToDisplay = [];
    vm.featureId = undefined;
    vm.featureLevelTags = [];
    vm.featureLevelTagsToDisplay = [];
    vm.selectedType = 'all';
    vm.spotLevelTags = [];
    vm.spotLevelTagsToDisplay = [];
    vm.tabs = [];

    // Tags Functions
    vm.addTag = addTag;
    vm.createTag = createTag;
    vm.filterAllTagsType = filterAllTagsType;
    vm.filterTagType = filterTagType;
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getTagNames = getTagNames;
    vm.getTagTypeLabel = getTagTypeLabel;
    vm.isTagChecked = isTagChecked;
    vm.loadTags = loadTags;
    vm.toggleTagChecked = toggleTagChecked;

    // Other Variables
    vm.backHistoriesPopover = {};
    vm.data = {};
    vm.date = undefined;
    vm.initializing = true;
    vm.newNestModal = {};
    vm.newNestProperties = {};
    vm.popover = {};
    vm.showRadius = true;
    vm.showGeologicUnit = true;
    vm.showSurfaceFeature = false;
    vm.showTrace = false;
    vm.spot = {};
    vm.spotChanged = false;
    vm.stateName = $state.current.name;

    // Other Functions
    vm.clearBasicForm = clearBasicForm;
    vm.closeModal = closeModal;
    vm.copyThisSpot = copyThisSpot;
    vm.deleteSpot = deleteSpot;
    vm.goBack = goBack;
    vm.goToBackHistoryUrl = goToBackHistoryUrl;
    vm.goToTag = goToTag;
    vm.loadTab = loadTab;
    vm.saveSpot = saveSpot;
    vm.showTab = showTab;
    vm.submit = submit;
    vm.viewMap = viewMap;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotController');
      createPopover();
      vm.tabs = SpotFactory.getTabs();

      $ionicModal.fromTemplateUrl('app/spot/tags/add-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.addTagModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        if (vm.addTagModal) vm.addTagModal.remove();
        if (!_.isEmpty(vm.addGeologicUnitTagModal)) vm.addGeologicUnitTagModal.remove();
        vm.popover.remove();
        if (vm.backHistoriesPopover) vm.backHistoriesPopover.remove();
      });

      if (IS_WEB) {
        $scope.$watch('vm.spot', function (newValue, oldValue, scope) {
          if (!_.isEmpty(newValue)) {
            if (vm.initializing || oldValue.properties.id !== newValue.properties.id) {
              vm.spotChanged = false;
              $timeout(function () {
                vm.initializing = false;
              });
            }
            else {
              //$log.log('CHANGED vm.spot', 'new value', newValue, 'oldValue', oldValue);
              vm.spotChanged = true;
            }
          }
        }, true);
      }

      $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
        if (vm.spotChanged && fromState.name === 'app.spotTab.spot') {
          saveSpot().then(function (spots) {
            vm.spotChanged = false;
            if (IS_WEB && $state.current.name === 'app.spotTab.spot') vmParent.updateSpots();
          }, function () {
            $state.go(fromState);     // If saving failed don't change state
          });
        }
      });
    }

    function copyTags(id) {
      _.each(vm.spotLevelTags, function (tag) {
        tag.spots.push(id);
        ProjectFactory.saveTag(tag);
      });

      _.each(vm.featureLevelTags, function (tag) {
        var features = tag.features[vm.spot.properties.id];
        _.each(features, function (featureId) {
          // Samples are omitted from the copy process so don't copy any tags from samples
          var found = _.find(vm.spot.properties.samples, function (sample) {
            return sample.id === featureId;
          });
          if (!found) {
            if (!tag.features[id]) tag.features[id] = [];
            tag.features[id].push(featureId);
          }
        });
        ProjectFactory.saveTag(tag);
      });
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/spot/spot/spot-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      $ionicPopover.fromTemplateUrl('app/spot/spot/history-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.backHistoriesPopover = popover;
      });
    }

    // If the backView is within the same Spot keep getting backViews until
    // we get a backView out of the Spot or there are no more backViews
    function removeSameSpotBackViews() {
      var backView = $ionicHistory.backView();
      var currentView = $ionicHistory.currentView();
      if (backView && _.has(currentView.stateParams, 'spotId') && _.has(backView.stateParams, 'spotId') &&
        backView.stateParams.spotId === currentView.stateParams.spotId) {
        $ionicHistory.removeBackView();
        var currentHistory = $ionicHistory.viewHistory().histories[$ionicHistory.currentHistoryId()];
        currentHistory.cursor += -1;   // Fix for bug in ionic.bundle.js which updates the cursor incorrectly
        removeSameSpotBackViews();
      }
    }

    // Set the current spot
    function setSpot(id) {
      SpotFactory.setCurrentSpotById(id);
      vm.spot = SpotFactory.getCurrentSpot();
      if (vm.spot) {
        if (TagFactory.getActiveTagging()) TagFactory.addToActiveTags(vm.spot.properties.id);
        if (SpotFactory.getActiveNesting() && vm.spot.geometry) {
          SpotFactory.addSpotToActiveNest(vm.spot).then(function () {
            vm.spots = SpotFactory.getActiveSpots();
            if (vm.nestTab) vm.nestTab.updateNest();
          });
        }

        // Convert datetime from ISO to Date string
        vm.datetime = new Date(vm.spot.properties.date);

        vm.spotTitle = vm.spot.properties.name;
        vm.spots = SpotFactory.getActiveSpots();
        $log.log('Spot loaded: ', vm.spot);
      }
      else {
        $ionicPopup.alert({
          'title': 'Spot Not Found!',
          'template': 'This Spot was not found in the local database. It may need to be downloaded from the server or an unknown error has occurred.'
        });
        $location.path('app/spots');
      }
    }

    /**
     * Public Functions
     */

    function addTag(feature) {
      vm.featureId = (feature) ? feature.id : undefined;
      filterAllTagsType();
      vm.addTagModal.show();
    }

    function clearBasicForm() {
      FormFactory.clearFormElements();
    }

    function closeModal(modal) {
      vm[modal].hide();
      if (modal === 'newNestModal') {
        if (!_.isEmpty(vm.data)) vm.newNestProperties.surface_feature = {};
        _.extend(vm.newNestProperties.surface_feature, vm.data);
        SpotFactory.setNewNestProperties(vm.newNestProperties);
        SpotFactory.addSpotToActiveNest(vm.spot).then(function () {
          vm.spots = SpotFactory.getActiveSpots();
          if (vm.nestTab) vm.nestTab.updateNest();
        });
        vm.data = {};
      }
    }

    // Create a new spot with the details from this spot
    function copyThisSpot() {
      vm.popover.hide().then(function () {
        var newSpot = {'type': 'Feature'};
        newSpot.properties = _.omit(vm.spot.properties,
          ['name', 'id', 'date', 'time', 'modified_timestamp', 'images', 'samples']);
        _.each(newSpot.properties.orientation_data, function (orientation, i) {
          newSpot.properties.orientation_data[i] = _.omit(orientation,
            ['strike', 'dip_direction', 'dip', 'trend', 'plunge', 'rake', 'rake_calculated']);
          _.each(orientation.associated_orientation, function (associatedOrientation, j) {
            newSpot.properties.orientation_data[i].associated_orientation[j] = _.omit(associatedOrientation,
              ['strike', 'dip_direction', 'dip', 'trend', 'plunge', 'rake', 'rake_calculated']);
          });
        });

        SpotFactory.setNewSpot(newSpot).then(function (id) {
          submit('/app/spotTab/' + id + '/spot');
          copyTags(id);
        });
      });
    }

    function createTag() {
      vm.addTagModal.hide();
      var id = HelpersFactory.getNewId();
      vm.submit('/app/tags/' + id);
    }

    // Delete the spot
    function deleteSpot() {
      if (SpotFactory.isSafeDelete(vm.spot)) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Spot',
          'template': 'Are you sure you want to delete this spot?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            SpotFactory.destroy(vm.spot.properties.id).then(function () {
              vm.spot = undefined;
              vm.initializing = true;
              if (!IS_WEB) goBack();
              else {
                if ($state.current.name === 'app.spotTab.spot') {   // Update Spots list
                  vmParent.updateSpots();
                  vmParent.spotIdSelected = undefined;
                  $location.path('app/spotTab');
                }
                else $rootScope.$broadcast('deletedSpot');  // Clear Spot from map side panel
              }
            });
          }
        });
      }
      else {
        $ionicPopup.alert({
          'title': 'Spot Deletion Prohibited!',
          'template': 'This Spot has at least one image being used as an image basemap. Remove any image basemaps' +
          ' from this Spot before deleting.'
        });
      }
    }

    function filterAllTagsType() {
      vm.allTagsToDisplay = TagFactory.filterTagsByType(vm.selectedType, vm.allTags);
      filterTagType();
    }

    function filterTagType() {
      if (vm.selectedType === 'all') {
        vm.spotLevelTagsToDisplay = vm.spotLevelTags;
        vm.featureLevelTagsToDisplay = vm.featureLevelTags;
      }
      else {
        vm.spotLevelTagsToDisplay = _.filter(vm.spotLevelTags, function (tag) {
          return tag.type === vm.selectedType;
        });
        vm.featureLevelTagsToDisplay = _.filter(vm.featureLevelTags, function (tag) {
          return tag.type === vm.selectedType;
        });
      }
    }

    function getNumTaggedFeatures(tag) {
      return TagFactory.getNumTaggedFeatures(tag);
    }

    function getTagNames(feature) {
      var featureTags = _.filter(vm.allTags, function (tag) {
        if (tag.features && tag.features[vm.spot.properties.id]) {
          return _.contains(tag.features[vm.spot.properties.id], feature.id);
        }
      });
      return _.pluck(_.sortBy(featureTags, 'name'), 'name').join(', ');
    }

    function getTagTypeLabel(type) {
      return TagFactory.getTagTypeLabel(type);
    }

    function goBack() {
      SpotFactory.clearCurrentSpot();
      removeSameSpotBackViews();
      saveSpot().finally(function () {
        if ($ionicHistory.backView()) {
          if ($ionicHistory.backView().url === '/app/map') {
            $ionicLoading.show({
              'template': '<ion-spinner></ion-spinner><br>Loading Map...'
            });
            $log.log('Loading Map ...');
          }
          $ionicHistory.goBack();
        }
        else $location.path('/app/spots');      // default backView if no backView set
      });
    }

    function goToBackHistoryUrl(url) {
      $location.path('/app/spots');
      vm.backHistoriesPopover.hide();
    }

    function goToTag(id) {
      submit('/app/tags/' + id);
    }

    function isTagChecked(tag) {
      if (vm.spot) {
        if (vm.stateName === 'app.spotTab.tags' || vm.stateName === 'app.spotTab.spot') {
          if (tag.spots) return tag.spots.indexOf(vm.spot.properties.id) !== -1;
        }
        else {
          if (tag.features && tag.features[vm.spot.properties.id]) {
            return tag.features[vm.spot.properties.id].indexOf(vm.featureId) !== -1;
          }
        }
      }
      return false;
    }

    function loadTab(state) {
      vm.data = {};
      FormFactory.clearForm();
      var currentSpot = SpotFactory.getCurrentSpot();
      if (!currentSpot || currentSpot.properties.id !== state.params.spotId) SpotFactory.moveSpot = false;
      vm.stateName = state.current.name;
      setSpot(state.params.spotId);
      if (vm.spot) loadTags();
    }

    function loadTags() {
      if (vm.stateName === 'app.spotTab.tags' || vm.stateName === 'app.spotTab.spot') vm.addTagModalTitle = 'Add Spot Level Tags';
      else vm.addTagModalTitle = 'Add Feature Level Tags';
      vm.allTags = ProjectFactory.getTags();
      var tags = ProjectFactory.getTagsBySpotId(vm.spot.properties.id);
      vm.spotLevelTags = _.filter(tags, function (tag) {
        return tag.spots && _.contains(tag.spots, vm.spot.properties.id);
      });
      vm.featureLevelTags = _.filter(tags, function (tag) {
        return tag.features && tag.features[vm.spot.properties.id];
      });
      filterTagType();
    }

    function showTab(tab) {
      if (tab === 'spot') return true;
      var preferences = ProjectFactory.getPreferences();
      return preferences[tab];
    }

    function saveSpot() {
      if (vm.spot && vm.spot.properties) {
        vm.spot = HelpersFactory.cleanObj(vm.spot);
        var savedSpot = SpotFactory.getSpotById(vm.spot.properties.id);
        var isEqual = _.isEqual(vm.spot, savedSpot);
        if (isEqual) return $q.resolve(vm.spot);
        else {
          $log.log('Spot Changed! Existing Spot:', savedSpot, 'Spot to Save:', vm.spot);
          vm.data = HelpersFactory.cleanObj(vm.data);
          // Validate the form first
          if (FormFactory.validateForm(vm.stateName, vm.spot, vm.data)) {
            if (vm.stateName === 'app.spotTab.spot' && !_.isEmpty(vm.data)) {
              if (vm.showTrace === true) {
                if (!vm.spot.properties.trace) vm.spot.properties.trace = {};
                vm.spot.properties.trace = vm.data;
              }
              else if (vm.showSurfaceFeature === true) {
                if (!vm.spot.properties.surface_feature) vm.spot.properties.surface_feature = {};
                vm.spot.properties.surface_feature = vm.data;
              }
            }
            // If Spot is an interval check if we need to do any updates to the interval
            if (StratSectionFactory.isInterval(vm.spot)) {
              vm.spot = StratSectionFactory.checkForIntervalUpdates(vm.stateName, vm.spot, savedSpot);
            }
            if (vm.spot.properties.inferences) delete vm.spot.properties.inferences;  // Remove leftover inferences
            return SpotFactory.save(vm.spot);
          }
          else $ionicLoading.hide();
        }
      }
      return $q.reject(null);
    }

    // Save the Spot
    function submit(toPath) {
      saveSpot().then(function (spots) {
        vm.spotChanged = false;
        if (IS_WEB && $state.current.name === 'app.spotTab.spot') vmParent.updateSpots();
        else if (IS_WEB && $state.current.name === 'app.map') $rootScope.$broadcast('updateFeatureLayer');
        else if (IS_WEB && $state.current.name === 'app.image-basemaps.image-basemap') {
          $rootScope.$broadcast('updateFeatureLayer');
        }
        $ionicHistory.backView();
        $location.path(toPath);
      })
    }

    function toggleTagChecked(tag) {
      // Tags and Spot tabs use the Spot level tags, all other tabs have feature level tags
      if (vm.stateName === 'app.spotTab.tags' || vm.stateName === 'app.spotTab.spot') {
        if (!tag.spots) tag.spots = [];
        var i = tag.spots.indexOf(vm.spot.properties.id);
        if (i === -1) tag.spots.push(vm.spot.properties.id);
        else tag.spots.splice(i, 1);
      }
      else {
        if (!tag.features) tag.features = {};
        if (!tag.features[vm.spot.properties.id]) tag.features[vm.spot.properties.id] = [];
        var i = tag.features[vm.spot.properties.id].indexOf(vm.featureId);
        if (i === -1) tag.features[vm.spot.properties.id].push(vm.featureId);
        else tag.features[vm.spot.properties.id].splice(i, 1);
        if (tag.features[vm.spot.properties.id].length === 0) delete tag.features[vm.spot.properties.id];
        if (_.isEmpty(tag.features)) delete tag.features;
      }
      ProjectFactory.saveTag(tag).then(function () {
        loadTags();
      });
    }

    // View the spot on the maps
    function viewMap() {
      SpotFactory.setKeepSpotSelected(true);
      if (_.has(vm.spot.properties, 'image_basemap')) {
        vm.submit('/app/image-basemaps/' + vm.spot.properties.image_basemap);
      }
      else if (_.has(vm.spot.properties, 'strat_section_id')) {
        vm.submit('/app/strat-sections/' + vm.spot.properties.strat_section_id);
      }
      else {
        $ionicLoading.show({
          'template': '<ion-spinner></ion-spinner><br>Loading Map...'
        });
        MapViewFactory.setMapViewToSpot(vm.spot);
        vm.submit('/app/map');
      }
    }
  }
}());
