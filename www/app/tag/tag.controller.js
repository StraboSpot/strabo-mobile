(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagController', TagController);

  TagController.$inject = ['$ionicHistory', '$ionicModal', '$ionicPopup', '$location', '$log', '$rootScope', '$scope',
    '$state', '$timeout', 'HelpersFactory', 'FormFactory', 'LiveDBFactory', 'ProjectFactory', 'SpotFactory',
    'SpotsFactory', 'TagFactory', 'IS_WEB'];

  function TagController($ionicHistory, $ionicModal, $ionicPopup, $location, $log, $rootScope, $scope, $state, $timeout,
                         HelpersFactory, FormFactory, LiveDBFactory, ProjectFactory, SpotFactory, SpotsFactory,
                         TagFactory, IS_WEB) {
    var vmParent = $scope.vm;
    var vm = this;

    var initializing = true;

    vm.color = undefined;
    vm.colorPickerModal = {};
    vm.data = {};
    vm.dataChanged = false;
    vm.features = [];
    vm.featuresDisplayed = [];
    vm.filterConditions = {};
    vm.filterModal = {};
    vm.isFilterOn = false;
    vm.isShowMore = false;
    vm.selectItemModal = {};
    vm.selectTypesModal = {};
    vm.showItem = 'spots';
    vm.spots = [];
    vm.spotsDisplayed = [];
    vm.tags = [];
    vm.tagsDisplayed = [];

    vm.addFilters = addFilters;
    vm.applyFilters = applyFilters;
    vm.checkedDataset = checkedDataset;
    vm.clearColor = clearColor;
    vm.closeFilterModal = closeFilterModal;
    vm.closeModal = closeModal;
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getFeatureName = getFeatureName;
    vm.getSpotName = getSpotName;
    vm.getTagName = getTagName;
    vm.go = go;
    vm.goToSpot = goToSpot;
    vm.goToTag = goToTag;
    vm.isDatasetChecked = isDatasetChecked;
    vm.isOptionChecked = isOptionChecked;
    vm.isShowItem = isShowItem;
    vm.isTypeChecked = isTypeChecked;
    vm.keyToId = keyToId;
    vm.loadMoreSpots = loadMoreSpots;
    vm.moreSpotsCanBeLoaded = moreSpotsCanBeLoaded;
    vm.openColorPicker = openColorPicker;
    vm.resetFilters = resetFilters;
    vm.selectItem = selectItem;
    vm.selectTypes = selectTypes;
    vm.setColor = setColor;
    vm.toggleChecked = toggleChecked;
    vm.toggleFilter = toggleFilter;
    vm.toggleItem = toggleItem;
    vm.toggleShowMore = toggleShowMore;
    vm.toggleTypeChecked = toggleTypeChecked;
    vm.typeSelected = typeSelected;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      loadTag();
      setDisplayedSpots();
      setFeatures();
      setTags();

      createPageComponents();
      createPageEvents()

      vm.currentSpot = SpotFactory.getCurrentSpot();
      if (vm.currentSpot) {
        // If we're adding a new tag from within a spot
        if (!vm.data.spots) vm.data.spots = [];
        if (!_.contains(vm.data.spots, vm.currentSpot.properties.id)) vm.data.spots.push(vm.currentSpot.properties.id);
      }
      var selectedSpots = SpotFactory.getSelectedSpots();
      if (!_.isEmpty(selectedSpots)) {
        if (!vm.data.spots) vm.data.spots = [];
        _.each(selectedSpots, function (selectedSpot) {
          vm.data.spots.push(selectedSpot.properties.id);
        });
        SpotFactory.clearSelectedSpots();
      }

      if (IS_WEB) {
        $scope.$watch('vm.data', function (newValue, oldValue, scope) {
          if (!_.isEmpty(newValue)) {
            if (initializing || oldValue.id !== newValue.id) {
              vm.dataChanged = false;
              $timeout(function () {
                initializing = false;
              });
            }
            else {
              //$log.log('CHANGED vm.data', 'new value', newValue, 'oldValue', oldValue);
              vm.dataChanged = true;
            }
          }
        }, true);

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
          if (vm.dataChanged && fromState.name === 'app.tags.tag') {
            event.preventDefault();
            if (toParams.tag_id) go('/app/tags/' + toParams.tag_id);
            else go('/app' + toState.url);
          }
        });
      }
    }

    function createPageComponents() {
      $ionicModal.fromTemplateUrl('app/shared/select-item-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectItemModal = modal;
      });

      SpotsFactory.createSpotsFilterModal($scope).then(function (modal) {
        vm.filterModal = modal
      });

      $ionicModal.fromTemplateUrl('app/shared/color-picker-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.colorPickerModal = modal;
      });
    }

    function createPageEvents() {
      // Cleanup the modals when we're done with it!
      $scope.$on('$destroy', function () {
        vm.selectItemModal.remove();
        vm.filterModal.remove();
      });
    }

    function loadTag() {
      var id = $state.params.tag_id;
      vm.data = ProjectFactory.getTag(id);
      vm.data.id = id;  // Just in case vm.tag is undefined

      if (vm.data.color) vm.color = vm.data.color;

      if (vm.data.type === 'geologic_unit') FormFactory.setForm('rock_unit');

      // Fix all old tags which have a categorization element
      if (vm.data.categorization) {
        vm.data.type = 'other';
        vm.data.other_type = vm.data.categorization;
        delete vm.data.categorization;
      }

      $log.log('Loaded Tag:', vm.data);
    }

    function setFeatures() {
      vm.features = [];
      var featureElements = ['orientation_data', 'other_features', 'samples', '_3d_structures'];
      _.each(vm.spots, function (spot) {
        _.each(featureElements, function (featureElement) {
          if (spot.properties[featureElement]) {
            var featuresCopy = angular.fromJson(angular.toJson(spot.properties[featureElement]));
            _.each(featuresCopy, function (featureCopy) {
              featureCopy.parentSpotId = spot.properties.id;
            });
            vm.features = _.union(vm.features, featuresCopy);
          }
        });
      });
      vm.featuresDisplayed = angular.fromJson(angular.toJson(vm.features)).slice(0, 25);
    }

    function setTags() {
      vm.tags = ProjectFactory.getTags();
      vm.tagsDisplayed = angular.fromJson(angular.toJson(vm.tags)).slice(0, 25);
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
      vm.filterConditions = angular.fromJson(angular.toJson(SpotsFactory.getFilterConditions()));
      vm.filterModal.show();
    }

    function applyFilters() {
      if (_.isEmpty(vm.filterConditions)) resetFilters();
      else if (SpotsFactory.areValidFilters(vm.filterConditions)) {
        SpotsFactory.setFilterConditions(vm.filterConditions);
        setDisplayedSpots();
        vm.filterModal.hide();
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

    function clearColor() {
      if (vm.data.color) delete vm.data.color;
      vm.color = undefined;
      vm.colorPickerModal.hide();
    }

    function closeFilterModal() {
      vm.filterModal.hide();
    }

    function closeModal(modal) {
      vm[modal].hide();
    }

    function getNumTaggedFeatures(tag) {
      return TagFactory.getNumTaggedFeatures(tag);
    }

    function getFeatureName(spotId, featureId) {
      spotId = parseInt(spotId);
      var spot = SpotFactory.getSpotById(spotId);
      var found;
      _.each(spot.properties, function (property) {
        if (!found) {
          found = _.find(property, function (item) {
            return item.id === featureId;
          });
        }
      });
      return (found && found.label) ? found.label : 'Unknown Name';
    }

    function getSpotName(spotId) {
      return SpotFactory.getNameFromId(spotId);
    }

    function getTagName(id) {
      var tag = ProjectFactory.getTag(id);
      return tag.name;
    }

    function go(path) {
      // If there is something filled out besides two of id, name or type
      vm.data = HelpersFactory.cleanObj(vm.data);
      if (Object.keys(vm.data).length > 2) {
        if (vm.data.type === 'geologic_unit' && vm.data.name && !vm.data.unit_label_abbreviation) {
          vm.data.unit_label_abbreviation = vm.data.name;
        }
        if (!vm.data.name) {
          $ionicPopup.alert({
            'title': 'No Name Given!',
            'template': 'Please give a name to this tag.'
          });
        }
        else if (!vm.data.type) {
          $ionicPopup.alert({
            'title': 'No Type Given!',
            'template': 'Please give a type to this tag.'
          });
        }
        else {
          if (TagFactory.getAddNewActiveTag()) {
            TagFactory.setActiveTags(vm.data);
            TagFactory.setAddNewActiveTag(false);
          }
          ProjectFactory.saveTag(vm.data).then(function () {
            $log.log('Tag saved');
            vm.dataChanged = false;
            if (IS_WEB) {
              $log.log('Save tags to LiveDB.', ProjectFactory.getCurrentProject());
              LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
              vmParent.updateTags();
            }
            $location.path(path);
          });
        }
      }
      else {
        if (IS_WEB) {
          $ionicPopup.alert({
            'title': 'Incomplete Data!',
            'template': 'Please enter more fields to save this tag.'
          });
        }
        $location.path(path);
      }
    }

    function goToSpot(spotId) {
      SpotFactory.goToSpot(spotId);
    }

    function goToTag(id) {
      $location.path('/app/tags/' + id);
    }

    function keyToId(key) {
      return parseInt(key);
    }

    function isDatasetChecked(datasetId) {
      return _.contains(vm.filterConditions.datasets, datasetId) || false;
    }

    function isOptionChecked(item, id, parentSpotId) {
      if (item === 'features') {
        if (vm.data[item] && vm.data[item][parentSpotId]) {
          return _.contains(vm.data[item][parentSpotId], id);
        }
      }
      else {
        if (vm.data[item]) return _.contains(vm.data[item], id);
      }
      return false;
    }

    function isShowItem(item) {
      return vm.showItem === item;
    }

    function isTypeChecked(type) {
      return _.contains(vm.data.types, type);
    }

    function loadMoreSpots() {
      var moreSpots = angular.fromJson(angular.toJson(vm.spots)).splice(vm.spotsDisplayed.length,
        vm.spotsDisplayed.length + 20);
      vm.spotsDisplayed = _.union(vm.spotsDisplayed, moreSpots);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    function moreSpotsCanBeLoaded() {
      return vm.spotsDisplayed.length !== vm.spots.length;
    }

    function openColorPicker() {
      vm.colorPickerModal.show();
    }

    function resetFilters() {
      vm.filterConditions = {};
      SpotsFactory.setFilterConditions(vm.filterConditions);
      setDisplayedSpots();
    }

    function selectItem() {
      vm.showItem = 'spots';
      vm.selectItemModal.show();
    }

    function selectTypes() {
      vm.selectTypesModal.show();
    }

    function setColor(color) {
      vm.colorPickerModal.hide();
      vm.data.color = color;
      vm.color = color;
    }

    function toggleChecked(item, id, parentSpotId) {
      if (item === 'features') {
        if (!vm.data[item]) vm.data[item] = {};
        if (!vm.data[item][parentSpotId]) vm.data[item][parentSpotId] = [];
        if (_.contains(vm.data[item][parentSpotId], id)) {
          vm.data[item][parentSpotId] = _.without(vm.data[item][parentSpotId], id);
        }
        else vm.data[item][parentSpotId].push(id);
        if (_.isEmpty(vm.data[item][parentSpotId])) delete vm.data[item][parentSpotId];
      }
      else {
        if (!vm.data[item]) vm.data[item] = [];
        if (_.contains(vm.data[item], id)) vm.data[item] = _.without(vm.data[item], id);
        else vm.data[item].push(id);
      }
      if (_.isEmpty(vm.data[item])) delete vm.data.item;
    }

    function toggleItem(item) {
      vm.showItem = item;
    }

    function toggleFilter(filter, emptyType) {
      if (vm.filterConditions[filter]) delete vm.filterConditions[filter]
      else vm.filterConditions[filter] = emptyType || undefined;
    }

    function toggleShowMore() {
      vm.isShowMore = !vm.isShowMore;
    }

    function toggleTypeChecked(type) {
      if (!vm.data.types) vm.data.types = [];
      if (_.contains(vm.data.types, type)) vm.data.types = _.without(vm.data.types, type);
      else vm.data.types.push(type);
      if (_.isEmpty(vm.data.types)) delete vm.data.types;
    }

    function typeSelected() {
      FormFactory.clearForm();

      if (vm.data.type === 'geologic_unit') FormFactory.setForm('rock_unit');
    }
  }
}());
