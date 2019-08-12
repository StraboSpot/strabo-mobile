(function () {
  'use strict';

  angular
    .module('app')
    .controller('PetBasicsTabController', PetBasicsTabController);

  PetBasicsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory',
    'SpotFactory'];

  function PetBasicsTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'pet-basics';

    vm.petBasicsToCopy = {};
    vm.spotsWithPet = [];

    vm.copyPetBasics = copyPetBasics;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In PetBasicsTabController');

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
        FormFactory.setForm('pet', 'basics');
        if (vmParent.spot.properties.pet && vmParent.spot.properties.pet.basics) {
          $log.log('Pet Basics:', vmParent.spot.properties.pet.basics);
          vmParent.data = vmParent.spot.properties.pet.basics;
        }
        else vmParent.data = {};
      }

      getPetSpotsForCopying();
      getDataFromRockUnitTags();
    }

    // Get Data (Rock Class & Type) from Rock Unit Tags
    function getDataFromRockUnitTags() {
      var geologicUnitTags = _.filter(vmParent.spotLevelTagsToDisplay, function (tag) {
        return tag.type === 'geologic_unit';
      });
      $log.log(geologicUnitTags);

      // Copy rock type from geologic unit tags associated with this Spot and assing rock class
      // Only copy is there is no data already in Basics
      // if (_.isEmpty(vmParent.data)) {
      _.each(geologicUnitTags, function (geologicUnitTag) {
        if (geologicUnitTag.volcanic_rock_type) {
          if (!vmParent.data.rock_type_volcanic) vmParent.data.rock_type_volcanic = [];
          vmParent.data.rock_type_volcanic = _.union(vmParent.data.rock_type_volcanic,
            [geologicUnitTag.volcanic_rock_type]);
          if (!vmParent.data.more_options_volcanic_rks) vmParent.data.more_options_volcanic_rks = [];
          vmParent.data.more_options_volcanic_rks = _.union(vmParent.data.more_options_volcanic_rks,
            [geologicUnitTag.volcanic_rock_type]);
          if (!vmParent.data.rock_class) vmParent.data.rock_class = [];
          vmParent.data.rock_class = _.union(vmParent.data.rock_class, ['volcanic']);
        }
        if (geologicUnitTag.plutonic_rock_types) {
          if (!vmParent.data.rock_type_002) vmParent.data.rock_type_002 = [];
          vmParent.data.rock_type_002 = _.union(vmParent.data.rock_type_002, [geologicUnitTag.plutonic_rock_types]);
          if (!vmParent.data.more_options_plutonic_rk) vmParent.data.more_options_plutonic_rk = [];
          vmParent.data.more_options_plutonic_rk = _.union(vmParent.data.more_options_plutonic_rk,
            [geologicUnitTag.plutonic_rock_types]);
          if (!vmParent.data.rock_class) vmParent.data.rock_class = [];
          vmParent.data.rock_class = _.union(vmParent.data.rock_class, ['plutonic']);
        }
        if (geologicUnitTag.metamorphic_rock_types) {
          if (!vmParent.data.rock_type_metamorphic) vmParent.data.rock_type_metamorphic = [];
          vmParent.data.rock_type_metamorphic = _.union(vmParent.data.rock_type_metamorphic,
            [geologicUnitTag.metamorphic_rock_types]);
          if (!vmParent.data.more_options_met_rks) vmParent.data.more_options_met_rks = [];
          vmParent.data.more_options_met_rks = _.union(vmParent.data.more_options_met_rks,
            [geologicUnitTag.metamorphic_rock_types]);
          if (!vmParent.data.rock_class) vmParent.data.rock_class = [];
          vmParent.data.rock_class = _.union(vmParent.data.rock_class, ['metamorphic']);
        }
      });
      //  }
    }

    // Get the Spots that Pet Basics Data can be Copied From
    function getPetSpotsForCopying() {
      vm.spotsWithPet = SpotFactory.getSpotsWithPetBasics();
      // Remove this Spot
      vm.spotsWithPet = _.reject(vm.spotsWithPet, function (spot) {
        return spot.properties.id === vmParent.spot.properties.id;
      });
    }

    /**
     * Public Functions
     */

    function copyPetBasics() {
      $log.log('Spot to copy from:', vm.petBasicsToCopy);

      if (!_.isEmpty(vmParent.data)) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Existing Petrology Basics Data',
          'template': 'Are you sure you want to overwrite the current Petrology Basics data?'
        });
        confirmPopup.then(function (res) {
          if (res) vmParent.data = vm.petBasicsToCopy.properties.pet.basics;
        });
      }
      else vmParent.data = vm.petBasicsToCopy.properties.pet.basics;
    }
  }
}());
