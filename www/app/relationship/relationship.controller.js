(function () {
  'use strict';

  angular
    .module('app')
    .controller('RelationshipController', RelationshipController);

  RelationshipController.$inject = ['$ionicHistory', '$ionicModal', '$ionicPopup', '$location', '$log', '$scope',
    '$state', 'HelpersFactory', 'ProjectFactory', 'SpotFactory', 'TagFactory', 'IS_WEB'];

  function RelationshipController($ionicHistory, $ionicModal, $ionicPopup, $location, $log, $scope, $state,
                                  HelpersFactory, ProjectFactory, SpotFactory, TagFactory, IS_WEB) {
    var vmParent = $scope.vm;
    var vm = this;

    var order = 'a';
    var visibleDatasets = [];

    vm.addRelationshipType = addRelationshipType;
    vm.checkedDataset = checkedDataset;
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
    vm.isTypeChecked = isTypeChecked;
    vm.keyToId = keyToId;
    vm.loadMoreSpots = loadMoreSpots;
    vm.moreSpotsCanBeLoaded = moreSpotsCanBeLoaded;
    vm.otherRelationshipType = undefined;
    vm.relationshipTypes = [];
    vm.resetFilters = resetFilters;
    vm.selectItem = selectItem;
    vm.selectItemModal = {};
    vm.selectTypes = selectTypes;
    vm.showItem = 'spots';
    vm.spots = [];
    vm.spotsDisplayed = [];
    vm.tags = [];
    vm.tagsDisplayed = [];
    vm.toggleChecked = toggleChecked;
    vm.toggleItem = toggleItem;
    vm.toggleTypeChecked = toggleTypeChecked;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      visibleDatasets = SpotFactory.getVisibleDatasets();
      loadRelationship();
      setVisibleSpots();
      setFeatures();
      setTags();

      createModals();
      setRelationshipTypes();

      vm.currentSpot = SpotFactory.getCurrentSpot();
      if (!vm.currentSpot && !IS_WEB) HelpersFactory.setBackView($ionicHistory.currentView().url);
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/shared/select-item-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectItemModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/relationship/select-relationship-types-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectTypesModal = modal;
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
        vm.selectTypesModal.remove();
        vm.filterModal.remove();
      });
    }

    function loadRelationship() {
      vm.data = {'name': vm.data.name, 'id': vm.data.id, 'type': vm.data.type};
      var id = $state.params.relationship_id;
      vm.data = ProjectFactory.getRelationship(id);
      vm.data.id = id;  // Just in case vm.tag is undefined
      $log.log('Loaded Relationship:', vm.data);
    }

    function setRelationshipTypes() {
      vm.relationshipTypes = _.union(ProjectFactory.getRelationshipTypes(),
        ProjectFactory.getDefaultRelationshipTypes());
      vm.relationshipTypes = _.union(vm.relationshipTypes, vm.data.types);
      ProjectFactory.saveProjectItem('relationship_types', vm.relationshipTypes);
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

    function addRelationshipType() {
      vm.otherRelationshipType = undefined;
      var myPopup = $ionicPopup.show({
        'template': '<input type="text" ng-model="vm.otherRelationshipType">',
        'title': 'Enter Other Relationship Type',
        'scope': $scope,
        'buttons': [
          {'text': 'Cancel'},
          {
            'text': '<b>Save</b>',
            'type': 'button-positive',
            'onTap': function (e) {
              if (!vm.otherRelationshipType) e.preventDefault();
              else return vm.otherRelationshipType;
            }
          }
        ]
      });
      myPopup.then(function (res) {
        if (res) {
          if (!vm.data.types) vm.data.types = [];
          vm.data.types.push(res);
          setRelationshipTypes();
        }
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
        // If any one of a, b or types exist then all must exist or error
        else if ((vm.data.a || vm.data.b || vm.data.types) && (!vm.data.a || !vm.data.b || !vm.data.types)) {
          $ionicPopup.alert({
            'title': 'Incomplete Relationship!',
            'template': 'Please specify both sides of the relationship and a relationship type.'
          });
        }
        else {
          ProjectFactory.saveRelationship(vm.data).then(function () {
            if (IS_WEB) vmParent.updateRelationships();
            $location.path(path);
          });
        }
      }
      else $location.path(path);
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

    function isDatasetChecked(id) {
      return _.find(visibleDatasets, function (visibleDataset) {
        return visibleDataset === id;
      });
    }

    function isOptionChecked(item, id, parentSpotId) {
      if (!vm.data[order]) return false;
      if (item === 'features') {
        if (vm.data[order][item] && vm.data[order][item][parentSpotId]) {
          return _.contains(vm.data[order][item][parentSpotId], id);
        }
      }
      else {
        if (vm.data[order][item]) return _.contains(vm.data[order][item], id);
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

    function toggleChecked(item, id, parentSpotId) {
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

    function toggleItem(item) {
      vm.showItem = item;
    }

    function toggleTypeChecked(type) {
      if (!vm.data.types) vm.data.types = [];
      if (_.contains(vm.data.types, type)) vm.data.types = _.without(vm.data.types, type);
      else  vm.data.types.push(type);
      if (_.isEmpty(vm.data.types)) delete vm.data.types;
    }

  }
}());