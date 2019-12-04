(function () {
  'use strict';

  angular
    .module('app')
    .controller('SedInterpretationsTabController', SedInterpretationsTabController);

  SedInterpretationsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory'];

  function SedInterpretationsTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'sed-interpretations';

    vm.interpretationsForm = 'interpretations_facies_and_process';

    vm.switchForm = switchForm;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SedInterpretationsTabController');

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
        FormFactory.setForm('sed', 'interpretations_facies_and_process');
        if (vmParent.spot.properties.sed && vmParent.spot.properties.sed.interpretations) {
          $log.log('Sed Interpretations:', vmParent.spot.properties.sed.interpretations);
          vmParent.data = vmParent.spot.properties.sed.interpretations;
        }
        else vmParent.data = {};
      }
    }

    /**
     * Public Functions
     */

    function switchForm(form) {
      vm.interpretationsForm = form;
      FormFactory.setForm('sed', form);
    }
  }
}());
