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
