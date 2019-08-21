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
      q: ['quartz'],                                                                              // Quartz
      a: ['k-feldspar', 'k_feldspar', 'k_feldspar__or', 'microcline', 'orthoclase', 'sanidine'],  // Alkali feldspar, include albite?
      p: ['plagioclase'],                                                                         // Plagioclase
      f: ['leucite', 'nepheline'],                                                                // Feldspathoids
      ol: ['olivine'],                                                                            // Olivine
      opx: ['orthopyroxene'],                                                                     // Orthopyroxene
      cpx: ['clinopyroxene', 'augite', 'diopside', 'cr_diopside', 'spodumene'],                   // Clinopyroxene
      pyx: ['na pyroxene', 'na_pyroxene'],                                                        // Pyroxene
      hbl: ['hornblende', 'magnesio-hornblende', 'mg_hornblende']                                 // Hornblende
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
        createWatches();
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

    function createWatches() {
      // Watch for mineral abbreviation changes
      $scope.$watch('vm.data.mineral_abbrev', function (newValue, oldValue) {
        if (newValue && newValue !== oldValue) vmParent.data.full_mineral_name = getFullMineralNameFromAbbrev(newValue);
      });
    }

    function gatherTernaryValues() {
      if (vmParent.spot.properties.pet && vmParent.spot.properties.pet.minerals) {
        _.each(ternaryMinerals, function (mineralClass, key) {
          var foundMinerals = _.filter(vmParent.spot.properties.pet.minerals.mineralogy, function (mineral) {
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

    function getFullMineralNameFromAbbrev(abbrev) {
      var abbreviations = {
        acm: 'acmite',
        act: 'actinolite',
        ab: 'albite',
        aln: 'allanite',
        amp: 'amphibole',
        am: 'amphibole',
        amph: 'amphibole',
        and: 'andalusite',
        anh: 'anhydrite',
        atg: 'antigorite',
        ap: 'apatite',
        aug: 'augite',
        brl: 'beryl',
        bt: 'biotite',
        bio: 'biotite',
        cal: 'calcite',
        ccp: 'chalcopyrite',
        chl: 'chlorite',
        cld: 'chloritoid',
        chr: 'chromite',
        ctl: 'chrysotile',
        cl: 'clay',
        cpx: 'clinopyroxene',
        crd: 'cordierite',
        crn: 'corundum',
        crdi: 'cr-diopside',
        dia: 'diamond',
        di: 'diopside',
        dol: 'dolomite',
        ep: 'epidote',
        feo: 'fe oxide',
        gn: 'galena',
        grt: 'garnet',
        gth: 'goethite',
        gt: 'goethite',
        gr: 'graphite',
        grs: 'grossular garnet ',
        hbl: 'hornblende',
        hyp: 'hypersthene',
        ilm: 'ilmenite',
        krs: 'kaersutite',
        kfs: 'k-feldspar',
        kspar: 'k-feldspar',
        kfsp: 'k-feldspar',
        ky: 'kyanite',
        lpd: 'lepidolite',
        lct: 'leucite',
        lm: 'limonite',
        lz: 'lizardite',
        mhb: 'magnesio-hornblende',
        mghbl: 'magnesio-hornblende',
        mag: 'magnetite',
        mll: 'melilite',
        mel: 'melilite',
        mc: 'microcline',
        mnz: 'monazite',
        ms: 'muscovite',
        npx: 'na pyroxene',
        npyx: 'na pyroxene',
        nph: 'nepheline',
        ne: 'nepheline',
        ol: 'olivine',
        or: 'orthoclase',
        opx: 'orthopyroxene',
        prv: 'perovskite',
        pl: 'plagioclase',
        plag: 'plagioclase',
        py: 'pyrite',
        po: 'pyrrhotite',
        qz: 'quartz',
        rt: 'rutile',
        sa: 'sanidine',
        srp: 'serpentine',
        sil: 'sillimanite',
        sp: 'sphalerite',
        spl: 'spinel',
        spd: 'spodumene',
        st: 'staurolite',
        tlc: 'talc',
        ttn: 'titanite',
        tpz: 'topaz',
        toz: 'topaz',
        tur: 'tourmaline',
        tr: 'tremolite',
        ves: 'vesuvianite',
        wo: 'wollastonite',
        xtm: 'xenotime',
        zeo: 'zeolite',
        zrn: 'zircon'
      };
      return abbreviations[abbrev.toLowerCase()];
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
      var mineralSelectFields = ['volcanic_mineral', 'metamorphic_mineral', 'plutonic_mineral',
        'alteration_ore_minerals', 'mineral'];
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
