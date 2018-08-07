(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagController', TagController);

  TagController.$inject = ['$ionicHistory', '$ionicModal', '$ionicPopup', '$ionicScrollDelegate', '$location', '$log', 
  '$q', '$rootScope', '$scope', '$state', '$timeout', 'DataModelsFactory', 'HelpersFactory', 'FormFactory',
  'LiveDBFactory', 'MineralsFactory', 'ProjectFactory', 'SpotFactory', 'SpotsFactory', 'TagFactory', 'IS_WEB'];

  function TagController($ionicHistory, $ionicModal, $ionicPopup, $ionicScrollDelegate, $location, $log, $q,
   $rootScope, $scope, $state, $timeout, DataModelsFactory, HelpersFactory, FormFactory, LiveDBFactory,
   MineralsFactory,ProjectFactory, SpotFactory, SpotsFactory, TagFactory, IS_WEB) {
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
    vm.isShowInfoOnly = true;
    vm.isShowMineralList = true;
    vm.isShowMore = false;
    vm.mineralInfo = [];
    vm.mineralsModal = {};
    vm.modalData = {};
    vm.modalTitle = "";
    vm.selectItemModal = {};
    vm.selectTypesModal = {};
    vm.showItem = 'spots';
    vm.spots = [];
    vm.spotsDisplayed = [];
    vm.tags = [];
    vm.tagsDisplayed = [];

    vm.addFilters = addFilters;
    vm.addMineral = addMineral;
    vm.applyFilters = applyFilters;
    vm.checkedFilterCondition = checkedFilterCondition;
    vm.clearColor = clearColor;
    vm.closeFilterModal = closeFilterModal;
    vm.closeModal = closeModal;
    vm.getFeatureName = getFeatureName;
    vm.getLabel = getLabel;
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getSpotName = getSpotName;
    vm.getTagName = getTagName;
    vm.go = go;
    vm.goBack = goBack;
    vm.goToSpot = goToSpot;
    vm.goToTag = goToTag;
    vm.hideMineralInfo = hideMineralInfo;
    vm.isFilterConditionChecked = isFilterConditionChecked;
    vm.isOptionChecked = isOptionChecked;
    vm.isShowItem = isShowItem;
    vm.isTypeChecked = isTypeChecked;
    vm.keyToId = keyToId;
    vm.loadMoreSpots = loadMoreSpots;
    vm.mineralInfoOnMainPage = mineralInfoOnMainPage;
    vm.moreSpotsCanBeLoaded = moreSpotsCanBeLoaded;
    vm.openColorPicker = openColorPicker;
    vm.resetFilters = resetFilters;
    vm.selectItem = selectItem;
    vm.selectTypes = selectTypes;
    vm.setColor = setColor;
    vm.showMineralInfo =showMineralInfo;
    vm.submitMineral = submitMineral;
    vm.submitTag = submitTag;
    vm.switchMineralsForm = switchMineralsForm;
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
      createPageEvents();

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

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
          if (vm.dataChanged && fromState.name === 'app.tags.tag') {
            event.preventDefault();
            if (toParams.tag_id) go('/app/tags/' + toParams.tag_id);
            else go('/app' + toState.url);
          }
        });
      }
    }

    function addMineral(type) {
      FormFactory.setForm('minerals', type);
      var combine = [];
      if (!_.isEmpty(vm.data.minerals)) {
        combine = JSON.parse(JSON.stringify(vm.data.minerals));
      }
      vm.modalData.most_common = combine;
      vm.modalData.all = combine;
      vm.activeState = "most_common";

      if (type === 'metamorphic_most_common') vm.modalTitle = 'Metamorphic Minerals';
      else if (type === 'igneous_most_common') vm.modalTitle = 'Igneous Minerals';
      else if (type === 'sedimentary_most_common') vm.modalTitle = 'Sedimentary Minerals';

      vm.isShowInfoOnly = false;
      vm.isShowMineralList = true;
      vm.mineralsModal.show();
    }

    function createPageComponents() {
      $ionicModal.fromTemplateUrl('app/shared/select-item-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectItemModal = modal;
      });

      SpotsFactory.createSpotsFilterModal($scope).then(function (modal) {
        vm.filterModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/shared/color-picker-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.colorPickerModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/tag/minerals-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.mineralsModal = modal;
      });
    }

    function createPageEvents() {
      // Cleanup the modals when we're done with it!
      $scope.$on('$destroy', function () {
        if (vm.selectItemModal) vm.selectItemModal.remove();
        if (vm.filterModal) vm.filterModal.remove();
        if (vm.colorPickerModal) vm.colorPickerModal.remove();
        if (vm.mineralsModal) vm.mineralsModal.remove();
      });
    }

    // Change old data into new data format
    function fixOldData() {
      var origData = angular.fromJson(angular.toJson(vm.data));

      // Fix all old tags which have a categorization element
      if (vm.data.categorization) {
        vm.data.type = 'other';
        vm.data.other_type = vm.data.categorization;
        delete vm.data.categorization;
      }

      if (vm.data.type === 'geologic_unit') fixOldGeologicUnitData();

      if (!_.isEqual(origData, vm.data)) saveTag();
    }

    // Change old data into new data format for Rock Unit Description form updated 4.24.2018
    function fixOldGeologicUnitData() {
      // Fix changed choice value
      if (vm.data.metamorphic_grade === 'sillimanite-K_' || vm.data.metamorphic_grade === 'sillimanite-k_') {
        vm.data.metamorphic_grade = 'sillimanite-k';
      }

      // Map epoch field
      if (vm.data.epoch) {
        if (vm.data.epoch === 'holocene') vm.data.epoch_quaternary = ['holocene'];
        else if (vm.data.epoch === 'pleistocene') vm.data.epoch_quaternary = ['pleistocene'];
        else if (vm.data.epoch === 'pliocene') vm.data.epoch_teritary = ['pliocene'];
        else if (vm.data.epoch === 'miocene') vm.data.epoch_teritary = ['miocene'];
        else if (vm.data.epoch === 'oligocene') vm.data.epoch_teritary = ['oligocene'];
        else if (vm.data.epoch === 'eocene') vm.data.epoch_teritary = ['eocene'];
        else if (vm.data.epoch === 'paleocene') vm.data.epoch_teritary = ['paleocene'];
        else if (vm.data.epoch === 'other') delete vm.data.other_epoch;
        delete vm.data.epoch;
      }

      // Map period field
      if (vm.data.period) {
        if (vm.data.period === 'quaternary') vm.data.period_cenozoic = ['quaternary'];
        else if (vm.data.period === 'tertiary') vm.data.period_cenozoic = ['tertiary'];
        else if (vm.data.period === 'neogene') vm.data.period_cenozoic = ['neogene'];
        else if (vm.data.period === 'paleogene') vm.data.period_cenozoic = ['paleogene'];
        else if (vm.data.period === 'cretaceous') vm.data.period_mesozoic = ['cretaceous'];
        else if (vm.data.period === 'jurassic') vm.data.period_mesozoic = ['jurassic'];
        else if (vm.data.period === 'triassic') vm.data.period_mesozoic = ['triassic'];
        else if (vm.data.period === 'permian') vm.data.period_paleozoic = ['permian'];
        else if (vm.data.period === 'carboniferous') vm.data.period_paleozoic = ['carboniferous'];
        else if (vm.data.period === 'pennsylvanian') vm.data.period_paleozoic = ['pennsylvanian'];
        else if (vm.data.period === 'mississippian') vm.data.period_paleozoic = ['mississippian'];
        else if (vm.data.period === 'devonian') vm.data.period_paleozoic = ['devonian'];
        else if (vm.data.period === 'silurian') vm.data.period_paleozoic = ['silurian'];
        else if (vm.data.period === 'ordovician') vm.data.period_paleozoic = ['ordovician'];
        else if (vm.data.period === 'cambrian') vm.data.period_paleozoic = ['cambrian'];
        else if (vm.data.period === 'ediacaran') vm.data.period_neoproterozoic = ['ediacaran'];
        else if (vm.data.period === 'cryogenian') vm.data.period_neoproterozoic = ['cryogenian'];
        else if (vm.data.period === 'tonian') vm.data.period_neoproterozoic = ['tonian'];
        else if (vm.data.period === 'stenian') vm.data.period_mesoproterozoic = ['stenian'];
        else if (vm.data.period === 'ectasian') vm.data.period_mesoproterozoic = ['ectasian'];
        else if (vm.data.period === 'calymmian') vm.data.period_mesoproterozoic = ['calymmian'];
        else if (vm.data.period === 'statherian') vm.data.period_paleoproterozoic = ['statherian'];
        else if (vm.data.period === 'orosirian') vm.data.period_paleoproterozoic = ['orosirian'];
        else if (vm.data.period === 'rhyacian') vm.data.period_paleoproterozoic = ['rhyacian'];
        else if (vm.data.period === 'siderian') vm.data.period_paleoproterozoic = ['siderian'];
        delete vm.data.period;
      }

      // Map era field
      if (vm.data.era) {
        if (vm.data.era === 'cenozoic') vm.data.era_phanerozoic = ['cenozoic'];
        else if (vm.data.era === 'mesozoic') vm.data.era_phanerozoic = ['mesozoic'];
        else if (vm.data.era === 'paleozoic') vm.data.era_phanerozoic = ['paleozoic'];
        else if (vm.data.era === 'neoproterozoic') vm.data.era_proterozoic = ['neoproterozoic'];
        else if (vm.data.era === 'mesoproterozoi') vm.data.era_proterozoic = ['mesoproterozoi'];
        else if (vm.data.era === 'paleoproterozo') vm.data.era_proterozoic = ['paleoproterozo'];
        else if (vm.data.era === 'neoarchean') vm.data.era_archean = ['neoarchean'];
        else if (vm.data.era === 'mesoarchean') vm.data.era_archean = ['mesoarchean'];
        else if (vm.data.era === 'paleoarchean') vm.data.era_archean = ['paleoarchean'];
        else if (vm.data.era === 'eoarchean') vm.data.era_archean = ['eoarchean'];
        delete vm.data.era;
      }

      // Map eon field
      if (vm.data.eon && _.isString(vm.data.eon)) vm.data.eon = [vm.data.eon];

      // Add fields for epoch, period and era as required by new skip logic
      if (vm.data.epoch_quaternary || vm.data.epoch_teritary) {
        if (!vm.data.period_cenozoic) vm.data.period_cenozoic = [];
        if (vm.data.epoch_quaternary) vm.data.period_cenozoic = _.union(vm.data.period_cenozoic, ['quaternary']);
        if (vm.data.epoch_teritary) vm.data.period_cenozoic = _.union(vm.data.period_cenozoic, ['teritary']);
      }
      if (vm.data.period_cenozoic || vm.data.period_mesozoic || vm.data.period_paleozoic) {
        if (!vm.data.era_phanerozoic) vm.data.era_phanerozoic = [];
        if (vm.data.period_cenozoic) vm.data.era_phanerozoic = _.union(vm.data.era_phanerozoic, ['cenozoic']);
        if (vm.data.period_mesozoic) vm.data.era_phanerozoic = _.union(vm.data.era_phanerozoic, ['mesozoic']);
        if (vm.data.period_paleozoic) vm.data.era_phanerozoic = _.union(vm.data.era_phanerozoic, ['paleozoic']);
      }
      if (vm.data.period_neoproterozoic || vm.data.period_mesoproterozoic || vm.data.period_paleoproterozoic) {
        if (!vm.data.era_proterozoic) vm.data.era_proterozoic = [];
        if (vm.data.period_neoproterozoic) {
          vm.data.era_proterozoic = _.union(vm.data.era_proterozoic, ['neoproterozoic']);
        }
        if (vm.data.period_mesoproterozoic) {
          vm.data.era_proterozoic = _.union(vm.data.era_proterozoic, ['mesoproterozoi']);
        }
        if (vm.data.period_paleoproterozoic) {
          vm.data.era_proterozoic = _.union(vm.data.era_proterozoic, ['paleoproterozo']);
        }
      }
      if (vm.data.era_phanerozoic || vm.data.era_proterozoic || vm.data.era_archean) {
        if (!vm.data.eon) vm.data.eon = [];
        if (vm.data.era_phanerozoic) vm.data.eon = _.union(vm.data.eon, ['phanerozoic']);
        if (vm.data.era_proterozoic) vm.data.eon = _.union(vm.data.eon, ['proterozoic']);
        if (vm.data.era_archean) vm.data.eon = _.union(vm.data.eon, ['archean']);
      }

      // Map age modifier field
      if (vm.data.age_modifier && _.isString(vm.data.age_modifier)) vm.data.age_modifier = [vm.data.age_modifier];
    }

    function loadTag() {
      var id = $state.params.tag_id;
      vm.data = ProjectFactory.getTag(id);
      vm.data.id = id;  // Just in case vm.tag is undefined

      if (vm.data.color) vm.color = vm.data.color;

      if (vm.data.type === 'geologic_unit') FormFactory.setForm('rock_unit');

      fixOldData();

      $log.log('Loaded Tag:', vm.data);
    }

    function saveTag() {
      return ProjectFactory.saveTag(vm.data).then(function () {
        $log.log('Tag saved');
        vm.dataChanged = false;
        if (IS_WEB) {
          $log.log('Save tags to LiveDB.', ProjectFactory.getCurrentProject());
          LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
          vmParent.updateTags();
        }
      });
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

    function checkedFilterCondition(filter, condition) {
      if (_.contains(vm.filterConditions[filter], condition)) {
        vm.filterConditions[filter] = _.without(vm.filterConditions[filter], condition);
      }
      else {
        if (!vm.filterConditions[filter]) vm.filterConditions[filter] = [];
        vm.filterConditions[filter].push(condition);
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

    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
    }

    function getNumTaggedFeatures(tag) {
      return TagFactory.getNumTaggedFeatures(tag);
    }

    function getSpotName(spotId) {
      return SpotFactory.getNameFromId(spotId);
    }

    function getTagName(id) {
      var tag = ProjectFactory.getTag(id);
      return tag.name;
    }

    function go(path) {
      submitTag().then(function () {
        if (path) $location.path(path);
        else {
          if ($ionicHistory.backView()) $ionicHistory.goBack();
          else $location.path("app/tags");
      }
          });
        }

    function goBack(){
      $location.path("app/tags");
    }    

    function goToSpot(spotId) {
      SpotFactory.goToSpot(spotId);
    }

    function goToTag(id) {
      $location.path('/app/tags/' + id);
    }

    //Hides the mineral info and display the mineral list
    function hideMineralInfo() {
      vm.isShowMineralList = true;
    }

    function keyToId(key) {
      return parseInt(key);
    }

    function isFilterConditionChecked(filter, condition) {
      return _.contains(vm.filterConditions[filter], condition) || false;
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

    //displays the mineral info from info-button on the main Minerals Page
    function mineralInfoOnMainPage(name){
      vm.mineralInfo = MineralsFactory.getMineralInfo(name);
      vm.isShowMineralList = false;
      vm.isShowInfoOnly = true;
      vm.mineralsModal.show();
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

    //Displays the mineral chemical compound info for each mineral
    function showMineralInfo(name) {
      $ionicScrollDelegate.scrollTop();
      vm.isShowMineralList = false;
      vm.mineralInfo = MineralsFactory.getMineralInfo(name); 
    }

    function submitMineral() {
      vm.modalData = HelpersFactory.cleanObj(vm.modalData);
      $log.log(vm.modalData);
      if (FormFactory.validate(vm.modalData)) {
        if (!_.isEmpty(vm.modalData)) {
          if (!vm.data.minerals) vm.data.minerals = [];
          vm.data.minerals = JSON.parse(JSON.stringify(_.union(vm.modalData.all, vm.modalData.most_common)));
        }
        else delete vm.data.minerals;
        vm.modalData = {};
        vm.mineralsModal.hide();
        FormFactory.clearForm();
      }
    }

    function submitTag() {
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
          return saveTag();
        }
      }
      else {
        if (IS_WEB) {
          $ionicPopup.alert({
            'title': 'Incomplete Data!',
            'template': 'Please enter more fields to save this tag.'
          });
        }
        else return $q.when(null);
      }
    }

    function switchMineralsForm(formType) {
      var form;
      if (formType === 'all') {
        vm.modalData.all = vm.modalData.most_common;
        vm.activeState = "all";
        if (vm.modalTitle === 'Metamorphic Minerals') form = 'metamorphic';
        else if (vm.modalTitle === 'Igneous Minerals') form = 'igneous';
        else if (vm.modalTitle === 'Sedimentary Minerals') form = 'sedimentary';
      }

      else {
        vm.modalData.most_common = vm.modalData.all;
        vm.activeState = "most_common";
        if (vm.modalTitle === 'Metamorphic Minerals') form = 'metamorphic_most_common';
        else if (vm.modalTitle === 'Igneous Minerals') form = 'igneous_most_common';
        else if (vm.modalTitle === 'Sedimentary Minerals') form = 'sedimentary_most_common';
      }
      $log.log(vm.modalData);
      FormFactory.setForm('minerals', form);
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
