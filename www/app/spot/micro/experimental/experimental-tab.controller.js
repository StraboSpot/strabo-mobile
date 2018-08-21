(function () {
  'use strict';

  angular
    .module('app')
    .controller('ExperimentalTabController', ExperimentalTabController);

  ExperimentalTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory',
  'HelpersFactory'];

  function ExperimentalTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory, HelpersFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'experimental';

    vm.activeState = 'general';
    vm.experimentalModal = {};

    vm.addARig = addARig;
    vm.closeExperimentalModal = closeExperimentalModal;
    vm.deleteRig = deleteRig;
    vm.editRig = editRig;
    vm.submit = submit;
    vm.switchExpForm = switchExpForm;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In ExperimentalTabController');

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

    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/micro/experimental/experimental-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.experimentalModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.experimentalModal.remove();
      });
    }

    function loadTab(state) {
      createModal();
      vmParent.loadTab(state);     // Need to load current state into parent
      if (vmParent.spot.properties.micro && vmParent.spot.properties.micro.experimental) {
        $log.log('Experimental:', vmParent.spot.properties.micro.experimental);
      }
      else vmParent.data = {};
    }

    /**
     * Public Functions
     */

    function addARig(type) {
      vm.activeState = 'general';
      FormFactory.setForm('micro', 'experimental_general');
      vmParent.data = {};
      vmParent.data.type = type;
      vmParent.data.id = HelpersFactory.getNewId();
      vm.modalTitle = 'Add a ' + vmParent.data.type + ' Rig';
      vm.experimentalModal.show();
    }

    function closeExperimentalModal() {
      vmParent.data = {};
      FormFactory.clearForm();
      vm.experimentalModal.hide();
    }

    function deleteRig(rigToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Rig',
        'template': 'Are you sure you want to delete the rig <b>' + rigToDelete.name_of_experiment + '</b>?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.micro.experimental = _.reject(vmParent.spot.properties.micro.experimental,
            function (rig) {
              return rigToDelete.id === rig.id;
            });
          if (vmParent.spot.properties.micro.experimental.length === 0) {
            delete vmParent.spot.properties.micro.experimental;
          }
          if (_.isEmpty(vmParent.spot.properties.micro)) delete vmParent.spot.properties.micro;
          vmParent.data = {};
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
          });
        }
      });
    }

    function editRig(rigToEdit) {
      vmParent.data = angular.fromJson(angular.toJson(rigToEdit));  // Copy value, not reference
      if (vmParent.data.date_of_experiment) {
        vmParent.data.date_of_experiment = new Date(vmParent.data.date_of_experiment);
      }
      FormFactory.setForm('micro', 'experimental_general');
      vm.modalTitle = 'Edit ' + vmParent.data.type + ' Rig';
      vm.experimentalModal.show();
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.spot.properties.micro) vmParent.spot.properties.micro = {};
        if (!vmParent.spot.properties.micro.experimental) vmParent.spot.properties.micro.experimental = [];
        vmParent.spot.properties.micro.experimental = _.reject(vmParent.spot.properties.micro.experimental,
          function (rig) {
            return rig.id === vmParent.data.id;
          });
        vmParent.spot.properties.micro.experimental.push(vmParent.data);
        vmParent.data = {};
        vm.experimentalModal.hide();
        FormFactory.clearForm();
        vmParent.saveSpot().then(function () {
          vmParent.spotChanged = false;
        });
      }
    }

    function switchExpForm(formType) {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        vm.activeState = formType;
        if (formType === 'general' || formType === 'assembly') {
          FormFactory.setForm('micro', 'experimental_' + formType);
        }
        else if (formType === 'conditions' || formType === 'results') {
          FormFactory.setForm('micro', 'experimental_' + vmParent.data.type + '_' + formType);
        }
      }
    }
  }
}());
