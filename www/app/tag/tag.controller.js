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
    var lastType = undefined;
    var order = 'a';
    var visibleDatasets = [];

    vm.addRelationshipType = addRelationshipType;
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
    vm.relationshipTypes = [];
    vm.removeFeature = removeFeature;
    vm.removeSpot = removeSpot;
    vm.resetFilters = resetFilters;
    vm.selectItem = selectItem;
    vm.selectItemModal = {};
    vm.selectTypes = selectTypes;
    vm.selectTypesModal = {};
    vm.showField = showField;
    vm.showItem = 'spots';
    vm.showMore = showMore;
    vm.spots = [];
    vm.spotsDisplayed = [];
    vm.survey = [];
    vm.tags = [];
    vm.tagsDisplayed = [];
    vm.toggleChecked = toggleChecked;
    vm.toggleItem = toggleItem;
    vm.toggleTypeChecked = toggleTypeChecked;
    vm.typeSelected = typeSelected;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      loadTag();
      lastType = vm.data.type;

      // Fix all old tags which have a categorization element
      if (vm.data.categorization) {
        vm.data.type = 'other';
        vm.data.other_type = vm.data.categorization;
        delete vm.data.categorization;
      }

      visibleDatasets = SpotFactory.getVisibleDatasets();
      setVisibleSpots();
      setFeatures();
      setTags();

      createRelationshipModals();
      setRelationshipTypes();

      vm.currentSpot = SpotFactory.getCurrentSpot();
      if (!vm.currentSpot) HelpersFactory.setBackView($ionicHistory.currentView().url);
      else {
        // If we're adding a new tag from within a spot
        if (!vm.data.spots) vm.data.spots = [];
        if (!_.contains(vm.data.spots, vm.currentSpot.properties.id)) vm.data.spots.push(vm.currentSpot.properties.id);
      }

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

    function confirmRelationship() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Switch to Relationship Type',
        'template': 'Switching this Tag to the type Relationship will remove any Spots, Features or Tags already in this Tag. Are you sure you want to continue?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          lastType = vm.data.type;
          loadRelationship();
        }
        else vm.data.type = lastType;
      });
    }

    function createRelationshipModals() {
      $ionicModal.fromTemplateUrl('app/tag/select-item-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectItemModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/tag/select-relationship-types-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectTypesModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.selectItemModal.remove();
        vm.selectTypesModal.remove();
      });
    }

    function loadRelationship() {
      vm.data = {'name': vm.data.name, 'id': vm.data.id, 'type': vm.data.type};
      var id = $state.params.tag_id;
      _.extend(vm.data, ProjectFactory.getRelationship(id));
      $log.log('Loaded Relationship:', vm.data);
    }

    function loadTag() {
      var id = $state.params.tag_id;
      vm.data = ProjectFactory.getTag(id);
      vm.data.id = id;  // Just in case vm.tag is undefined
      $log.log('Loaded Tag:', vm.data);
    }

    function setFeatures() {
      vm.features = [];
      var featureElements = ['orientation_data', 'other_features', 'samples', '_3d_structures'];
      _.each(vm.spots, function (spot) {
        _.each(featureElements, function (featureElement) {
          if (spot.properties[featureElement]) {
            var featuresCopy = angular.copy(spot.properties[featureElement]);
            _.each(featuresCopy, function (featureCopy) {
              featureCopy.parentSpotId = spot.properties.id;
            });
            vm.features = _.union(vm.features, featuresCopy);
          }
        });
      });
      vm.featuresDisplayed = angular.copy(vm.features).slice(0, 25);
    }

    function setRelationshipTypes() {
      vm.relationshipTypes = ProjectFactory.getDefaultRelationshipTypes();
      _.each(vm.data.types, function (type) {
        if (!_.contains(vm.relationshipTypes, type)) vm.relationshipTypes.push(type);
      });
      ProjectFactory.saveProjectItem('relationship_types', vm.relationshipTypes);
    }

    function setTags() {
      vm.tags = ProjectFactory.getTags();
      vm.tagsDisplayed = angular.copy(vm.tags).slice(0, 25);
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

    function addRelationshipType() {
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="vm.otherRelationshipType">',
        title: 'Enter Other Relationship Type',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!vm.otherRelationshipType) e.preventDefault();
              else return vm.otherRelationshipType;
            }
          }
        ]
      });
      myPopup.then(function (res) {
        if (res) {
          vm.data.types.push(res);
          vm.otherRelationshipType = undefined;
          setRelationshipTypes();
        }
        else vm.data.types = _.without(vm.data.types, 'other');
      });
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
      if (modal === 'filterModal') setVisibleSpots();
      vm[modal].hide();
    }

    function filter() {
      vm.activeDatasets = ProjectFactory.getActiveDatasets();
      vm.filterModal.show();
    }

    function getNumTaggedFeatures(tag) {
      return ProjectFactory.getNumTaggedFeatures(tag);
    }

    function getFeatureName(spotId, featureId) {
      spotId = parseInt(spotId);
      var spot = SpotFactory.getSpotById(spotId);
      var found = undefined;
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
      if (Object.keys(vm.data).length > 1) {
        if (!vm.data.name) {
          $ionicPopup.alert({
            'title': 'No Name Given!',
            'template': 'Please give a name to this relationship.'
          });
        }
        else if (!vm.data.type) {
          $ionicPopup.alert({
            'title': 'No Type Given!',
            'template': 'Please give a type to this relationship.'
          });
        }
        else if (vm.data.type === 'relationship' && (!vm.data.a || !vm.data.b || !vm.data.types)) {
          $ionicPopup.alert({
            'title': 'Incomplete Relationship!',
            'template': 'Please specify both sides of the relationship and a relationship type.'
          });
        }
        else if (vm.data.type === 'geologic_unit' && !FormFactory.validate(vm.survey, vm.data)) {
          $log.log('Not valid');
        }
        else {
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
        if (vm.data[order] && vm.data[order][item] && vm.data[order][item][parentSpotId]) {
          return _.contains(vm.data[order][item][parentSpotId], id);
        }
      }
      else {
        if (vm.data[item]) return _.contains(vm.data[item], id);
        if (vm.data[order] && vm.data[order][item]) return _.contains(vm.data[order][item], id);
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
      var moreSpots = angular.copy(vm.spots).splice(vm.spotsDisplayed.length,
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

    function selectItem(inOrder) {
      order = inOrder;
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

    function showMore() {
      vm.isShowMore = !vm.isShowMore;
    }

    function toggleChecked(item, id, parentSpotId) {
      if (vm.data.type === 'relationship') {
        if (!vm.data[order]) vm.data[order] = {};
        if (item === 'features') {
          if (!vm.data[order][item]) vm.data[order][item] = {};
          if (!vm.data[order][item][parentSpotId]) vm.data[order][item][parentSpotId] = [];
          if (_.contains(vm.data[order][item][parentSpotId], id)) {
            vm.data[order][item][parentSpotId] = _.without(vm.data[order][item][parentSpotId], id);
          }
          else vm.data[order][item][parentSpotId].push(id);
          if (_.isEmpty(vm.data[order][item][parentSpotId])) delete vm.data[order][item][parentSpotId];
        }
        else {
          if (!vm.data[order][item]) vm.data[order][item] = [];
          if (_.contains(vm.data[order][item], id)) vm.data[order][item] = _.without(vm.data[order][item], id);
          else vm.data[order][item].push(id);
        }
        if (_.isEmpty(vm.data[order][item])) delete vm.data[order][item];
        if (_.isEmpty(vm.data[order])) delete vm.data[order];
      }
      // Not a relationship
      else {
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
    }

    function toggleItem(item) {
      vm.showItem = item;
    }

    function toggleTypeChecked(type) {
      if (!vm.data.types) vm.data.types = [];
      if (_.contains(vm.data.types, type)) vm.data.types = _.without(vm.data.types, type);
      else  vm.data.types.push(type);
      if (_.isEmpty(vm.data.types)) delete vm.data.types;
    }

    function typeSelected() {
      vm.survey = undefined;
      vm.choices = undefined;

      switch (vm.data.type) {
        case 'geologic_unit':
          lastType = vm.data.type;
          vm.survey = DataModelsFactory.getDataModel('rock_unit').survey;
          vm.choices = DataModelsFactory.getDataModel('rock_unit').choices;
          break;
        case 'relationship':
          if (vm.data.spots || vm.data.features || vm.data.tags) confirmRelationship();
          else {
            lastType = vm.data.type;
            loadRelationship();
          }
          break;
        default:
          lastType = vm.data.type;
          break;
      }
    }
  }
}());
