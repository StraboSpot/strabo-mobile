(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicLoading', '$ionicModal', '$ionicPopover', '$ionicPopup', '$location',
    '$log', '$scope', '$state', 'FormFactory', 'HelpersFactory', 'MapViewFactory', 'ProjectFactory', 'SpotFactory',
    'TagFactory', 'IS_WEB'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicLoading, $ionicModal, $ionicPopover, $ionicPopup, $location, $log, $scope,
                          $state, FormFactory, HelpersFactory, MapViewFactory, ProjectFactory, SpotFactory,
                          TagFactory, IS_WEB) {
    var vmParent = $scope.vm;
    var vm = this;

    // Tags Variables
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
    vm.tags = [];

    // Tags Functions
    vm.addTag = addTag;
    vm.filterTagType = filterTagType;
    vm.filterAllTagsType = filterAllTagsType;
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getTagNames = getTagNames;
    vm.getTagTypeLabel = getTagTypeLabel;
    vm.isTagChecked = isTagChecked;
    vm.loadTags = loadTags;
    vm.toggleTagChecked = toggleTagChecked;

    // Other Variables
    vm.choices = undefined;
    vm.data = {};
    vm.date = undefined;
    vm.newNestModal = {};
    vm.newNestProperties = {};
    vm.popover = {};
    vm.showRadius = true;
    vm.showGeologicUnit = true;
    vm.showSurfaceFeature = false;
    vm.showTrace = false;
    vm.spot = {};
    vm.stateName = $state.current.name;
    vm.survey = undefined;

    // Other Functions
    vm.closeModal = closeModal;
    vm.copyThisSpot = copyThisSpot;
    vm.createTag = createTag;
    vm.deleteSpot = deleteSpot;
    vm.getMax = getMax;
    vm.getMin = getMin;
    vm.goBack = goBack;
    vm.goToTag = goToTag;
    vm.isOptionChecked = isOptionChecked;
    vm.loadTab = loadTab;
    vm.setSelMultClass = setSelMultClass;
    vm.showField = showField;
    vm.showTab = showTab;
    vm.submit = submit;
    vm.toggleAcknowledgeChecked = toggleAcknowledgeChecked;
    vm.toggleChecked = toggleChecked;
    vm.validateForm = validateForm;
    vm.viewMap = viewMap;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotController');
      createPopover();

      $ionicModal.fromTemplateUrl('app/spot/tags/add-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.addTagModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.addTagModal.remove();
        vm.popover.remove();
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
    }

    // Set the current spot
    function setSpot(id) {
      SpotFactory.setCurrentSpotById(id);
      vm.spot = SpotFactory.getCurrentSpot();
      if (vm.spot) {
        if (TagFactory.getActiveTagging()) TagFactory.addToActiveTags(vm.spot.properties.id);
        if (SpotFactory.getActiveNesting() && vm.spot.geometry) {
          SpotFactory.addSpotToActiveNest(vm.spot).then(function(){
            vm.spots = SpotFactory.getActiveSpots();
          });
        }

        // Convert datetime from ISO to Date string
        vm.datetime = new Date(vm.spot.properties.date);

        vm.spotTitle = vm.spot.properties.name;
        vm.spots = SpotFactory.getActiveSpots();

        if (vm.stateName === 'app.spotTab.spot') vm.data = vm.spot.properties;

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

    // Create a new spot with the details from this spot
    function copyThisSpot() {
      vm.popover.hide();
      var newSpot = {'type': 'Feature'};
      newSpot.properties = _.omit(vm.spot.properties,
        ['name', 'id', 'date', 'time', 'modified_timestamp', 'images', 'samples', 'inferences']);
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
    }

    function closeModal(modal) {
      vm[modal].hide();
      if (modal === 'newNestModal') {
        if (!_.isEmpty(vm.data)) vm.newNestProperties.surface_feature = {};
        _.extend(vm.newNestProperties.surface_feature, vm.data);
        SpotFactory.setNewNestProperties(vm.newNestProperties);
        SpotFactory.addSpotToActiveNest(vm.spot).then(function() {
          vm.spots = SpotFactory.getActiveSpots();
          vm.nestTab.updateNest();
        });
        vm.data = {};
      }
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
              goBack();
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

    function filterAllTagsType() {
      vm.allTagsToDisplay = TagFactory.filterTagsByType(vm.selectedType, vm.allTags);
      filterTagType();
    }

    function getMax(constraint) {
      return FormFactory.getMax(constraint);
    }

    function getMin(constraint) {
      return FormFactory.getMin(constraint);
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
      var backLocation = HelpersFactory.getBackView();
      if (backLocation === '/app/maps') {
        $ionicLoading.show({
          'template': '<ion-spinner></ion-spinner><br>Loading Map...'
        });
        $log.log('Loading Map ...');
      }
      if (vm.spot) submit(backLocation);
      else $location.path(backLocation);
    }

    function goToTag(id) {
      submit('/app/tags/' + id);
    }

    function isOptionChecked(field, choice) {
      if (vm.spot) {
        if (vm.data[field]) return vm.data[field].indexOf(choice) !== -1;
      }
      else return false;
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
      SpotFactory.moveSpot = false;
      vm.stateName = state.current.name;
      setSpot(state.params.spotId);
      if (vm.spot) {
        loadTags();

        vm.showTrace = false;
        vm.showGeologicUnit = true;
        vm.showSurfaceFeature = false;
        if (vm.spot.geometry && vm.spot.geometry.type === 'LineString') {
          vm.showTrace = true;
          if (!vm.spot.properties.trace) vm.spot.properties.trace = {};
          vm.data = vm.spot.properties.trace;
          vm.showGeologicUnit = false;
        }
        if (vm.spot.geometry && vm.spot.geometry.type === 'Polygon') {
          vm.showRadius = false;
          vm.showSurfaceFeature = true;
          if (!vm.spot.properties.surface_feature) vm.spot.properties.surface_feature = {};
          vm.data = vm.spot.properties.surface_feature;
        }
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

    // Set the class for the select_multiple fields here because it is not working
    // to set the class in the html the same way as for the other fields
    function setSelMultClass(field) {
      if (field.required === 'true') {
        if (vm.data[field.name]) {
          if (vm.data[field.name].length > 0) {
            return 'no-errors';
          }
        }
        else {
          return 'has-errors';
        }
      }
      return 'no-errors';
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (show && field.default) {
        if (!vm.data[field.name]) vm.data[field.name] = field.default;
      }
      if (!show) {
        if (vm.data[field.name]) delete vm.data[field.name];
      }
      return show;
    }

    function showTab(tab) {
      var preferences = ProjectFactory.getPreferences();
      return preferences[tab];
    }

    // Save the Spot
    function submit(toPath) {
      if (_.isEmpty(vm.spot.properties.trace)) delete vm.spot.properties.trace;
      if (_.isEmpty(vm.spot.properties.surface_feature)) delete vm.spot.properties.surface_feature;

      // Validate the form first
      if (vm.validateForm()) {
        $log.log('Spot to save: ', vm.spot);
        SpotFactory.save(vm.spot).then(function (spots) {
          if (IS_WEB) vmParent.updateSpots();
          $log.log('Saved spot: ', vm.spot);
          $log.log('All spots: ', spots);
          $location.path(toPath);
        });
      }
      else $ionicLoading.hide();
    }

    function toggleAcknowledgeChecked(field) {
      if (vm.data[field]) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Close Group?',
          'template': 'By closing this group you will be clearing any data in this group. Continue?'
        });
        confirmPopup.then(function (res) {
          if (res) vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
          else $document[0].getElementById(field + 'Toggle').checked = true;
        });
      }
      else vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
    }

    function toggleChecked(field, choice) {
      var i = -1;
      if (vm.data[field]) i = vm.data[field].indexOf(choice);
      else vm.data[field] = [];

      // If choice not already selected
      if (i === -1) vm.data[field].push(choice);
      // Choice has been unselected so remove it and delete if empty
      else {
        vm.data[field].splice(i, 1);
        if (vm.data[field].length === 0) delete vm.data[field];
      }
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

    // Validate Spot Tab
    function validateForm() {
      if (vm.stateName === 'app.spotTab.spot') {
        if (!vm.spot.properties.name) {
          $ionicPopup.alert({
            'title': 'Validation Error!',
            'template': '<b>Spot Name</b> is required.'
          });
          return false;
        }
        if (vm.spot.geometry) {
          if (vm.spot.geometry.type === 'Point') {
            var geoError;
            if (!vm.spot.geometry.coordinates[0] && !vm.spot.geometry.coordinates[1]) {
              geoError = '<b>Latitude</b> and <b>longitude</b> are required.';
            }
            else if (!vm.spot.geometry.coordinates[0]) geoError = '<b>Longitude</b> is required.';
            else if (!vm.spot.geometry.coordinates[1]) geoError = '<b>Latitude</b> is required.';
            if (geoError) {
              $ionicPopup.alert({
                'title': 'Validation Error!',
                'template': geoError
              });
              return false;
            }
          }
        }
        if (vm.survey) return FormFactory.validate(vm.survey, vm.data);
        return true;
      }
      return true;
    }

    // View the spot on the maps
    function viewMap() {
      if (_.has(vm.spot.properties, 'image_basemap')) {
        vm.submit('/app/image-basemaps/' + vm.spot.properties.image_basemap);
      }
      else {
        $ionicLoading.show({
          'template': '<ion-spinner></ion-spinner><br>Loading Map...'
        });
        MapViewFactory.setMapViewToSpot(vm.spot);
        vm.submit('/app/maps');
      }
    }
  }
}());
