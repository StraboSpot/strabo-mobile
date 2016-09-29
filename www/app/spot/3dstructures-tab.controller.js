(function () {
  'use strict';

  angular
    .module('app')
    .controller('_3DStructuresTabController', _3DStructuresTabController);

  _3DStructuresTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory',
    'FormFactory', 'HelpersFactory'];

  function _3DStructuresTabController($ionicModal, $ionicPopup, $log, $scope, $state, DataModelsFactory, FormFactory,
                                      HelpersFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);     // Need to load current state into parent

    var isDelete;

    vm.add3dStructure = add3dStructure;
    vm.basicFormModal = {};
    vm.delete3dStructure = delete3dStructure;
    vm.edit3dStructure = edit3dStructure;
    vm.modalTitle = '';
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('3D Structures:', vmParent.spot.properties._3d_structures);
      checkProperties();
      createModal();
    }

    function checkProperties() {
      _.each(vmParent.spot.properties._3d_structures, function (_3dStructure) {
        if (!_3dStructure.label) _3dStructure.label = createDefaultLabel(_3dStructure);
        if (!_3dStructure.id) _3dStructure.id = HelpersFactory.getNewId();
      });
    }

    function createDefaultLabel(_3dStructureToLabel) {
      return DataModelsFactory.getFeatureTypeLabel(_3dStructureToLabel.feature_type) || _3dStructureToLabel.type || '';
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

    function add3dStructure(type) {
      vmParent.survey = DataModelsFactory.getDataModel('_3d_structures')[type].survey;
      vmParent.choices = DataModelsFactory.getDataModel('_3d_structures')[type].choices;
      vmParent.data = {};
      vmParent.data.type = type;
      vmParent.data.id = HelpersFactory.getNewId();
      vm.modalTitle = 'Add ' + vmParent.data.type;
      vm.basicFormModal.show();
    }

    function delete3dStructure(_3dStructureToDelete) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete 3D Structure',
        'template': 'Are you sure you want to delete the 3D Structure <b>' + _3dStructureToDelete.label + '</b>?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties._3d_structures = _.reject(vmParent.spot.properties._3d_structures,
            function (_3dStructure) {
              return _3dStructureToDelete.id === _3dStructure.id;
            });
          if (vmParent.spot.properties._3d_structures === 0) delete vmParent.spot.properties._3d_structures;
        }
        isDelete = false;
      });
    }

    function edit3dStructure(_3dStructureToEdit) {
      if (!isDelete) {
        vmParent.data = angular.fromJson(angular.toJson(_3dStructureToEdit));  // Copy value, not reference
        vmParent.survey = DataModelsFactory.getDataModel('_3d_structures')[vmParent.data.type].survey;
        vmParent.choices = DataModelsFactory.getDataModel('_3d_structures')[vmParent.data.type].choices;
        vm.modalTitle = 'Edit ' + vmParent.data.type;
        vm.basicFormModal.show();
      }
    }

    function submit() {
      if (_.size(vmParent.data) <= 2) {
        // If not more than type and id fields no data has been entered so don't continue, just close modal
        vmParent.data = {};
        vm.basicFormModal.hide();
        vmParent.survey = undefined;
        vmParent.choices = undefined;
        return;
      }
      if (!vmParent.data.label) vmParent.data.label = createDefaultLabel(vmParent.data);
      if (FormFactory.validate(vmParent.survey, vmParent.data)) {
        if (!vmParent.spot.properties._3d_structures) vmParent.spot.properties._3d_structures = [];
        vmParent.spot.properties._3d_structures = _.reject(vmParent.spot.properties._3d_structures,
          function (_3dStructure) {
            return _3dStructure.id === vmParent.data.id;
          });
        vmParent.spot.properties._3d_structures.push(vmParent.data);
        vmParent.data = {};
        vm.basicFormModal.hide();
        vmParent.survey = undefined;
        vmParent.choices = undefined;
      }
    }
  }
}());
