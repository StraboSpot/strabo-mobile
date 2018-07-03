(function () {
  'use strict';

  angular
    .module('app')
    .controller('MineralsTabController', MineralsTabController);

  MineralsTabController.$inject = ['$ionicModal', '$ionicPopup', '$ionicScrollDelegate', '$log', '$scope', '$state', 'DataModelsFactory', 'FormFactory', 'HelpersFactory', 'MineralsFactory', 'ProjectFactory'];

  function MineralsTabController($ionicModal, $ionicPopup, $ionicScrollDelegate, $log, $scope, $state, DataModelsFactory, FormFactory, HelpersFactory, MineralsFactory, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'minerals';
    var selectedFromList = [];

    vm.activeState = "most_common";
    vm.collectionsModal = {};
    vm.createCollectionSelectBoxDisplay = {};
    vm.mineralCollections = [];
    vm.mineralInfo = [];
    vm.mineralInfoState = true;
    vm.mineralsModal = {};
    vm.modalTitle = '';
    vm.newCollectionName = undefined;
    vm.selectedCollectionToCreate = {};
    vm.showNameField = false;

    vm.addMineral = addMineral;
    vm.changedCollectionToCreate = changedCollectionToCreate;
    vm.getLabel = getLabel;
    vm.hideMineralInfo = hideMineralInfo;
    vm.loadCollection = loadCollection;
    vm.saveCollection = saveCollection;
    vm.selectFromCollection = selectFromCollection;
    vm.showMineralInfo = showMineralInfo;
    vm.submit = submit;
    vm.switchMineralsForm = switchMineralsForm;
    vm.toggleCollectionChecked = toggleCollectionChecked;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In MineralsTabController');

      // Loading tab from Spots list
      if ($state.current.name === 'app.spotTab.' + thisTabName) loadTab($state);
      // Loading tab in Map side panel
      $scope.$on('load-tab', function (event, args) {
        if (args.tabName === thisTabName) {
          vmParent.saveSpot().finally(function () {
            vmParent.spotChanged = false;
            loadTab({
              'current': { 'name': 'app.spotTab.' + thisTabName },
              'params': { 'spotId': args.spotId }
            });
          });
        }
      });
    }

    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/minerals/added-collection-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.collectionsModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/spot/minerals/minerals-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.mineralsModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.collectionsModal.remove();
        vm.mineralsModal.remove();
      });
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      $log.log('Minerals:', vmParent.spot.properties.minerals);
      vm.mineralCollections = ProjectFactory.getProjectProperty("mineral_collections");
      setupCreateCollectionSelectBox();
      createModal();
    }

    //displays the select box for the favorites collections
    function setupCreateCollectionSelectBox() {
      vm.createCollectionSelectBoxDisplay = JSON.parse(JSON.stringify(vm.mineralCollections));
      vm.createCollectionSelectBoxDisplay.push({ 'name': '-- Create a New Collection --' });
      vm.selectedCollectionToCreate =
        vm.createCollectionSelectBoxDisplay[vm.createCollectionSelectBoxDisplay.length - 1];
      if (vm.mineralCollections.length === 0 || vm.selectedCollectionToCreate.name === '-- Create a New Collection --') {
        vm.showNameField = true;
      }
      else vm.showNameField = false;
      vm.newCollectionName = undefined;
    }

    /**
    * Public Functions
    */

    function addMineral(type) {
      FormFactory.setForm('minerals', type);
      var combine = [];
      if (!_.isEmpty(vmParent.spot.properties.minerals)) {
        combine = JSON.parse(JSON.stringify(vmParent.spot.properties.minerals));
      }
      vmParent.data.most_common = combine;
      vmParent.data.all = combine;
      vm.activeState = "most_common";

      if (type === 'metamorphic_most_common') vm.modalTitle = 'Metamorphic Minerals';
      else if (type === 'igneous_most_common') vm.modalTitle = 'Igneous Minerals';
      else if (type === 'sedimentary_most_common') vm.modalTitle = 'Sedimentary Minerals';

      vm.mineralsModal.show();
    }

    function changedCollectionToCreate() {
      if (vm.selectedCollectionToCreate.name === '-- Create a New Collection --') vm.showNameField = true;
      else vm.showNameField = false;
    }

    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
    }

    //Hides the mineral info and display the mineral list
    function hideMineralInfo() {
      vm.mineralInfoState = true;
    }

    function loadCollection() {
      selectedFromList = [];
      if (vmParent.spot.properties.minerals) {
        selectedFromList = JSON.parse(JSON.stringify(vmParent.spot.properties.minerals));
      }
      vm.modalTitle = 'Add Minerals From Collection';
      vm.collectionsModal.show();
    }

    //saves the collection of mineral on minerals page
    function saveCollection() {
      if (_.isEmpty(vmParent.spot.properties.minerals)) {
        $ionicPopup.alert({
          'title': 'No Minerals Selected',
          'template': 'Select at least one mineral first'
        });
      }
      else if ((!vm.showNameField && _.isEmpty(vm.selectedCollectionToCreate.name)) ||
        (vm.showNameField && _.isEmpty(vm.newCollectionName))) {
        $ionicPopup.alert({
          'title': 'No Name Selected',
          'template': 'Enter name for collection'
        });
      }
      else {
        if (vm.showNameField) vm.selectedCollectionToCreate.name = vm.newCollectionName;
        else {
          vm.mineralCollections = _.reject(vm.mineralCollections, function (mineralCollection) {
            return mineralCollection.name === vm.selectedCollectionToCreate.name;
          });
        }
        vm.selectedCollectionToCreate.minerals = vmParent.spot.properties.minerals;
        vm.mineralCollections.splice(0, 0, vm.selectedCollectionToCreate);
        ProjectFactory.saveProjectItem('mineral_collections', vm.mineralCollections);

        //alerting that collection is saved
        var mineralLabels = [];
        _.each(vm.selectedCollectionToCreate.minerals, function (mineral) {
          mineralLabels.push(DataModelsFactory.getLabel(mineral));
        });
        $ionicPopup.alert({
          'title': 'Collection Saved',
          'template': 'Saved following minerals to favorites collection <b>' + vm.selectedCollectionToCreate.name + '</b>:<br><br>' + mineralLabels.join(", ")
        });

        setupCreateCollectionSelectBox();
      }
    }

    function selectFromCollection() {
      vmParent.spot.properties.minerals = JSON.parse(JSON.stringify(selectedFromList));
      if (_.isEmpty(vmParent.spot.properties.minerals)) delete vmParent.spot.properties.minerals;
      vm.collectionsModal.hide();
    }

    //Displays the mineral info for each mineral
    function showMineralInfo(name, e) {
      $ionicScrollDelegate.scrollTop();
      vm.mineralInfoState = false;
      vm.mineralInfo = MineralsFactory.getMineralInfo(name);
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      $log.log(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.spot.properties.minerals) vmParent.spot.properties.minerals = [];
        if (_.isEmpty(vmParent.data.all)) delete vmParent.spot.properties.minerals;
        else vmParent.spot.properties.minerals = JSON.parse(JSON.stringify(vmParent.data.all));
        vmParent.data = {};
        vm.mineralsModal.hide();
        FormFactory.clearForm();
        vmParent.saveSpot();
      }
    }

    function switchMineralsForm(formType) {
      var form;
      if (formType === 'all') {
        vmParent.data.all = vmParent.data.most_common;
        vm.activeState = "all";
        if (vm.modalTitle === 'Metamorphic Minerals') form = 'metamorphic';
        else if (vm.modalTitle === 'Igneous Minerals') form = 'igneous';
        else if (vm.modalTitle === 'Sedimentary Minerals') form = 'sedimentary';
      }

      else {
        vmParent.data.most_common = vmParent.data.all;
        vm.activeState = "most_common";
        if (vm.modalTitle === 'Metamorphic Minerals') form = 'metamorphic_most_common';
        else if (vm.modalTitle === 'Igneous Minerals') form = 'igneous_most_common';
        else if (vm.modalTitle === 'Sedimentary Minerals') form = 'sedimentary_most_common';
      }
      console.log(vmParent.data);
      FormFactory.setForm('minerals', form);
    }

    // checkedMinerals is mineralsCollections.minerals in added-collection-modal.html
    function toggleCollectionChecked(checkedMinerals, e) {
      if (e.target.checked) {
        selectedFromList = _.union(checkedMinerals, selectedFromList);
        console.log(selectedFromList);
      }
      else {
        selectedFromList = _.reject(selectedFromList, function (mineral) {
          return _.contains(checkedMinerals, mineral);
        });
      }
    }
  }
}());
