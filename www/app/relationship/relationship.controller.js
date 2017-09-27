(function () {
  'use strict';

  angular
    .module('app')
    .controller('RelationshipController', RelationshipController);

  RelationshipController.$inject = ['$ionicHistory', '$ionicModal', '$ionicPopup', '$location', '$log', '$rootScope',
    '$scope', '$state', '$timeout', 'HelpersFactory', 'LiveDBFactory', 'ProjectFactory', 'SpotFactory', 'SpotsFactory',
    'TagFactory', 'IS_WEB'];

  function RelationshipController($ionicHistory, $ionicModal, $ionicPopup, $location, $log, $rootScope, $scope, $state,
                                  $timeout, HelpersFactory, LiveDBFactory, ProjectFactory, SpotFactory, SpotsFactory,
                                  TagFactory, IS_WEB) {
    var vmParent = $scope.vm;
    var vm = this;

    var initializing = true;
    var order = 'a';

    vm.data = {};
    vm.dataChanged = false;
    vm.features = [];
    vm.featuresDisplayed = [];
    vm.filterConditions = {};
    vm.filterModal = {};
    vm.isFilterOn = false;
    vm.otherRelationshipType = undefined;
    vm.relationshipTypes = [];
    vm.selectItemModal = {};
    vm.showItem = 'spots';
    vm.spots = [];
    vm.spotsDisplayed = [];
    vm.tags = [];
    vm.tagsDisplayed = [];

    vm.addFilters = addFilters;
    vm.addRelationshipType = addRelationshipType;
    vm.applyFilters = applyFilters;
    vm.checkedDataset = checkedDataset;
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
    vm.resetFilters = resetFilters;
    vm.selectItem = selectItem;
    vm.selectTypes = selectTypes;
    vm.toggleChecked = toggleChecked;
    vm.toggleFilter = toggleFilter;
    vm.toggleItem = toggleItem;
    vm.toggleTypeChecked = toggleTypeChecked;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      loadRelationship();
      setDisplayedSpots();
      setFeatures();
      setTags();

      createPageComponents();
      createPageEvents()
      setRelationshipTypes();

      vm.currentSpot = SpotFactory.getCurrentSpot();

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

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
          if (vm.dataChanged && fromState.name === 'app.relationships.relationship') {
            event.preventDefault();
            if (toParams.relationship_id) go('/app/relationships/' + toParams.relationship_id);
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

      $ionicModal.fromTemplateUrl('app/relationship/select-relationship-types-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectTypesModal = modal;
      });

      SpotsFactory.createSpotsFilterModal($scope).then(function (modal) {
        vm.filterModal = modal
      });
    }

    function createPageEvents() {
      // Cleanup the modals when we're done with it!
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
      vm.data = HelpersFactory.cleanObj(vm.data);
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
            $log.log('Relationship saved');
            vm.dataChanged = false;
            if (IS_WEB) {
              $log.log('Save relationship to LiveDB.', ProjectFactory.getCurrentProject());
              LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
              vmParent.updateRelationships();
            }
            $location.path(path);
          });
        }
      }
      else {
        if (IS_WEB) {
          $ionicPopup.alert({
            'title': 'Incomplete Data!',
            'template': 'Please enter more fields to save this relationship.'
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
      vm.filterConditions = {};
      SpotsFactory.setFilterConditions(vm.filterConditions);
      setDisplayedSpots();
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

    function toggleFilter(filter, emptyType) {
      if (vm.filterConditions[filter]) delete vm.filterConditions[filter]
      else vm.filterConditions[filter] = emptyType || undefined;
    }

    function toggleItem(item) {
      vm.showItem = item;
    }

    function toggleTypeChecked(type) {
      if (!vm.data.types) vm.data.types = [];
      if (_.contains(vm.data.types, type)) vm.data.types = _.without(vm.data.types, type);
      else vm.data.types.push(type);
      if (_.isEmpty(vm.data.types)) delete vm.data.types;
    }
  }
}());
