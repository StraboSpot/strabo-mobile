(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicHistory', '$ionicLoading', '$ionicModal', '$ionicPopover',
    '$ionicPopup', '$location', '$log', '$q', '$rootScope', '$scope', '$state', '$timeout', 'DataModelsFactory',
    'FormFactory', 'HelpersFactory', 'ImageFactory', 'MapEmogeosFactory', 'MapViewFactory', 'ProjectFactory',
    'SpotFactory', 'StratSectionFactory', 'TagFactory', 'IS_WEB'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicHistory, $ionicLoading, $ionicModal, $ionicPopover, $ionicPopup, $location,
                          $log, $q, $rootScope, $scope, $state, $timeout, DataModelsFactory, FormFactory,
                          HelpersFactory, ImageFactory, MapEmogeosFactory, MapViewFactory, ProjectFactory,
                          SpotFactory, StratSectionFactory, TagFactory, IS_WEB) {
    var vmParent = $scope.vm;
    var vm = this;

    var preferences = ProjectFactory.getPreferences();
    var typesWithTwoLithologies = ['bed_mixed_lit', 'interbedded'];

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
    vm.dataOutsideForm = {};
    vm.date = undefined;
    vm.initializing = true;
    vm.lithologyNum = 0;
    vm.newNestModal = {};
    vm.newNestProperties = {};
    vm.popover = {};
    vm.sedCharacter = '';
    vm.sedCharacterOther = undefined;
    vm.showRadius = true;
    vm.showGeologicUnit = true;
    vm.showSurfaceFeature = false;
    vm.showTrace = false;
    vm.sketchModal = {};
    vm.spot = {};
    vm.spotChanged = false;
    vm.stateName = $state.current.name;

    // Other Functions
    vm.clearBasicForm = clearBasicForm;
    vm.closeModal = closeModal;
    vm.copyThisSpot = copyThisSpot;
    vm.deleteSpot = deleteSpot;
    vm.drawSketch = drawSketch;
    vm.eraseSketch = eraseSketch;
    vm.fieldChanged = fieldChanged;
    vm.getLabel = getLabel;
    vm.goBack = goBack;
    vm.goToBackHistoryUrl = goToBackHistoryUrl;
    vm.goToSpot = goToSpot;
    vm.goToTag = goToTag;
    vm.isSecondLithologyDisabled = isSecondLithologyDisabled;
    vm.isState = isState;
    vm.loadTab = loadTab;
    vm.saveSketch = saveSketch;
    vm.saveSpot = saveSpot;
    vm.sedCharacterSelected = sedCharacterSelected;
    vm.sedCharacterOtherSelected = sedCharacterOtherSelected;
    vm.setLithologyNum = setLithologyNum;
    vm.shouldShowSedCharacteristicsField = shouldShowSedCharacteristicsField;
    vm.showTab = showTab;
    vm.submit = submit;
    vm.takePicture = takePicture;
    vm.updateSpotsList = updateSpotsList;
    vm.viewMap = viewMap;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotController');
      createPopover();
      vm.tabs = SpotFactory.getTabs();

      //  SpotFactory.destroy(15688513211836);


      $ionicModal.fromTemplateUrl('app/spot/tags/add-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.addTagModal = modal;
      });

      ImageFactory.getSketchModal($scope).then(function (sketchModal) {
        vm.sketchModal = sketchModal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        if (vm.sketchModal) vm.sketchModal.remove();
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
            if (IS_WEB && $state.current.name === 'app.spotTab.spot') updateSpotsList();
          }, function () {
            $state.go(fromState);     // If saving failed don't change state
          });
        }
      });

      // Spot updated by emogeo
      $scope.$on('updated-spot', function (event, args) {
        $log.log('Updated Spot by emogeo');
        vm.spot = SpotFactory.getCurrentSpot();
      });

      $rootScope.$on('spotSaved', function () {
        vm.spotChanged = false;
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

    function go() {
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
    }

    // Construct the data object for the Sed page
    function handleSaveSedData() {
      var sedKey = vm.stateName.split('-')[1];
      var sed = vm.spot.properties.sed ? vm.spot.properties.sed : {};

      // Interval
      if (vm.stateName === 'app.spotTab.sed-interval' && !_.isEmpty(vm.data)) {
        if (vm.data.interval_type) {
          sed.character = vm.data.interval_type;
          delete vm.data.interval_type;
        }
        if (!vm.spot.properties.sed) vm.spot.properties.sed = {};
        if (!sed.interval) sed.interval = {};
        sed.interval = vm.data;
      }
      // Bedding (shared fields and 2 lithologies)
      else if (vm.stateName === 'app.spotTab.sed-bedding') {
        if (_.isEmpty(vm.data)) {
          if (sed.bedding && sed.bedding.beds && sed.bedding.beds[vm.lithologyNum]) {
            if (vm.lithologyNum === 0) sed.bedding.beds[0] = {};
            else sed.bedding.beds.pop();
            if (sed.bedding.beds.length === 1 && _.isEmpty(sed.bedding.beds[0])) delete sed.bedding.beds;
          }
          if (_.isEmpty(vm.dataOutsideForm) && _.isEmpty(sed.bedding)) delete sed.bedding;
        }
        else {
          if (!sed.bedding) sed.bedding = {};
          _.extend(sed.bedding, vm.dataOutsideForm);
          if (!sed.bedding.beds) sed.bedding.beds = [];
          if (vm.lithologyNum === 1 && !sed.bedding.beds[0]) sed.bedding.beds[0] = {};
          sed.bedding.beds[vm.lithologyNum] = vm.data;
        }
      }
      // Other Sed pages that have 2 lithologies
      else {
        if (_.isEmpty(vm.data)) {
          if (sed[sedKey] && sed[sedKey][vm.lithologyNum]) {
            if (vm.lithologyNum === 0) sed[sedKey][0] = {};
            else sed[sedKey].pop();
            if (sed[sedKey].length === 1 && _.isEmpty(sed[sedKey][0])) delete sed[sedKey];
          }
        }
        else {
          if (!sed[sedKey]) sed[sedKey] = [];
          if (vm.lithologyNum === 1 && !sed[sedKey][0]) sed[sedKey][0] = {};
          sed[sedKey][vm.lithologyNum] = vm.data;
        }
      }
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
      vm.data = {};
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
        newSpot.properties = angular.copy(vm.spot.properties);
        newSpot.properties = _.omit(newSpot.properties,
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
      $log.log($state.current.name);
      vm.submit('/app/tags/' + id);
    }

    // Delete the spot
    function deleteSpot() {
      vm.popover.hide().then(function () {
        var deleteMsg = SpotFactory.isSafeDelete(vm.spot);
        if (!deleteMsg) {
          var confirmPopup = $ionicPopup.confirm({
            'title': 'Delete Spot',
            'template': 'Are you sure you want to delete this spot?'
          });
          confirmPopup.then(function (res) {
            if (res) {
              if (StratSectionFactory.isMappedInterval(vm.spot)) {
                StratSectionFactory.deleteInterval(vm.spot).then(function () {
                  vm.spot = undefined;
                  vm.initializing = true;
                  if (!IS_WEB) goBack();
                  else {
                    if ($state.current.name.split('.')[1] === 'spotTab') {   // Update Spots list
                      updateSpotsList();
                      vmParent.spotIdSelected = undefined;
                      $location.path('app/spotTab');
                    }
                    else $rootScope.$broadcast('deletedSpot');  // Clear Spot from map side panel
                  }
                });
              }
              else {
                SpotFactory.destroy(vm.spot.properties.id).then(function () {
                  vm.spot = undefined;
                  vm.initializing = true;
                  if (!IS_WEB) goBack();
                  else {
                    if ($state.current.name.split('.')[1] === 'spotTab') {   // Update Spots list
                      updateSpotsList();
                      vmParent.spotIdSelected = undefined;
                      $location.path('app/spotTab');
                    }
                    else $rootScope.$broadcast('deletedSpot');  // Clear Spot from map side panel
                  }
                });
              }
            }
          });
        }
        else {
          $ionicPopup.alert({
            'title': 'Spot Deletion Prohibited!',
            'template': deleteMsg
          });
        }
      });
    }

    function drawSketch() {
      vm.sketchModal.show();
      ImageFactory.initializeSketch(vm.spot);
    }

    function eraseSketch() {
      ImageFactory.eraseSketch();
    }

    // Handle changes to specific fields in form
    function fieldChanged(fieldName, newValue, oldValue) {
      $log.log(fieldName, 'changed in form', FormFactory.getFormName());
      switch (fieldName) {
        // Sed grain size
        case 'mud_silt_grain_size':
        case 'sand_grain_size':
        case 'congl_grain_size':
        case 'breccia_grain_size':
          if (newValue) {
            if (!vm.data.grain_size_range) vm.data.grain_size_range = [];
            vm.data.grain_size_range.push(newValue);
          }
          break;
        // Strat Section y axis units
        case 'column_y_axis_units':
          vm.child.changeUnits(newValue, oldValue);
          break;
        // Strat Section column profile
        case 'column_profile':
          vm.child.changeColumnProfile(newValue, oldValue);
          break;
        case 'interval_type':
          switchNumLithologies(newValue, oldValue);
          break;
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

    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
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
      if (vm.spot) saveSpot().then(function () {
        go();
      });
      else go();
    }

    function goToBackHistoryUrl(url) {
      $location.path('/app/spots');
      vm.backHistoriesPopover.hide();
    }

    function goToSpot() {
      $location.path('app/spotTab/' + vm.spot.properties.id + '/spot');
    }

    function goToTag(id) {
      submit('/app/tags/' + id);
    }

    function isSecondLithologyDisabled() {
      return !_.contains(typesWithTwoLithologies, vm.sedCharacter)
    }

    function isState(stateName) {
      return stateName === $state.current.name;
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
      if (vm.spot && vm.spot.properties && vm.spot.properties.sed) {
        if (vm.spot.properties.sed.character) vm.sedCharacter = vm.spot.properties.sed.character;
        if (vm.spot.properties.sed.other_character) vm.sedCharacterOther = vm.spot.properties.sed.other_character;
      }
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

    function saveSketch() {
      ImageFactory.saveSketch().finally(function () {
        vm.sketchModal.hide();
      });
    }

    function sedCharacterSelected() {
      $log.log(vm.sedCharacter);
      if (vm.spot.properties.sed && vm.spot.properties.sed.character) {
        switchNumLithologies(vm.sedCharacter, vm.spot.properties.sed.character);
      }
      else switchNumLithologiesContinued(vm.sedCharacter);
    }

    function sedCharacterOtherSelected() {
      $log.log(vm.sedCharacterOther);
      if (!vm.spot.properties.sed) vm.spot.properties.sed = {};
      vm.spot.properties.sed.other_character = vm.sedCharacterOther;
    }

    function saveSpot() {
      if (vm.spot && vm.spot.properties) {
        vm.spot = HelpersFactory.cleanObj(vm.spot);
        var savedSpot = angular.copy(SpotFactory.getSpotById(vm.spot.properties.id));
        vm.data = HelpersFactory.cleanObj(vm.data);
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
          else if (vm.stateName.split('-')[0] === 'app.spotTab.sed') {
            handleSaveSedData();
            if (vm.spot.properties.sed && !FormFactory.validateSedData(vm.spot, vm.lithologyNum, vm.stateName)) {
              return $q.reject(null);
            }
            if (_.isEmpty(vm.spot.properties.sed)) delete vm.spot.properties.sed;
          }
          else if (vm.stateName === 'app.spotTab.experimental' && !_.isEmpty(vm.data)) {
            if (!vm.spot.properties.micro) vm.spot.properties.micro = {};
            if (!vm.spot.properties.micro.experimental) vm.spot.properties.micro.experimental = {};
            vm.spot.properties.micro.experimental = vm.data;
          }
          else if (vm.stateName === 'app.spotTab.experimental-set-up' && !_.isEmpty(vm.data)) {
            if (!vm.spot.properties.micro) vm.spot.properties.micro = {};
            if (!vm.spot.properties.micro.experimental_set_up) vm.spot.properties.micro.experimental_set_up = {};
            vm.spot.properties.micro.experimental_set_up = vm.data;
          }
          else if (vm.stateName === 'app.spotTab.experimental-results' && !_.isEmpty(vm.data)) {
            if (!vm.spot.properties.micro) vm.spot.properties.micro = {};
            if (!vm.spot.properties.micro.experimental_results) vm.spot.properties.micro.experimental_results = {};
            vm.spot.properties.micro.experimental_results = vm.data;
          }
          else if (vm.stateName === 'app.spotTab.petrology' && !_.isEmpty(vm.data)) {
            if (!vm.spot.properties.pet) vm.spot.properties.pet = {};
            vm.spot.properties.pet = vm.data;
          }
          var isEqual = _.isEqual(vm.spot, savedSpot);
          if (isEqual) return $q.resolve(vm.spot);
          else {
            $log.log('Spot Changed! Existing Spot:', savedSpot, 'Spot to Save:', vm.spot);
            if (vm.spot.properties.inferences) delete vm.spot.properties.inferences;  // Remove leftover inferences
            // If Spot is an interval check if we need to do any updates to the interval
            if (StratSectionFactory.isMappedInterval(vm.spot)) {
              vm.spot = StratSectionFactory.checkForIntervalUpdates(vm.stateName, vm.spot, savedSpot);
            }
            return SpotFactory.save(vm.spot).then(function () {
              // Need to update the strat section map in case on WEB and fields were changed in the sidepanel
              if (IS_WEB && $state.current.name === 'app.strat-section') {
                $rootScope.$broadcast('updateStratSectionFeatureLayer');
                MapEmogeosFactory.setSelectedSpot(vm.spot);
              }
            });
          }
        }
        else $ionicLoading.hide();
      }
      return $q.reject(null);
    }

    // Set the data for the active lithology
    function setLithologyData() {
      if (vm.spot.properties.sed && vm.spot.properties.sed.lithologies &&
        vm.stateName === 'app.spotTab.sed-lithologies') vm.data = vm.spot.properties.sed.lithologies[vm.lithologyNum] || {};
      else if (vm.spot.properties.sed && vm.spot.properties.sed.structures &&
        vm.stateName === 'app.spotTab.sed-structures') vm.data = vm.spot.properties.sed.structures[vm.lithologyNum] || {};
      else if (vm.spot.properties.sed && vm.spot.properties.sed.interpretations &&
        vm.stateName === 'app.spotTab.sed-interpretations') vm.data = vm.spot.properties.sed.interpretations[vm.lithologyNum] || {};
      else if (vm.spot.properties.sed && vm.spot.properties.sed.bedding && vm.spot.properties.sed.bedding.beds &&
        vm.stateName === 'app.spotTab.sed-bedding') vm.data = vm.spot.properties.sed.bedding.beds[vm.lithologyNum] || {};
      else vm.data = {};
      $log.log('Lithology ' + (vm.lithologyNum + 1) + ' data:', vm.data);
    }

    // Set the number of the lithology that's active
    function setLithologyNum(num) {
      $log.log('Setting lithology num:', num);
      if (num === 1 && !_.contains(typesWithTwoLithologies, vm.sedCharacter)) {
        $ionicPopup.alert({
          'title': 'Lithology 2 Not Applicable',
          'template': 'Lithology 2 is applicable only to "bed, mixed lithologies" or "interbedded" Spots in ' +
            (StratSectionFactory.isInterval(vm.spot) ? '"Type of Interval".' : '"Spot Sedimentary Characteristics".')
        });
      }
      else {
        saveSpot().then(function (spots) {
          vm.spotChanged = false;
          vm.lithologyNum = num;
          setLithologyData(num);
        });
      }
    }

    function shouldShowSedCharacteristicsField() {
      return !StratSectionFactory.isInterval(vm.spot);
    }

    function showTab(tab) {
      if (tab === 'spot') return true;
      else if (tab === 'strat_section') {
        return preferences['strat_mode'] && vm.spot && vm.spot.properties && !vm.spot.properties.strat_section_id;
      }
      else if (tab === 'sed_interval') return StratSectionFactory.isInterval(vm.spot);
      else return preferences[tab];
    }

    // Save the Spot
    function submit(toPath) {
      saveSpot().then(function (spots) {
        vm.spotChanged = false;
        vm.spotTitle = vm.spot.properties.name;
        if (IS_WEB && $state.current.name === 'app.spotTab.spot') vmParent.updateSpots();
        else if (IS_WEB && $state.current.name === 'app.map') $rootScope.$broadcast('updateMapFeatureLayer');
        else if (IS_WEB && $state.current.name === 'app.image-basemaps.image-basemap') {
          $rootScope.$broadcast('updateImageBasemapFeatureLayer');
        }
        $ionicHistory.backView();
        $location.path(toPath);
      });
    }

    // Handle switching from one possible lithology to two possible lithologies and vice versa.
    // When switching from 2 to 1:
    //  - if actually data in Lithology 2 ask for user confirmation since the data in Lithology 2 will be deleted
    //  - set lithologyNum to 0
    // If not in Strat Mode update the current page data (vm.data)
    function switchNumLithologies(newType, oldType) {
      var beddingSharedSurvey = DataModelsFactory.getDataModel('sed')['bedding_shared'].survey;
      var beddingSharedFieldNames = _.pluck(beddingSharedSurvey, 'name');
      // data in the second lithology, give a warning message that the data in Lithology 2 will be deleted
      if (vm.spot.properties.sed && vm.spot.properties.sed.character &&
        _.contains(typesWithTwoLithologies, oldType) && !_.contains(typesWithTwoLithologies, newType) &&
        ((vm.spot.properties.sed.lithologies && vm.spot.properties.sed.lithologies[1]) ||
          (vm.spot.properties.sed.structures && vm.spot.properties.sed.structures[1]) ||
          (vm.spot.properties.sed.interpretations && vm.spot.properties.sed.interpretations[1]) ||
          (vm.spot.properties.sed.bedding && vm.spot.properties.sed.bedding.beds &&
            vm.spot.properties.sed.bedding.beds[1]))) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Switch ' + (StratSectionFactory.isInterval(vm.spot) ? 'Interval Type' : 'Sed Characteristics') +
            ' Warning',
          'template': 'Are you sure you want to switch from ' +
            (StratSectionFactory.isInterval(vm.spot) ? 'an interval type' : 'a characteristic') + ' with two' +
            ' possible lithologies to only one lithology? This will delete any data in Lithology 2 and any' +
            ' shared bedding data.'
        });
        confirmPopup.then(function (res) {
          if (res) {
            if (vm.spot.properties.sed.lithologies && vm.spot.properties.sed.lithologies[1]) {
              vm.spot.properties.sed.lithologies.pop();
            }
            if (vm.spot.properties.sed.structures && vm.spot.properties.sed.structures[1]) {
              vm.spot.properties.sed.structures.pop();
            }
            if (vm.spot.properties.sed.interpretations && vm.spot.properties.sed.interpretations[1]) {
              vm.spot.properties.sed.interpretations.pop();
            }
            if (vm.spot.properties.sed.bedding) {
              _.each(vm.spot.properties.sed.bedding, function (value, key) {
                if (_.contains(beddingSharedFieldNames, key)) delete vm.spot.properties.sed.bedding[key];
              });
              if (vm.spot.properties.sed.bedding.beds && vm.spot.properties.sed.bedding.beds[1]) {
                vm.spot.properties.sed.bedding.beds.pop();
              }
            }
            switchNumLithologiesContinued(newType);
          }
          else vm.data.interval_type = oldType;
        });
      }
      else switchNumLithologiesContinued(newType);
    }

    function switchNumLithologiesContinued(newType) {
      if (!StratSectionFactory.isInterval(vm.spot)) {
        if (!vm.spot.properties.sed) vm.spot.properties.sed = {};
        vm.spot.properties.sed.character = newType;
        SpotFactory.save(vm.spot).then(function () {
          vm.spotChanged = false;
          if (!_.contains(typesWithTwoLithologies, newType) && vm.lithologyNum !== 0) {
            vm.lithologyNum = 0;
            setLithologyData();
          }
        });
      }
      else if (!_.contains(typesWithTwoLithologies, newType)) vm.lithologyNum = 0;
    }

    function takePicture() {
      ImageFactory.setIsReattachImage(false);
      ImageFactory.setCurrentSpot(vm.spot);
      ImageFactory.setCurrentImage({'image_type': 'photo'});
      ImageFactory.takePicture();
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

    function updateSpotsList() {
      if (IS_WEB) vmParent.updateSpots();
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
      else if (_.has(vm.spot.properties, 'thin_section_id')) {
        vm.submit('/app/thin-sections/' + vm.spot.properties.thin_section_id);
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
