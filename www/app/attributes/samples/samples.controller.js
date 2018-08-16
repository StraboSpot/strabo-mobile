(function () {
  'use strict';

  angular
    .module('app')
    .controller('SamplesController', SamplesController);

  SamplesController.$inject = ['$ionicHistory', '$location', '$log', '$scope', 'DataModelsFactory', 'HelpersFactory',
    'SpotFactory', 'IS_WEB'];

  function SamplesController($ionicHistory, $location, $log, $scope, DataModelsFactory, HelpersFactory, SpotFactory,
                             IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;

    vm.samples = [];
    vm.sampleIdSelected = undefined;

    vm.getLabel = getLabel;
    vm.getSpotName = getSpotName;
    vm.goToSample = goToSample;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      gatherSamples();
    }

    function gatherSamples() {
      var spots = angular.fromJson(angular.toJson(SpotFactory.getActiveSpots()));
      _.each(spots, function (spot) {
        if (spot.properties.samples) {
          _.each(spot.properties.samples, function (sample) {
            sample.spotId = spot.properties.id;
            vm.samples.push(sample);
          });
        }
      });
      $log.log(vm.samples);
    }

    /**
     * Public Functions
     */

    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
    }

    function getSpotName(spotId) {
      var spot = SpotFactory.getSpotById(spotId);
      return spot.properties.name;
    }

    function goToSample(sample) {
      vm.sampleIdSelected = sample.id;
      $location.path('/app/spotTab/' + sample.spotId + '/samples');
    }
  }
}());
