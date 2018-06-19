(function () {
  'use strict';

  angular
    .module('app')
    .controller('MineralsTabController', MineralsTabController);

  MineralsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory', 'FormFactory',
    'HelpersFactory', 'ProjectFactory'];

  function MineralsTabController($ionicModal, $ionicPopup, $log, $scope, $state, DataModelsFactory, FormFactory, HelpersFactory,
    ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'minerals';
    var selectedFromList = [];
    
    vm.activeState = "most_common";
    vm.basicFormModal = {};
    vm.collectionsModal = {};
    vm.createCollectionSelectBoxDisplay = {};
    vm.igneousModal = {};
    vm.metamorphicModal = {};
    vm.mineralCollections = [];
    vm.modalTitle = '';
    vm.newCollectionName = undefined;
    vm.sedimentaryModal = {};
    vm.selectedCollectionToCreate = {};
    vm.showNameField = false;

    vm.addMineral = addMineral;
    vm.changedCollectionToCreate = changedCollectionToCreate;
    vm.getLabel = getLabel;
    vm.loadCollection = loadCollection;
    vm.saveCollection = saveCollection;
    vm.selectFromCollection = selectFromCollection;
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

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      $log.log('Minerals:', vmParent.spot.properties.minerals);
      vm.mineralCollections = ProjectFactory.getProjectProperty("mineral_collections");
      setupCreateCollectionSelectBox();
      createModal();
    }

    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/basic-form-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.basicFormModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/spot/minerals/added-collection-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.collectionsModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/spot/minerals/metamorphic-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.metamorphicModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/spot/minerals/igneous-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.igneousModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/spot/minerals/sedimentary-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.sedimentaryModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.basicFormModal.remove();
        vm.collectionsModal.remove();
        vm.metamorphicModal.remove();
        vm.igneousModal.remove();
        vm.sedimentaryModal.remove();
      });
    }

    //displays the select box for the favorites collections
    function setupCreateCollectionSelectBox() {
      vm.createCollectionSelectBoxDisplay = JSON.parse(JSON.stringify(vm.mineralCollections));
      vm.createCollectionSelectBoxDisplay.push({ 'name': '-- Create a New Collection --' });
      vm.selectedCollectionToCreate = vm.createCollectionSelectBoxDisplay[0];
      if (vm.mineralCollections.length === 0) vm.showNameField = true;
      else vm.showNameField = false;
      vm.newCollectionName = undefined;
    }

    /**
    * Public Functions
    */
    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
    }

    function addMineral(type) {
      FormFactory.setForm('minerals', type);
      var form = FormFactory.getForm();
      var survey = form.survey;
      // _.each(survey, function (field) {
      //   vmParent.data[field.name] = JSON.parse(JSON.stringify(vmParent.spot.properties.minerals)) || [];
      // });
      var combine = [];
      if (!_.isEmpty(vmParent.spot.properties.minerals)) {
        combine = JSON.parse(JSON.stringify(vmParent.spot.properties.minerals));
      }
      vmParent.data.most_common = combine;
      vmParent.data.all = combine;
      vm.activeState = "most_common";

      if (type === 'metamorphic_most_common') {
        vm.modalTitle = 'Metamorphic Minerals';
        vm.metamorphicModal.show();
      }
      else if (type === 'igneous_most_common') {
        vm.modalTitle = 'Igneous Minerals';
        vm.igneousModal.show();
      }
      else if (type === 'sedimentary_most_common') {
        vm.modalTitle = 'Sedimentary Minerals';
        vm.sedimentaryModal.show();
      }
    }

    function changedCollectionToCreate() {
      if (vm.selectedCollectionToCreate.name === '-- Create a New Collection --') {
        vm.showNameField = true;
      }
      else vm.showNameField = false;
    }

    function loadCollection() {
      selectedFromList = [];
      if (vmParent.spot.properties.minerals) selectedFromList = JSON.parse(JSON.stringify(vmParent.spot.properties.minerals));
      vm.modalTitle = 'Add Minerals From Collection';
      vm.collectionsModal.show();
    }

    function selectFromCollection() {
      vmParent.spot.properties.minerals = JSON.parse(JSON.stringify(selectedFromList)); 
      if (_.isEmpty(vmParent.spot.properties.minerals)) delete vmParent.spot.properties.minerals;
      vm.collectionsModal.hide();
    }
    // checkedMinerals is mineralsCollections.minerals in added-collection-modal.html
    function toggleCollectionChecked(checkedMinerals, e) {
      if (e.srcElement.checked) {
        selectedFromList = _.union(checkedMinerals, selectedFromList);
        console.log(selectedFromList);
      }
      else {
        selectedFromList = _.reject(selectedFromList, function (mineral) {
          return _.contains(checkedMinerals, mineral);
        });
      }
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
        setupCreateCollectionSelectBox();
      }
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      $log.log(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.spot.properties.minerals) vmParent.spot.properties.minerals = [];
        if (_.isEmpty(vmParent.data.all)) delete vmParent.spot.properties.minerals;
        else vmParent.spot.properties.minerals = JSON.parse(JSON.stringify(vmParent.data.all));
        vmParent.data = {};
        vm.metamorphicModal.hide();
        vm.igneousModal.hide();
        vm.sedimentaryModal.hide();
        FormFactory.clearForm();
        vmParent.saveSpot();
      }
    }

    function switchMineralsForm(form) {
      if (form === 'metamorphic' || form === 'igneous' || form === 'sedimentary') {
        vmParent.data.all = vmParent.data.most_common;
        vm.activeState = "all";
      }
      else {
        vmParent.data.most_common = vmParent.data.all;
        vm.activeState = "most_common";
      }
      console.log(vmParent.data);
      FormFactory.setForm('minerals', form);
    }
  }
}());
