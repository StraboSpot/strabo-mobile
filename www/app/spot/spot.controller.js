(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicModal', '$ionicPopover', '$ionicPopup', '$location', '$log', '$scope',
    '$state', 'FormFactory', 'HelpersFactory', 'MapViewFactory', 'ProjectFactory', 'SpotFactory'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicModal, $ionicPopover, $ionicPopup, $location, $log, $scope, $state,
                          FormFactory, HelpersFactory, MapViewFactory, ProjectFactory, SpotFactory) {
    var vm = this;

    // Tags Variables
    vm.addTagModal = {};
    vm.addTagModalTitle = undefined;
    vm.allTags = [];
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
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getTagNames = getTagNames;
    vm.isTagChecked = isTagChecked;
    vm.loadTags = loadTags;
    vm.toggleTagChecked = toggleTagChecked;

    vm.choices = undefined;
    vm.closeModal = closeModal;
    vm.copyThisSpot = copyThisSpot;
    vm.createTag = createTag;
    vm.data = {};
    vm.deleteSpot = deleteSpot;
    vm.getMax = getMax;
    vm.getMin = getMin;
    vm.goBack = goBack;
    vm.isOptionChecked = isOptionChecked;
    vm.loadTab = loadTab;
    vm.popover = {};
    vm.setSelMultClass = setSelMultClass;
    vm.showField = showField;
    vm.showRadius = true;
    vm.showRockUnit = true;
    vm.showSurfaceFeature = false;
    vm.showTab = showTab;
    vm.showTrace = false;
    vm.spot = {};
    vm.stateName = $state.current.name;
    vm.submit = submit;
    vm.survey = undefined;
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

      $ionicModal.fromTemplateUrl('app/spot/add-tag-modal.html', {
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

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/spot/spot-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });
    }

    // Set the current spot
    function setSpot(id) {
      SpotFactory.setCurrentSpotById(id);
      vm.spot = SpotFactory.getCurrentSpot();

      if (ProjectFactory.getActiveTagging()) ProjectFactory.addToActiveTags(vm.spot.properties.id);
      if (SpotFactory.getActiveNesting()) SpotFactory.addSpotToActiveNest(vm.spot);

      // Convert date string to Date type
      vm.spot.properties.date = new Date(vm.spot.properties.date);
      vm.spot.properties.time = new Date(vm.spot.properties.time);

      vm.spotTitle = vm.spot.properties.name;
      vm.spots = SpotFactory.getActiveSpots();

      if (vm.stateName === 'app.spotTab.spot') vm.data = vm.spot.properties;

      $log.log('Spot loaded: ', vm.spot);
    }

    /**
     * Public Functions
     */

    function addTag(feature) {
      vm.featureId = (feature) ? feature.id : undefined;
      vm.addTagModal.show();
    }

    // Create a new spot with the details from this spot
    function copyThisSpot() {
      vm.popover.hide();
      var newSpot = _.omit(vm.spot, 'properties');
      newSpot.properties = _.omit(vm.spot.properties,
        ['name', 'id', 'date', 'time', 'modified_timestamp', 'images', 'samples', 'inferences']);
      SpotFactory.setNewSpot(newSpot).then(function (id) {
        submit('/app/spotTab/' + id + '/spot');
      });
    }

    function closeModal(modal) {
      vm[modal].hide();
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

    function getMax(constraint) {
      return FormFactory.getMax(constraint);
    }

    function getMin(constraint) {
      return FormFactory.getMin(constraint);
    }

    function getNumTaggedFeatures(tag) {
      return ProjectFactory.getNumTaggedFeatures(tag);
    }

    function getTagNames(feature) {
      var featureTags = _.filter(vm.allTags, function (tag) {
        if (tag.features && tag.features[vm.spot.properties.id]) {
          return _.contains(tag.features[vm.spot.properties.id], feature.id);
        }
      });
      return _.pluck(_.sortBy(featureTags, 'name'), 'name').join(', ');
    }

    function goBack() {
      SpotFactory.clearCurrentSpot();
      if (vm.spot) submit(HelpersFactory.getBackView());
      else $location.path(HelpersFactory.getBackView());
    }

    function isOptionChecked(field, choice) {
      if (vm.spot) {
        if (vm.data[field]) return vm.data[field].indexOf(choice) !== -1;
      }
      else return false;
    }

    function isTagChecked(tag) {
      if (vm.spot) {
        if (vm.stateName === 'app.spotTab.tags') {
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
      loadTags();

      vm.showTrace = false;
      vm.showRockUnit = true;
      vm.showSurfaceFeature = false;
      if (vm.spot.geometry && vm.spot.geometry.type === 'LineString') {
        vm.showTrace = true;
        if (!vm.spot.properties.trace) vm.spot.properties.trace = {};
        vm.data = vm.spot.properties.trace;
        vm.showRockUnit = false;
      }
      if (vm.spot.geometry && vm.spot.geometry.type === 'Polygon') {
        vm.showRadius = false;
        vm.showSurfaceFeature = true;
        if (!vm.spot.properties.surface_feature) vm.spot.properties.surface_feature = {};
        vm.data = vm.spot.properties.surface_feature;
      }
    }

    function loadTags() {
      if (vm.stateName === 'app.spotTab.tags') vm.addTagModalTitle = 'Add Spot Level Tags';
      else vm.addTagModalTitle = 'Add Feature Level Tags';
      vm.allTags = ProjectFactory.getTags();
      var tags = ProjectFactory.getTagsBySpotId(vm.spot.properties.id);
      vm.spotLevelTags = _.filter(tags, function (tag) {
        return tag.spots && _.contains(tag.spots, vm.spot.properties.id);
      });
      vm.featureLevelTags = _.filter(tags, function (tag) {
        return tag.features && tag.features[vm.spot.properties.id];
      });

      vm.spotLevelTags = [];
      vm.featureLevelTags = [];

      _.each(tags, function (tag) {
        if (tag.spots && _.contains(tag.spots, vm.spot.properties.id)) vm.spotLevelTags.push(tag);
        if (tag.features && tag.features[vm.spot.properties.id]) vm.featureLevelTags.push(tag);

        // Get if in a relationship tag
        if (tag.a && tag.a.spots && _.contains(tag.a.spots, vm.spot.properties.id)) {
          if (!_.contains(vm.spotLevelTags, tag)) vm.spotLevelTags.push(tag);
        }
        if (tag.a && tag.a.features && tag.a.features[vm.spot.properties.id]) {
          if (!_.contains(vm.featureLevelTags, tag)) vm.featureLevelTags.push(tag);
        }
        if (tag.b && tag.b.spots && _.contains(tag.b.spots, vm.spot.properties.id)) {
          if (!_.contains(vm.spotLevelTags, tag)) vm.spotLevelTags.push(tag);
        }
        if (tag.b && tag.b.features && tag.b.features[vm.spot.properties.id]) {
          if (!_.contains(vm.featureLevelTags, tag)) vm.featureLevelTags.push(tag);
        }
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
          $log.log('Saved spot: ', vm.spot);
          $log.log('All spots: ', spots);
          $location.path(toPath);
        });
      }
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
      if (vm.stateName === 'app.spotTab.tags') {
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

    // View the spot on the map
    function viewMap() {
      if (_.has(vm.spot.properties, 'image_basemap')) {
        vm.submit('/app/image-basemaps/' + vm.spot.properties.image_basemap);
      }
      else {
        MapViewFactory.setMapViewToSpot(vm.spot);
        vm.submit('/app/map');
      }
    }
  }
}());
