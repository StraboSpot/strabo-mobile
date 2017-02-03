(function () {
  'use strict';

  angular
    .module('app')
    .controller('MapSidePanelController', MapSidePanelController);

  MapSidePanelController.$inject = ['$rootScope', '$scope', 'SpotFactory'];

  function MapSidePanelController($rootScope, $scope, SpotFactory) {
    var vm = this;

    var activeTab = 'spot';
    var clickedFeatureId = undefined;

    vm.isActiveTab = isActiveTab;
    vm.onload = onLoad;
    vm.setActiveTab = setActiveTab;

    activate();

    function activate() {
      if (SpotFactory.getCurrentSpot()) clickedFeatureId = SpotFactory.getCurrentSpot().properties.id;

      $scope.$on('clicked-mapped-spot', function (event, args) {
        clickedFeatureId = args.spotId;
        SpotFactory.setCurrentSpotById(clickedFeatureId);
        $rootScope.$broadcast('load-tab', {'spotId': clickedFeatureId, 'tabName': activeTab });
      });
    }

    function isActiveTab(tab) {
      return tab === activeTab;
    }

    function onLoad(tab) {
      if (clickedFeatureId && tab === activeTab) {
        $rootScope.$broadcast('load-tab', {'spotId': clickedFeatureId, 'tabName': activeTab });
      }
    }

    function setActiveTab(tab) {
      activeTab = tab;
      $rootScope.$broadcast('load-tab', {'spotId': clickedFeatureId, 'tabName': activeTab });
    }
  }
}());
