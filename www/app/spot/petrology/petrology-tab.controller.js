(function () {
  'use strict';

  angular
    .module('app')
    .controller('PetrologyTabController', PetrologyTabController);

  PetrologyTabController.$inject = ['$ionicModal', '$ionicPopup', '$ionicScrollDelegate', '$log', '$scope', '$state',
    'DataModelsFactory', 'FormFactory', 'HelpersFactory', 'PetrologyFactory', 'SpotFactory'];

  function PetrologyTabController($ionicModal, $ionicPopup, $ionicScrollDelegate, $log, $scope, $state,
                                  DataModelsFactory, FormFactory, HelpersFactory, PetrologyFactory, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'petrology';

    var ternaryMinerals = {
      q: ['quartz'],                                                                              // Quartz
      a: ['k-feldspar', 'k_feldspar', 'microcline', 'orthoclase', 'sanidine'],       // Alkali feldspar, include albite?
      p: ['plagioclase', 'plagioclase feldspar'],                                                 // Plagioclase
      f: ['leucite', 'nepheline'],                                                                // Feldspathoids
      ol: ['olivine'],                                                                            // Olivine
      opx: ['orthopyroxene'],                                                                     // Orthopyroxene
      cpx: ['clinopyroxene', 'augite', 'diopside', 'cr_diopside', 'cr-diopside', 'cr diopside', 'spodumene', 'na pyroxene', 'na_pyroxene'], // Clinopyroxene
      pyx: ['na pyroxene', 'na_pyroxene', 'clinopyroxene', 'augite', 'diopside', 'cr_diopside', 'cr-diopside', 'cr diopside', 'spodumene', 'orthopyroxene'], // Pyroxene
      hbl: ['hornblende', 'magnesio-hornblende', 'mg_hornblende']                                 // Hornblende
    };

    vm.basicFormModal = {};
    vm.attributeType = 'rock';
    vm.glossary = PetrologyFactory.getMineralGlossary();
    vm.glossaryModal = {};
    vm.glossaryMineral = {};
    vm.isShowMineralGlossaryIndex = true;
    vm.spotWithPetToCopy = {};
    vm.spotsWithPet = [];
    vm.ternary = {};

    vm.addAttribute = addAttribute;
    vm.addThisMineral = addThisMineral;
    vm.copyPetData = copyPetData;
    vm.deleteAttribute = deleteAttribute;
    vm.editAttribute = editAttribute;
    vm.getLabel = getLabel;
    vm.getMineralName = getMineralName;
    vm.setGlossaryMineral = setGlossaryMineral;
    vm.shouldShowTernary = shouldShowTernary;
    vm.showMineralGlossary = showMineralGlossary;
    vm.submit = submit;
    vm.switchPetrologySubtab = switchPetrologySubtab;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In PetrologyTabController');

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
        if (vmParent.spot.properties.pet) {
          $log.log('Ig/Met Petrology:', vmParent.spot.properties.pet);
          vmParent.data = vmParent.spot.properties.pet;
        }
        else vmParent.data = {};

        FormFactory.setForm('pet', vm.attributeType);

        getPetSpotsForCopying();
        getDataFromRockUnitTags();
        createModal();
        gatherTernaryValues();
        createWatches();
      }
    }

    // Copy Rock and Minerals (if present) (not Reactions)
    function continueCopyPet() {
      vmParent.data = angular.copy(vm.spotWithPetToCopy.properties.pet);
      delete vmParent.data.reactions;
      _.each(vmParent.data.minerals, function (mineral, i) {
        if (mineral.modal) delete vmParent.data.minerals[i].modal;
      });
      vmParent.saveSpot().then(function () {
        vmParent.spotChanged = false;
        gatherTernaryValues();
      });
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

      $ionicModal.fromTemplateUrl('app/spot/petrology/minerals-glossary-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.glossaryModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.basicFormModal.remove();
        vm.glossaryModal.remove();
      });
    }

    function createWatches() {
      // Watch for mineral abbreviation changes
      $scope.$watch('vm.data.mineral_abbrev', function (newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          vmParent.data.full_mineral_name = PetrologyFactory.getFullMineralNameFromAbbrev(newValue);
        }
      });
    }

    function gatherTernaryValues() {
      if (vmParent.spot.properties.pet && vmParent.spot.properties.pet.minerals) {
        _.each(ternaryMinerals, function (mineralClass, key) {
          var foundMinerals = _.filter(vmParent.spot.properties.pet.minerals, function (mineral) {
            return (mineral.full_mineral_name && _.contains(mineralClass, mineral.full_mineral_name.toLowerCase()))
              || _.contains(mineralClass, mineral.volcanic_mineral)
              || _.contains(mineralClass, mineral.metamorphic_mineral)
              || _.contains(mineralClass, mineral.plutonic_mineral)
              || _.contains(mineralClass, mineral.mineral);
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

    // Get Data (Rock Class & Type) from Rock Unit Tags
    function getDataFromRockUnitTags() {
      var geologicUnitTags = _.filter(vmParent.spotLevelTagsToDisplay, function (tag) {
        return tag.type === 'geologic_unit';
      });

      // Copy rock type from geologic unit tags associated with this Spot
      // Only copy is there is no data already in Rock
      if (_.isEmpty(vmParent.data)) {
        _.each(geologicUnitTags, function (geologicUnitTag) {
          if (geologicUnitTag.volcanic_rock_type) {
            if (!vmParent.data.volcanic_rock_type) vmParent.data.volcanic_rock_type = [];
            vmParent.data.volcanic_rock_type = _.union(vmParent.data.volcanic_rock_type,
              [geologicUnitTag.volcanic_rock_type]);
            if (!vmParent.data.igneous_rock_class) vmParent.data.igneous_rock_class = [];
            vmParent.data.igneous_rock_class = _.union(vmParent.data.igneous_rock_class, ['volcanic']);
            if (!vmParent.data.rock_type) vmParent.data.rock_type = [];
            vmParent.data.rock_type = _.union(vmParent.data.rock_type, ['igneous']);
          }
          if (geologicUnitTag.plutonic_rock_types) {
            if (!vmParent.data.plutonic_rock_type) vmParent.data.plutonic_rock_type = [];
            vmParent.data.plutonic_rock_type = _.union(vmParent.data.plutonic_rock_type,
              [geologicUnitTag.plutonic_rock_types]);
            if (!vmParent.data.igneous_rock_class) vmParent.data.igneous_rock_class = [];
            vmParent.data.igneous_rock_class = _.union(vmParent.data.igneous_rock_class, ['plutonic']);
            if (!vmParent.data.rock_type) vmParent.data.rock_type = [];
            vmParent.data.rock_type = _.union(vmParent.data.rock_type, ['igneous']);
          }
          if (geologicUnitTag.metamorphic_rock_types) {
            if (!vmParent.data.metamorphic_rock_type) vmParent.data.metamorphic_rock_type = [];
            vmParent.data.metamorphic_rock_type = _.union(vmParent.data.metamorphic_rock_type,
              [geologicUnitTag.metamorphic_rock_types]);
            if (!vmParent.data.rock_type) vmParent.data.rock_type = [];
            vmParent.data.rock_type = _.union(vmParent.data.rock_type, ['metamorphic']);
          }
        });
      }
    }

    // Get the Spots that Pet Data can be Copied From
    function getPetSpotsForCopying() {
      vm.spotsWithPet = SpotFactory.getSpotsWithPetrology();
      // Remove this Spot
      vm.spotsWithPet = _.reject(vm.spotsWithPet, function (spot) {
        return spot.properties.id === vmParent.spot.properties.id;
      });
    }

    /**
     * Public Functions
     */

    // Add a mineral or a reaction
    function addAttribute() {
      vmParent.data = {};
      FormFactory.setForm('pet', vm.attributeType);
      vm.modalTitle = vm.attributeType === 'minerals' ? 'Add a Mineral' : 'Add a Reaction';
      vmParent.data.id = HelpersFactory.getNewId();
      vm.basicFormModal.show();
    }

    // Add a mineral from the glossary
    function addThisMineral() {
      vm.glossaryModal.hide();
      FormFactory.setForm('pet', 'minerals');
      vm.modalTitle = vm.attributeType === 'minerals' ? 'Add a Mineral' : 'Add a Reaction';
      vmParent.data = {};
      vmParent.data.id = HelpersFactory.getNewId();
      vmParent.data.full_mineral_name = vm.glossaryMineral.Label;
      vm.basicFormModal.show();
    }

    function copyPetData() {
      $log.log('Spot to copy from:', vm.spotWithPetToCopy);

      if (vm.spotWithPetToCopy) {
        if (!_.isEmpty(vmParent.data)) {
          var confirmPopup = $ionicPopup.confirm({
            'title': 'Existing Petrology Rock and Mineral Data',
            'template': 'Are you sure you want to overwrite the current Petrology Rock and Mineral data?'
          });
          confirmPopup.then(function (res) {
            if (res) continueCopyPet();
          });
        }
        else continueCopyPet();
      }
    }

    function deleteAttribute(attributeToDelete) {
      var confirmPopupText = vm.attributeType === 'minerals' ? {
        'title': 'Delete Mineral',
        'template': 'Are you sure you want to delete the Mineral <b>' + getMineralName(attributeToDelete) + '</b>?'
      } : {
        'title': 'Delete Reaction',
        'template': 'Are you sure you want to delete the Reaction <b>' + (attributeToDelete.reactions || 'Unknown') + '</b>?'
      };
      var confirmPopup = $ionicPopup.confirm(confirmPopupText);
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.pet[vm.attributeType] = _.reject(vmParent.spot.properties.pet[vm.attributeType],
            function (mineral) {
              return mineral.id === attributeToDelete.id;
            });
          if (vmParent.spot.properties.pet[vm.attributeType].length === 0) delete vmParent.spot.properties.pet[vm.attributeType];
          if (_.isEmpty(vmParent.spot.properties.pet)) delete vmParent.spot.properties.pet;
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
            gatherTernaryValues();
          });
        }
      });
    }

    function editAttribute(mineralToEdit) {
      vmParent.data = angular.fromJson(angular.toJson(mineralToEdit));  // Copy value, not reference
      FormFactory.setForm('pet', vm.attributeType);
      vm.modalTitle = vm.attributeType === 'minerals' ? 'Edit Mineral' : 'Edit Reaction';
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
      var mineralSelectFields = ['volcanic_mineral', 'metamorphic_mineral', 'plutonic_mineral',
        'alteration_ore_mineral', 'mineral'];
      _.each(mineralSelectFields, function (field) {
        if (mineral[field]) {
          var name = mineral[field];
          names.push(DataModelsFactory.getLabelFromNewDictionary(field, name) || name);
        }
      });
      if (_.isEmpty(names)) {
        var name = mineral.full_mineral_name || mineral.mineral_abbrev;
        names.push(name);
      }
      return names.join(', ') || 'Unknown';
    }

    function setGlossaryMineral(mineral) {
      $ionicScrollDelegate.scrollTop();
      vm.glossaryMineral = mineral;
      vm.isShowMineralGlossaryIndex = !vm.isShowMineralGlossaryIndex;
    }

    function shouldShowTernary() {
      return vmParent.spot && vmParent.spot.properties && vmParent.spot.properties.pet
        && (_.contains(vmParent.spot.properties.pet.igneous_rock_class, 'plutonic')
          || _.contains(vmParent.spot.properties.pet.igneous_rock_class, 'volcanic'));
    }

    function showMineralGlossary() {
      vm.glossaryMineral = {};
      vm.isShowMineralGlossaryIndex = true;
      vm.glossaryModal.show();
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.spot.properties.pet) vmParent.spot.properties.pet = {};
        if (!vmParent.spot.properties.pet[vm.attributeType]) vmParent.spot.properties.pet[vm.attributeType] = [];
        vmParent.spot.properties.pet[vm.attributeType] = _.reject(vmParent.spot.properties.pet[vm.attributeType],
          function (mineral) {
            return mineral.id === vmParent.data.id;
          });
        vmParent.spot.properties.pet[vm.attributeType].push(vmParent.data);
        vmParent.data = vmParent.spot.properties.pet;
        vmParent.saveSpot().then(function () {
          vmParent.spotChanged = false;
          vmParent.data = vmParent.spot.properties.pet;
          gatherTernaryValues();
        });
        vm.basicFormModal.hide();
        FormFactory.clearForm();
      }
    }

    function switchPetrologySubtab(form) {
      vmParent.saveSpot().then(function () {
        vmParent.spotChanged = false;
        if (vmParent.spot.properties.pet) vmParent.data = vmParent.spot.properties.pet;
        gatherTernaryValues();
        vm.attributeType = form;
        if (vm.attributeType === 'rock') FormFactory.setForm('pet', vm.attributeType);
        else FormFactory.clearForm();
      });
    }
  }
}());
