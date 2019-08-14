(function () {
  'use strict';

  angular
    .module('app')
    .controller('PetMineralsTabController', PetMineralsTabController);

  PetMineralsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory',
    'FormFactory', 'HelpersFactory'];

  function PetMineralsTabController($ionicModal, $ionicPopup, $log, $scope, $state, DataModelsFactory, FormFactory,
                                    HelpersFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'pet-minerals';

    vm.basicFormModal = {};
    vm.subformName = 'mineralogy';

    vm.addMineral = addMineral;
    vm.deleteMineral = deleteMineral;
    vm.editMineral = editMineral;
    vm.getLabel = getLabel;
    vm.getMineralName = getMineralName;
    vm.submit = submit;
    vm.switchMineralsForm = switchMineralsForm;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In PetMineralsTabController');

      // Loading tab from Spots list
      if ($state.current.name === 'app.spotTab.' + thisTabName) loadTab($state);
      // Loading tab in Map side panel
      $scope.$on('load-tab', function (event, args) {
        if (args.tabName === thisTabName) {
          vmParent.saveSpot().finally(function () {
            vmParent.spotChanged = false;
            loadTab({
              'current': {'name': 'app.spotTab.' + thisTabName},
              'params': {'spotId': args.spotId}
            });
          });
        }
      });
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      if (vmParent.spot && !_.isEmpty(vmParent.spot)) {
        if (vmParent.spot.properties.pet && vmParent.spot.properties.pet.minerals) {
          $log.log('Pet Minerals:', vmParent.spot.properties.pet.minerals);
          vmParent.data = vmParent.spot.properties.pet.minerals;
        }
        else vmParent.data = {};
        createModal();
      }
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

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.basicFormModal.remove();
      });
    }

    /**
     * Public Functions
     */

    function addMineral() {
      vmParent.data = {};
      FormFactory.setForm('pet', vm.subformName);
      vm.modalTitle = 'Add a Mineral';
      vmParent.data.id = HelpersFactory.getNewId();
      vm.basicFormModal.show();
    }

    function deleteMineral(mineralToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Mineral',
        'template': 'Are you sure you want to delete the Mineral <b>' + getMineralName(mineralToDelete) + '</b>?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.pet.minerals.mineralogies = _.reject(vmParent.spot.properties.pet.minerals.mineralogies,
            function (mineral) {
              return mineral.id === mineralToDelete.id;
            });
          if (vmParent.spot.properties.pet.minerals.mineralogies.length === 0) delete vmParent.spot.properties.pet.minerals.mineralogies;
          if (_.isEmpty(vmParent.spot.properties.pet.minerals)) delete vmParent.spot.properties.pet.minerals;
          if (_.isEmpty(vmParent.spot.properties.pet)) delete vmParent.spot.properties.pet;
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
            vmParent.updateSpotsList();
          });
        }
      });
    }

    function editMineral(mineralToEdit) {
      vmParent.data = angular.fromJson(angular.toJson(mineralToEdit));  // Copy value, not reference
      FormFactory.setForm('pet', vm.subformName);
      vm.modalTitle = 'Edit Mineral';
      vm.basicFormModal.show();
    }

    function getLabel(value) {
      if (_.isObject(value)) {
        var labelArray = [];
        _.each(value, function (val) {
          labelArray.push(DataModelsFactory.getLabelFromNewDictionary(val) || val);
        });
        return labelArray.join(', ');
      }
      return DataModelsFactory.getLabelFromNewDictionary(value) || value;
    }

    function getMineralName(mineral) {
      var names = [];
      var mineralSelectFields = ['volcanic_mineral_list', 'metamorphic_mineral_list', 'plutonic_mineral_list',
        'alteration_ore_minerals', 'complete_minerals_list'];
      _.each(mineralSelectFields, function (field) {
        if (mineral[field]) {
          var name = mineral[field];
          names.push(DataModelsFactory.getLabelFromNewDictionary(name) || name);
        }
      });
      if (_.isEmpty(names)) {
        var name = mineral.enter_abbreviation_or_full_min || mineral.Enter_Abbv;
        names.push(DataModelsFactory.getLabelFromNewDictionary(name) || name);
      }
      return names.join(', ') || 'Unknown';
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.spot.properties.pet) vmParent.spot.properties.pet = {};
        if (!vmParent.spot.properties.pet.minerals) vmParent.spot.properties.pet.minerals = {};
        if (!vmParent.spot.properties.pet.minerals.mineralogies) vmParent.spot.properties.pet.minerals.mineralogies = [];
        vmParent.spot.properties.pet.minerals.mineralogies = _.reject(vmParent.spot.properties.pet.minerals.mineralogies,
          function (mineral) {
            return mineral.id === vmParent.data.id;
          });
        vmParent.spot.properties.pet.minerals.mineralogies.push(vmParent.data);
        vmParent.data = {};
        vmParent.saveSpot().then(function () {
          vmParent.spotChanged = false;
          vmParent.updateSpotsList();
        });
        vm.basicFormModal.hide();
        FormFactory.clearForm();
      }
    }

    function switchMineralsForm(form) {
      vm.subformName = form;
      FormFactory.setForm('pet', form);
    }
  }
}());
