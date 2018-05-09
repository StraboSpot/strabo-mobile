(function () {
  'use strict';

  angular
    .module('app')
    .controller('MineralsTabController', MineralsTabController);

  MineralsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state','DataModelsFactory', 'FormFactory',
    'HelpersFactory', 'ProjectFactory'];

  function MineralsTabController($ionicModal, $ionicPopup, $log, $scope, $state, DataModelsFactory, FormFactory, HelpersFactory, 
    ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'minerals';

    vm.addMineral = addMineral;
    vm.basicFormModal = {};
    vm.modalTitle = '';
    vm.submit = submit;
    vm.getLabel = getLabel;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In MineralsTabController');

      // Loading tab from Spots list
      if ($state.current.name === 'app.spotTab.' + thisTabName) loadTab($state);
      // Loading tab in Map side panel
      $scope.$on('load-tab', function (event, args) {
        if (args.tabName === thisTabName) {
          vmParent.saveSpot().finally(function () {
            vmParent.spotChanged = false;
            loadTab({
              'current': { 'name': 'app.spotTab.' + thisTabName },
              'params': { 'spotId': args.spotId }
            });
          });
        }
      });
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      $log.log('Minerals:', vmParent.spot.properties.minerals);
      createModal();
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
    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
    }

    function addMineral(type) {
      FormFactory.setForm('minerals', type);
      var form = FormFactory.getForm();
      var survey = form.survey;
      _.each(survey, function (field) {
        vmParent.data[field.name] = vmParent.spot.properties.minerals || [];
      });
      vm.modalTitle = type + ' Minerals';
      vm.basicFormModal.show();
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      $log.log(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.spot.properties.minerals) vmParent.spot.properties.minerals = [];
        vmParent.spot.properties.minerals = _.union(vmParent.data.all, vmParent.data.most_common);
        vmParent.data = {};
        vm.basicFormModal.hide();
        FormFactory.clearForm();
        vmParent.saveSpot();
      }
    }
  }
}());
