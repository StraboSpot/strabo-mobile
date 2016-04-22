(function () {
  'use strict';

  angular
    .module('app')
    .controller('SamplesTabController', SamplesTabController);

  SamplesTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory',
    'FormFactory', 'ProjectFactory'];

  function SamplesTabController($ionicModal, $ionicPopup, $log, $scope, $state, DataModelsFactory, FormFactory,
                                ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = DataModelsFactory.getDataModel('sample').survey;
    vmParent.choices = DataModelsFactory.getDataModel('sample').choices;
    vmParent.loadTab($state);     // Need to load current state into parent

    var sampleToEdit;
    var delSample;

    vm.addSample = addSample;
    vm.closeModal = closeModal;
    vm.deleteSample = deleteSample;
    vm.editSample = editSample;
    vm.sampleModal = {};
    vm.submitSample = submitSample;
    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SampleTabController');

      createModal();
    }

    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/sample-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true
      }).then(function (modal) {
        vm.sampleModal = modal;
      });
    }

    /**
     * Public Functions
     */

    function addSample() {
      sampleToEdit = undefined;
      vmParent.data = {};
      var number = ProjectFactory.getSampleNumber() || '';
      var prefix = ProjectFactory.getSamplePrefix() || '';
      if (number != '' || prefix !== '') vmParent.data.sample_id_name = prefix + number.toString();
      vm.sampleModal.show();
    }

    function closeModal(modal) {
      vm[modal].hide();
    }

    function deleteSample(i) {
      delSample = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Sample',
        'template': 'Are you sure you want to delete this sample?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.samples.splice(i, 1);
          if (vmParent.spot.properties.samples.length === 0) {
            delete vmParent.spot.properties.samples;
          }
        }
        delSample = false;
      });
    }

    function editSample(i) {
      if (!delSample) {
        vmParent.data = angular.fromJson(angular.toJson(vmParent.spot.properties.samples[i]));  // Copy value, not reference
        sampleToEdit = i;
        vm.sampleModal.show();
      }
    }

    function submitSample() {
      var valid = FormFactory.validate(vmParent.survey, vmParent.data);
      if (valid) {
        if (!vmParent.spot.properties.samples) vmParent.spot.properties.samples = [];
        var dup = _.find(vmParent.spot.properties.samples, function (sample) {
          return sample.sample_id_name === vmParent.data.sample_id_name;
        });
        if (_.indexOf(vmParent.spot.properties.samples, dup) === sampleToEdit) dup = undefined;
        if (!dup) {
          // Editing Sample
          if (angular.isDefined(sampleToEdit)) vmParent.spot.properties.samples.splice(sampleToEdit, 1,
            vmParent.data);
          // New Sample
          else {
            vmParent.spot.properties.samples.push(vmParent.data);
            ProjectFactory.incrementSampleNumber();
          }
          vm.sampleModal.hide();
          vmParent.data = {};
        }
        else {
          $ionicPopup.alert({
            'title': 'Duplicate Sample Id/Name',
            'template': 'Please use a unique Sample Id/Name.'
          });
        }
      }
    }
  }
}());
