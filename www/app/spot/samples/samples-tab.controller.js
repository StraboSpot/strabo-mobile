(function () {
  'use strict';

  angular
    .module('app')
    .controller('SamplesTabController', SamplesTabController);

  SamplesTabController.$inject = ['$ionicModal', '$ionicPopup', '$location', '$log', '$scope', '$state', 'FormFactory',
    'HelpersFactory', 'ProjectFactory', 'SpotFactory'];

  function SamplesTabController($ionicModal, $ionicPopup, $location, $log, $scope, $state, FormFactory, HelpersFactory,
                                ProjectFactory, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'samples';

    vm.basicFormModal = {};
    vm.modalTitle = '';
    vm.samples = [];
    vm.subsamples = [];

    vm.addSample = addSample;
    vm.addSubsample = addSubsample;
    vm.deleteSample = deleteSample;
    vm.editSample = editSample;
    vm.goToSubsampleSpot = goToSubsampleSpot;
    vm.submit = submit;
    vm.unlinkSubsampleSpot = unlinkSubsampleSpot;

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

    // Create a new Spot with the Subsample data
    function createNewSpotWithSubsample() {
      var newSpot = {'type': 'Feature'};
      if (vmParent.spot.geometry) newSpot.geometry = vmParent.spot.geometry;
      newSpot.properties = {
        'name': vmParent.data.label,
        'samples': [vmParent.data]
      };
      return SpotFactory.setNewSpot(newSpot);
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      FormFactory.setForm('sample');
      $log.log('Samples:', vmParent.spot.properties.samples);
      checkProperties();
      splitSamples();
      createModal();
    }

    function checkProperties() {
      _.each(vmParent.spot.properties.samples, function (sample) {
        if (!_.has(sample, 'spot_id')) {
          if (!sample.label) sample.label = createDefaultLabel(sample);
          if (!sample.id) sample.id = HelpersFactory.getNewId();
        }
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

    // Split the samples list into two lists based on whether the sample is an actual sample or just a link.
    // to a Subsample Spot. Subsample Spots have the field spot_id whereas actual samples do not.
    function splitSamples() {
      var samplesPartitioned = _.partition(vmParent.spot.properties.samples, function (sample) {
        return sample.spot_id;
      });
      vm.subsamples = samplesPartitioned[0];
      vm.samples = samplesPartitioned[1];

      _.each(vm.subsamples, function (subsample, i) {
        var linkedSpot = SpotFactory.getSpotById(subsample.spot_id);
        if (!_.isEmpty(linkedSpot)) vm.subsamples[i] = linkedSpot;
      });
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
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
            splitSamples();
          });
        }
      });
    }

    function addSubsample() {
      FormFactory.setForm('sample');
      vmParent.data = {};
      vmParent.data.id = HelpersFactory.getNewId();
      var number = ProjectFactory.getSampleNumber() || '';
      var prefix = ProjectFactory.getSamplePrefix() || '';
      if (number !== '' || prefix !== '') vmParent.data.sample_id_name = prefix + number.toString();
      vm.modalTitle = 'Add a Subsample Spot';
      vm.basicFormModal.show();
    }

    function editSample(sampleToEdit) {
      vmParent.data = angular.fromJson(angular.toJson(sampleToEdit));  // Copy value, not reference
      FormFactory.setForm('sample');
      vm.modalTitle = 'Edit Sample';
      vm.basicFormModal.show();
    }

    function goToSubsampleSpot(spot) {
      if (spot.properties && spot.properties.id) $location.path('/app/spotTab/' + spot.properties.id + '/spot');
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.data.label) vmParent.data.label = createDefaultLabel(vmParent.data);
        if (!vmParent.spot.properties.samples) vmParent.spot.properties.samples = [];
        handleSampleNumber();
        if (vm.modalTitle === 'Add a Subsample Spot') {
          createNewSpotWithSubsample().then(function (newSpotId) {
            vmParent.spot.properties.samples.push({'spot_id': newSpotId});
            vmParent.data = {};
            vmParent.saveSpot().then(function () {
              vmParent.spotChanged = false;
              vmParent.updateSpotsList();
              splitSamples();
            });
          });
        }
        else {
          vmParent.spot.properties.samples = _.reject(vmParent.spot.properties.samples, function (sample) {
            return sample.id === vmParent.data.id;
          });
          vmParent.spot.properties.samples.push(vmParent.data);
          vmParent.data = {};
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
            splitSamples();
          });
        }
        vm.basicFormModal.hide();
        FormFactory.clearForm();
      }
    }

    // Remove link between Subsample and Subsample Spot
    function unlinkSubsampleSpot(spot) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Unlink Subsample Spot',
        'template': 'Are you sure you want to unlink this Subsample Spot from this Spot?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.samples = _.reject(vmParent.spot.properties.samples, function (sample) {
            if (sample.spot_id && spot.properties && spot.properties.id) return sample.spot_id === spot.properties.id;
            else if (sample.spot_id) return sample.spot_id === spot.spot_id;
          });
          if (_.isEmpty(vmParent.spot.properties.samples)) delete vmParent.spot.properties.samples;
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
            splitSamples();
          });
        }
      });
    }
  }
}());
