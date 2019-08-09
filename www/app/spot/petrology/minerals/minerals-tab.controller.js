(function () {
  'use strict';

  angular
    .module('app')
    .controller('PetMineralsTabController', PetMineralsTabController);

  PetMineralsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory'];

  function PetMineralsTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'pet-minerals';

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
        FormFactory.setForm('pet', 'minerology');
        if (vmParent.spot.properties.pet && vmParent.spot.properties.pet.minerals) {
          $log.log('Pet Minerals:', vmParent.spot.properties.pet.minerals);
          vmParent.data = vmParent.spot.properties.pet.minerals;
        }
        else vmParent.data = {};
      }
    }

    /**
     * Public Functions
     */

    function switchMineralsForm(form) {
      FormFactory.setForm('pet', form);
    }
  }
}());
