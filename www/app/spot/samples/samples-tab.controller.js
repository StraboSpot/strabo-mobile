(function () {
  'use strict';

  angular
    .module('app')
    .controller('SamplesTabController', SamplesTabController);

  SamplesTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'FormFactory',
    'HelpersFactory', 'ProjectFactory'];

  function SamplesTabController($ionicModal, $ionicPopup, $log, $scope, $state, FormFactory, HelpersFactory,
                                ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'samples';

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
      $log.log('In SamplesTabController');

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
      FormFactory.setForm('sample');
      $log.log('Samples:', vmParent.spot.properties.samples);
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
      FormFactory.setForm('sample');
      vmParent.data = {};
      vmParent.data.id = HelpersFactory.getNewId();
      var number = ProjectFactory.getSampleNumber() || '';
      var prefix = ProjectFactory.getSamplePrefix() || '';
      if (number !== '' || prefix !== '') vmParent.data.sample_id_name = prefix + number.toString();
      vm.modalTitle = 'Add a Sample';
      vm.basicFormModal.show();
    }

    function deleteSample(sampleToDelete) {
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
          vmParent.saveSpot();
        }
      });
    }

    function editSample(sampleToEdit) {
      vmParent.data = angular.fromJson(angular.toJson(sampleToEdit));  // Copy value, not reference
      FormFactory.setForm('sample');
      vm.modalTitle = 'Edit Sample';
      vm.basicFormModal.show();
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.data.label) vmParent.data.label = createDefaultLabel(vmParent.data);
        if (!vmParent.spot.properties.samples) vmParent.spot.properties.samples = [];
        handleSampleNumber();
        vmParent.spot.properties.samples = _.reject(vmParent.spot.properties.samples, function (sample) {
          return sample.id === vmParent.data.id;
        });
        vmParent.spot.properties.samples.push(vmParent.data);
        vmParent.data = {};
        vm.basicFormModal.hide();
        FormFactory.clearForm();
        vmParent.saveSpot();
      }
    }
  }
}());
