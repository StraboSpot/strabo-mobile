(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagController', TagController);

  TagController.$inject = ['$ionicHistory', '$ionicModal', '$ionicPopup', '$location', '$log', '$scope', '$state',
    'DataModelsFactory', 'HelpersFactory', 'FormFactory', 'ProjectFactory', 'SpotFactory', 'TagFactory', 'IS_WEB'];

  function TagController($ionicHistory, $ionicModal, $ionicPopup, $location, $log, $scope, $state, DataModelsFactory,
                         HelpersFactory, FormFactory, ProjectFactory, SpotFactory, TagFactory, IS_WEB) {
    var vmParent = $scope.vm;
    var vm = this;

    var isDelete = false;
    var visibleDatasets = [];

    vm.checkedDataset = checkedDataset;
    vm.choices = [];
    vm.closeModal = closeModal;
    vm.data = {};
    vm.features = [];
    vm.featuresDisplayed = [];
    vm.filter = filter;
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
    vm.isShowMore = false;
    vm.isTypeChecked = isTypeChecked;
    vm.loadMoreSpots = loadMoreSpots;
    vm.moreSpotsCanBeLoaded = moreSpotsCanBeLoaded;
    vm.keyToId = keyToId;
    vm.removeFeature = removeFeature;
    vm.removeSpot = removeSpot;
    vm.resetFilters = resetFilters;
    vm.selectItem = selectItem;
    vm.selectItemModal = {};
    vm.selectTypes = selectTypes;
    vm.selectTypesModal = {};
    vm.showField = showField;
    vm.showItem = 'spots';
    vm.spots = [];
    vm.spotsDisplayed = [];
    vm.survey = [];
    vm.tags = [];
    vm.tagsDisplayed = [];
    vm.toggleChecked = toggleChecked;
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
      visibleDatasets = SpotFactory.getVisibleDatasets();
      setVisibleSpots();
      setFeatures();
      setTags();

      createModals();

      vm.currentSpot = SpotFactory.getCurrentSpot();
      if (!vm.currentSpot && !IS_WEB) HelpersFactory.setBackView($ionicHistory.currentView().url);
      else if (vm.currentSpot) {
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
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/shared/select-item-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectItemModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/spots/spots-filter-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.filterModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.selectItemModal.remove();
        vm.filterModal.remove();
      });
    }

    function loadTag() {
      var id = $state.params.tag_id;
      vm.data = ProjectFactory.getTag(id);
      vm.data.id = id;  // Just in case vm.tag is undefined
      if (vm.data.type === 'geologic_unit') {
        vm.survey = DataModelsFactory.getDataModel('rock_unit').survey;
        vm.choices = DataModelsFactory.getDataModel('rock_unit').choices;
      }

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
      vm.spotsDisplayed = angular.fromJson(angular.toJson(vm.spots)).slice(0, 25);
    }

    /**
     * Public Functions
     */

    function checkedDataset(dataset) {
      $log.log('visibleDatasets:', visibleDatasets);
      var i = _.indexOf(visibleDatasets, dataset);
      if (i === -1) visibleDatasets.push(dataset);
      else visibleDatasets.splice(i, 1);
      SpotFactory.setVisibleDatasets(visibleDatasets);
      $log.log('visibleDatasets after:', visibleDatasets);
    }

    function closeModal(modal) {
      if (modal === 'filterModal') {
        setVisibleSpots();
        setFeatures();
      }
      vm[modal].hide();
    }

    function filter() {
      vm.activeDatasets = ProjectFactory.getActiveDatasets();
      vm.filterModal.show();
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
            if (IS_WEB) vmParent.updateTags();
            $location.path(path);
          });
        }
      }
      else $location.path(path);
    }

    function goToSpot(spotId) {
      if (!isDelete) SpotFactory.goToSpot(spotId);
    }

    function goToTag(id) {
      $location.path('/app/tags/' + id);
    }

    function keyToId(key) {
      return parseInt(key);
    }

    function isDatasetChecked(id) {
      return _.find(visibleDatasets, function (visibleDataset) {
        return visibleDataset === id;
      });
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

    function removeFeature(spotId, featureId) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Remove Feature',
        'template': 'Are you sure you want to remove the Feature <b>' + getFeatureName(
          spotId, featureId) + '</b> from this Tag Group? This will <b>not</b> delete the Feature itself.'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.removeTagFromFeature(vm.data.id, spotId, featureId).then(function () {
            loadTag();
          });
        }
        isDelete = false;
      });
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
      SpotFactory.setVisibleDatasets(visibleDatasets);
      setVisibleSpots();
    }

    function selectItem() {
      vm.showItem = 'spots';
      vm.selectItemModal.show();
    }

    function selectTypes() {
      vm.selectTypesModal.show();
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
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
      vm.survey = undefined;
      vm.choices = undefined;

      if (vm.data.type === 'geologic_unit') {
        vm.survey = DataModelsFactory.getDataModel('rock_unit').survey;
        vm.choices = DataModelsFactory.getDataModel('rock_unit').choices;
      }
    }
  }
}());
