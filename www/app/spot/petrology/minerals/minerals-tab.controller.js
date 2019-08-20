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

    var ternaryMinerals = {
      q: ['quartz'],                                                               // Quartz
      a: ['k_feldspar', 'k_feldspar__or', 'microcline', 'orthoclase', 'sanidine'], // Alkali feldspar, include albite?
      p: ['plagioclase'],                                                          // Plagioclase
      f: ['leucite', 'nepheline'],                                                 // Feldspathoids
      ol: ['olivine'],                                                             // Olivine
      opx: ['orthopyroxene'],                                                      // Orthopyroxene
      cpx: ['clinopyroxene', 'augite', 'diopside', 'cr_diopside', 'spodumene'],    // Clinopyroxene
      pyx: ['na_pyroxene'],                                                        // Pyroxene
      hbl: ['hornblende', 'mag_hbnd']                                              // Hornblende
    };

    vm.basicFormModal = {};
    vm.attributeType = 'mineralogy';
    vm.ternary = {};

    vm.addAttribute = addAttribute;
    vm.deleteAttribute = deleteAttribute;
    vm.editAttribute = editAttribute;
    vm.getLabel = getLabel;
    vm.getMineralName = getMineralName;
    vm.shouldShowTernary = shouldShowTernary;
    vm.submit = submit;
    vm.switchMineralsSubtab = switchMineralsSubtab;

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
        gatherTernaryValues();
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

    function gatherTernaryValues() {
      if (vmParent.spot.properties.pet && vmParent.spot.properties.pet.minerals) {
        _.each(ternaryMinerals, function (mineralClass, key) {
          var foundMinerals = _.filter(vmParent.spot.properties.pet.minerals.mineralogy, function (mineral) {
            return _.contains(mineralClass, mineral.volcanic_mineral_list)
              || _.contains(mineralClass, mineral.metamorphic_mineral_list)
              || _.contains(mineralClass, mineral.plutonic_mineral_list)
              || _.contains(mineralClass, mineral.complete_minerals_list);
          });
          vm.ternary[key] = _.reduce(foundMinerals, function (memo, mineral) {
            return memo + mineral.modal || 0;
          }, 0);
        });
        vm.ternary.qap_sum = vm.ternary.q + vm.ternary.a + vm.ternary.p;
        vm.ternary.apf_sum = vm.ternary.f + vm.ternary.a + vm.ternary.p;
        vm.ternary.ooc_sum = vm.ternary.ol + vm.ternary.opx + vm.ternary.cpx;
        vm.ternary.ocp_sum = vm.ternary.ol + vm.ternary.cpx + vm.ternary.p;
        vm.ternary.oph_sum = vm.ternary.ol + vm.ternary.pyx + vm.ternary.hbl;
      }
    }

    /**
     * Public Functions
     */

    function addAttribute() {
      vmParent.data = {};
      FormFactory.setForm('pet', vm.attributeType);
      vm.modalTitle = vm.attributeType === 'mineralogy' ? 'Add a Mineral' : 'Add a Reaction';
      vmParent.data.id = HelpersFactory.getNewId();
      vm.basicFormModal.show();
    }

    function deleteAttribute(attributeToDelete) {
      var confirmPopupText = vm.attributeType === 'mineralogy' ? {
        'title': 'Delete Mineral',
        'template': 'Are you sure you want to delete the Mineral <b>' + getMineralName(attributeToDelete) + '</b>?'
      } : {
        'title': 'Delete Reaction',
        'template': 'Are you sure you want to delete the Reaction <b>' + (attributeToDelete.reactions || 'Unknown') + '</b>?'
      };
      var confirmPopup = $ionicPopup.confirm(confirmPopupText);
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.pet.minerals[vm.attributeType]
            = _.reject(vmParent.spot.properties.pet.minerals[vm.attributeType], function (mineral) {
            return mineral.id === attributeToDelete.id;
          });
          if (vmParent.spot.properties.pet.minerals[vm.attributeType].length === 0) delete vmParent.spot.properties.pet.minerals[vm.attributeType];
          if (_.isEmpty(vmParent.spot.properties.pet.minerals)) delete vmParent.spot.properties.pet.minerals;
          if (_.isEmpty(vmParent.spot.properties.pet)) delete vmParent.spot.properties.pet;
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
            vmParent.updateSpotsList();
            gatherTernaryValues();
          });
        }
      });
    }

    function editAttribute(mineralToEdit) {
      vmParent.data = angular.fromJson(angular.toJson(mineralToEdit));  // Copy value, not reference
      FormFactory.setForm('pet', vm.attributeType);
      vm.modalTitle = vm.attributeType === 'mineralogy' ? 'Edit Mineral' : 'Edit Reaction';
      vm.basicFormModal.show();
    }

    function getLabel(key, data) {
      if (_.isObject(data)) {
        var labelArray = [];
        _.each(data, function (d) {
          labelArray.push(DataModelsFactory.getLabelFromNewDictionary(key, d) || d);
        });
        return labelArray.join(', ');
      }
      return DataModelsFactory.getLabelFromNewDictionary(key, data) || data;
    }

    function getMineralName(mineral) {
      var names = [];
      var mineralSelectFields = ['volcanic_mineral_list', 'metamorphic_mineral_list', 'plutonic_mineral_list',
        'alteration_ore_minerals', 'complete_minerals_list'];
      _.each(mineralSelectFields, function (field) {
        if (mineral[field]) {
          var name = mineral[field];
          names.push(DataModelsFactory.getLabelFromNewDictionary(field, name) || name);
        }
      });
      if (_.isEmpty(names)) {
        var name = mineral.full_mineral_name || mineral.mineral_abbrev;
        var label = DataModelsFactory.getLabelFromNewDictionary('full_mineral_name', name)
          || DataModelsFactory.getLabelFromNewDictionary('mineral_abbrev', name);
        names.push(label || name);
      }
      return names.join(', ') || 'Unknown';
    }

    function shouldShowTernary() {
      return vmParent.spot.properties.pet && vmParent.spot.properties.pet.basics
        && (_.contains(vmParent.spot.properties.pet.basics.igneous_rock_class, 'plutonic')
          || _.contains(vmParent.spot.properties.pet.basics.igneous_rock_class, 'volcanic'));
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.spot.properties.pet) vmParent.spot.properties.pet = {};
        if (!vmParent.spot.properties.pet.minerals) vmParent.spot.properties.pet.minerals = {};
        if (!vmParent.spot.properties.pet.minerals[vm.attributeType]) vmParent.spot.properties.pet.minerals[vm.attributeType] = [];
        vmParent.spot.properties.pet.minerals[vm.attributeType] = _.reject(
          vmParent.spot.properties.pet.minerals[vm.attributeType],
          function (mineral) {
            return mineral.id === vmParent.data.id;
          });
        vmParent.spot.properties.pet.minerals[vm.attributeType].push(vmParent.data);
        vmParent.data = vmParent.spot.properties.pet.minerals;
        vmParent.saveSpot().then(function () {
          vmParent.spotChanged = false;
          vmParent.updateSpotsList();
          vmParent.data = vmParent.spot.properties.pet.minerals;
          gatherTernaryValues();
        });
        vm.basicFormModal.hide();
        FormFactory.clearForm();
      }
    }

    function switchMineralsSubtab(form) {
      vm.attributeType = form;
      FormFactory.clearForm();
    }
  }
}());
