(function () {
  'use strict';

  angular
    .module('app')
    .controller('SamplesTabController', SamplesTabController);

  SamplesTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory',
    'FormFactory', 'HelpersFactory', 'ProjectFactory'];

  function SamplesTabController($ionicModal, $ionicPopup, $log, $scope, $state, DataModelsFactory, FormFactory,
                                HelpersFactory, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);     // Need to load current state into parent

    var isDelete;

    vm.addSample = addSample;
    vm.basicFormModal = {};
    vm.deleteSample = deleteSample;
    vm.editSample = editSample;
    vm.modalTitle = '';
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('Samples:', vmParent.spot.properties.samples);
      vmParent.survey = DataModelsFactory.getDataModel('sample').survey;
      vmParent.choices = DataModelsFactory.getDataModel('sample').choices;
      checkProperties();
      createModal();
    }

    function checkProperties() {
      _.each(vmParent.spot.properties.samples, function (sample) {
        if (!sample.label) sample.label = createDefaultLabel(sample);
        if (!sample.id) sample.id = HelpersFactory.getNewId();
      });
    }

    function createDefaultLabel(sampleToLabel) {
      return sampleToLabel.sample_id_name || 'sample';
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

    function handleSampleNumber() {
      var found = _.find(vmParent.spot.properties.samples, function (sample) {
        return sample.id === vmParent.data.id;
      });
      if (!found) ProjectFactory.incrementSampleNumber();
    }

    /**
     * Public Functions
     */

    function addSample() {
      vmParent.survey = DataModelsFactory.getDataModel('sample').survey;
      vmParent.choices = DataModelsFactory.getDataModel('sample').choices;
      vmParent.data = {};
      vmParent.data.id = HelpersFactory.getNewId();
      var number = ProjectFactory.getSampleNumber() || '';
      var prefix = ProjectFactory.getSamplePrefix() || '';
      if (number !== '' || prefix !== '') vmParent.data.sample_id_name = prefix + number.toString();
      vm.modalTitle = 'Add a Sample';
      vm.basicFormModal.show();
    }

    function deleteSample(sampleToDelete) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Sample',
        'template': 'Are you sure you want to delete the Sample <b>' + sampleToDelete.label + '</b>?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.samples = _.reject(vmParent.spot.properties.samples, function (sample) {
            return sample.id === sampleToDelete.id;
          });
          if (vmParent.spot.properties.samples.length === 0) delete vmParent.spot.properties.samples;
        }
        isDelete = false;
      });
    }

    function editSample(sampleToEdit) {
      if (!isDelete) {
        vmParent.data = angular.fromJson(angular.toJson(sampleToEdit));  // Copy value, not reference
        vmParent.survey = DataModelsFactory.getDataModel('sample').survey;
        vmParent.choices = DataModelsFactory.getDataModel('sample').choices;
        vm.modalTitle = 'Edit Sample';
        vm.basicFormModal.show();
      }
    }

    function submit() {
      if (_.size(vmParent.data) <= 1) {
        // If not more than id field no data has been entered so don't continue, just close modal
        vmParent.data = {};
        vm.basicFormModal.hide();
        vmParent.survey = undefined;
        vmParent.choices = undefined;
        return;
      }
      if (!vmParent.data.label) vmParent.data.label = createDefaultLabel(vmParent.data);
      if (FormFactory.validate(vmParent.survey, vmParent.data)) {
        if (!vmParent.spot.properties.samples) vmParent.spot.properties.samples = [];
        handleSampleNumber();
        vmParent.spot.properties.samples = _.reject(vmParent.spot.properties.samples, function (sample) {
          return sample.id === vmParent.data.id;
        });
        vmParent.spot.properties.samples.push(vmParent.data);
        vmParent.data = {};
        vm.basicFormModal.hide();
        vmParent.survey = undefined;
        vmParent.choices = undefined;
      }
    }
  }
}());
