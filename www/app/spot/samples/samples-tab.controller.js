(function () {
  'use strict';

  angular
    .module('app')
    .controller('SamplesTabController', SamplesTabController);

  SamplesTabController.$inject = ['$ionicModal', '$ionicPopup', '$location', '$log', '$scope', '$state', 'FormFactory',
    'HelpersFactory', 'ProjectFactory', 'SpotFactory', 'SpotsFactory', 'IS_WEB'];

  function SamplesTabController($ionicModal, $ionicPopup, $location, $log, $scope, $state, FormFactory, HelpersFactory,
                                ProjectFactory, SpotFactory, SpotsFactory, IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'samples';

    vm.basicFormModal = {};
    vm.isFilterOn = false;
    vm.modalTitle = '';
    vm.samples = [];
    vm.selectSpotModal = {};
    vm.spots = {};
    vm.spotsDisplayed = [];
    vm.subsamples = [];

    vm.addSample = addSample;
    vm.addExistingSubsample = addExistingSubsample;
    vm.addSubsample = addSubsample;
    vm.deleteSample = deleteSample;
    vm.editSample = editSample;
    vm.getIsWeb = getIsWeb;
    vm.goToSubsampleSpot = goToSubsampleSpot;
    vm.isOptionChecked = isOptionChecked;
    vm.loadMoreSpots = loadMoreSpots;
    vm.moreSpotsCanBeLoaded = moreSpotsCanBeLoaded;
    vm.submit = submit;
    vm.toggleChecked = toggleChecked;
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
      if (vmParent.spot.properties.image_basemap) {
        newSpot.properties.image_basemap = vmParent.spot.properties.image_basemap;
      }
      if (vmParent.spot.properties.strat_section_id) {
        newSpot.properties.strat_section_id = vmParent.spot.properties.strat_section_id;
      }
      return SpotFactory.setNewSpot(newSpot);
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      FormFactory.setForm('sample');
      $log.log('Samples:', vmParent.spot.properties.samples);
      checkProperties();
      splitSamples();
      setDisplayedSpots();
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

      $ionicModal.fromTemplateUrl('app/shared/select-spot-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.selectSpotModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.basicFormModal.remove();
        vm.selectSpotModal.remove();
      });
    }

    function handleSampleNumber() {
      var found = _.find(vmParent.spot.properties.samples, function (sample) {
        return sample.id === vmParent.data.id;
      });
      if (!found) ProjectFactory.incrementSampleNumber();
    }

    function setDisplayedSpots() {
      if (_.isEmpty(SpotsFactory.getFilterConditions())) {
        vm.spots = _.values(SpotsFactory.getActiveSpots());
        vm.isFilterOn = false;
      }
      else {
        vm.spots = _.values(SpotsFactory.getFilteredSpots());
        vm.isFilterOn = true;
      }
      vm.spots = _.reject(vm.spots, function (spot) {
        return spot.properties.id === vmParent.spot.properties.id;
      });
      vm.spots = SpotsFactory.sortSpots(vm.spots);
      if (!IS_WEB) vm.spotsDisplayed = vm.spots.slice(0, 25);
      else vm.spotsDisplayed = vm.spots;
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

    function addSample(type) {
      vmParent.data = {};
      if (type === 'field') {
        FormFactory.setForm('sample');
        vmParent.data.sample_type = 'field';
        vm.modalTitle = 'Add a Field Sample';
      }
      else {
        FormFactory.setForm('micro', 'experimental_sample');
        vmParent.data.sample_type = 'experimental';
        vm.modalTitle = 'Add an Experimental Sample';
      }
      vmParent.data.id = HelpersFactory.getNewId();
      var number = ProjectFactory.getSampleNumber() || '';
      var prefix = ProjectFactory.getSamplePrefix() || '';
      if (number !== '' || prefix !== '') vmParent.data.sample_id_name = prefix + number.toString();
      vm.basicFormModal.show();
    }

    function addExistingSubsample() {
      vm.selectSpotModal.show();
    }

    function addSubsample(type) {
      vmParent.data = {};
      if (type === 'field') {
        FormFactory.setForm('sample');
        vmParent.data.sample_type = 'field';
        vm.modalTitle = 'Add a Field Sample/Subsample Spot';
      }
      else {
        FormFactory.setForm('micro', 'experimental_sample');
        vmParent.data.sample_type = 'experimental';
        vm.modalTitle = 'Add an Experimental Sample/Subsample Spot';
      }
      vmParent.data.id = HelpersFactory.getNewId();
      var number = ProjectFactory.getSampleNumber() || '';
      var prefix = ProjectFactory.getSamplePrefix() || '';
      if (number !== '' || prefix !== '') vmParent.data.sample_id_name = prefix + number.toString();
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

    function editSample(sampleToEdit) {
      vmParent.data = angular.fromJson(angular.toJson(sampleToEdit));  // Copy value, not reference
      if (vmParent.data.sample_type === 'experimental') {
        FormFactory.setForm('micro', 'experimental_sample');
        vm.modalTitle = 'Edit Experimental Sample';
      }
      else {
        FormFactory.setForm('sample');
        vm.modalTitle = 'Edit Field Sample';
      }
      vm.basicFormModal.show();
    }

    function getIsWeb() {
      return IS_WEB;
    }

    function goToSubsampleSpot(spot) {
      if (spot.properties && spot.properties.id) $location.path('/app/spotTab/' + spot.properties.id + '/spot');
    }

    function isOptionChecked(spotId) {
      return _.find(vm.subsamples, function (subsampleSpot) {
        return subsampleSpot.properties.id === spotId;
      });
    }

    function loadMoreSpots() {
      var moreSpots = angular.fromJson(angular.toJson(vm.spots)).slice(vm.spotsDisplayed.length,
        vm.spotsDisplayed.length + 20);
      vm.spotsDisplayed = _.union(vm.spotsDisplayed, moreSpots);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    function moreSpotsCanBeLoaded() {
      return vm.spotsDisplayed.length !== vm.spots.length;
    }

    function submit() {
      vmParent.data = HelpersFactory.cleanObj(vmParent.data);
      if (FormFactory.validate(vmParent.data)) {
        if (!vmParent.data.label) vmParent.data.label = createDefaultLabel(vmParent.data);
        if (!vmParent.spot.properties.samples) vmParent.spot.properties.samples = [];
        handleSampleNumber();
        if (vm.modalTitle === 'Add a Field Sample/Subsample Spot' ||
          vm.modalTitle === 'Add an Experimental Sample/Subsample Spot') {
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

    function toggleChecked(spot) {
      var alreadyChecked = _.find(vm.subsamples, function (subsampleSpot) {
        return subsampleSpot.properties.id === spot.properties.id;
      });
      if (alreadyChecked) unlinkSubsampleSpot(spot);
      else {
        if (!vmParent.spot.properties.samples) vmParent.spot.properties.samples = [];
        vmParent.spot.properties.samples.push({'spot_id': spot.properties.id});
        vmParent.saveSpot().then(function () {
          vmParent.spotChanged = false;
          splitSamples();
        });
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
