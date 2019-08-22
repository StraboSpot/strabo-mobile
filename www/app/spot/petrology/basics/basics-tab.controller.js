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

    vm.spotWithPetToCopy = {};
    vm.spotsWithPet = [];

    vm.copyPetData = copyPetData;

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

    // Copy Basics and Mineralogy (if present)
    function continueCopyPet() {
      vmParent.data = vm.spotWithPetToCopy.properties.pet.basics;
      if (!vmParent.spot.properties.pet) vmParent.spot.properties.pet = {};
      vmParent.spot.properties.pet.basics = vm.spotWithPetToCopy.properties.pet.basics;
      if (!_.isEmpty(vm.spotWithPetToCopy.properties.pet.minerals.mineralogy)) {
        if (!vmParent.spot.properties.pet.minerals) vmParent.spot.properties.pet.minerals = {};
        vmParent.spot.properties.pet.minerals.mineralogy = vm.spotWithPetToCopy.properties.pet.minerals.mineralogy;
        _.each(vmParent.spot.properties.pet.minerals.mineralogy, function (mineral, i) {
          if (mineral.modal) delete vmParent.spot.properties.pet.minerals.mineralogy[i].modal;
        });
      }
      SpotFactory.save(vmParent.spot);
    }
    
    // Get Data (Rock Class & Type) from Rock Unit Tags
    function getDataFromRockUnitTags() {
      var geologicUnitTags = _.filter(vmParent.spotLevelTagsToDisplay, function (tag) {
        return tag.type === 'geologic_unit';
      });

      // Copy rock type from geologic unit tags associated with this Spot
      // Only copy is there is no data already in Basics
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

    function copyPetData() {
      $log.log('Spot to copy from:', vm.spotWithPetToCopy);

      if (!_.isEmpty(vmParent.data)) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Existing Petrology Basics Data',
          'template': 'Are you sure you want to overwrite the current Petrology Basics and Mineralogy data?'
        });
        confirmPopup.then(function (res) {
          if (res) continueCopyPet();
        });
      }
      else continueCopyPet()
    }
  }
}());
