(function () {
  'use strict';

  angular
    .module('app')
    .controller('FabricsTabController', FabricsTabController);

  FabricsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory',
    'FormFactory', 'HelpersFactory'];

  function FabricsTabController($ionicModal, $ionicPopup, $log, $scope, $state, DataModelsFactory, FormFactory,
                                      HelpersFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'fabrics';

    vm.addFabric = addFabric;
    vm.basicFormModal = {};
    vm.deleteFabric = deleteFabric;
    vm.editFabric = editFabric;
    vm.modalTitle = '';
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In FabricsTabController');

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
        $log.log('Fabrics:', vmParent.spot.properties.fabrics);
        checkProperties();
        createModal();
      }
    }

    function checkProperties() {
      _.each(vmParent.spot.properties.fabrics, function (fabric) {
        if (!fabric.label) fabric.label = createDefaultLabel(fabric);
        if (!fabric.id) fabric.id = HelpersFactory.getNewId();
      });
    }

    function createDefaultLabel(fabricToLabel) {
      var label = fabricToLabel.type.split('_')[0] + ' rock fabric';
      return label || '';
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

    function addFabric(type) {
      FormFactory.setForm('fabrics', type);
      vmParent.data = {};
      vmParent.data.type = type;
      vmParent.data.id = HelpersFactory.getNewId();
      vm.modalTitle = 'Add ' + vmParent.data.type.split('_')[0] + ' rock fabric';
      vm.basicFormModal.show();
    }

    function deleteFabric(fabricToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Fabric',
        'template': 'Are you sure you want to delete the Fabric <b>' + fabricToDelete.label + '</b>?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.fabrics = _.reject(vmParent.spot.properties.fabrics,
            function (fabric) {
              return fabricToDelete.id === fabric.id;
            });
          if (vmParent.spot.properties.fabrics.length === 0) delete vmParent.spot.properties.fabrics;
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
          });
        }
      });
    }

    function editFabric(fabricToEdit) {
      vmParent.data = angular.fromJson(angular.toJson(fabricToEdit));  // Copy value, not reference
      FormFactory.setForm('fabrics', vmParent.data.type);
      vm.modalTitle = 'Edit ' + vmParent.data.type;
      vm.basicFormModal.show();
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.data.label) vmParent.data.label = createDefaultLabel(vmParent.data);
        if (!vmParent.spot.properties.fabrics) vmParent.spot.properties.fabrics = [];
        vmParent.spot.properties.fabrics = _.reject(vmParent.spot.properties.fabrics,
          function (fabric) {
            return fabric.id === vmParent.data.id;
          });
        vmParent.spot.properties.fabrics.push(vmParent.data);
        vmParent.data = {};
        vm.basicFormModal.hide();
        FormFactory.clearForm();
        vmParent.saveSpot().then(function () {
          vmParent.spotChanged = false;
        });
      }
    }
  }
}());
