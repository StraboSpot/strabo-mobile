(function () {
  'use strict';

  angular
    .module('app')
    .controller('MapSidePanelController', MapSidePanelController);

  MapSidePanelController.$inject = ['$document', '$log', '$rootScope', '$scope', '$window', 'SpotFactory'];

  function MapSidePanelController($document, $log, $rootScope, $scope, $window, SpotFactory) {
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
        $log.log('Side panel handling clicked Spot ...');
        clickedFeatureId = args.spotId;
        SpotFactory.setCurrentSpotById(clickedFeatureId);
        $rootScope.$broadcast('load-tab', {'spotId': clickedFeatureId, 'tabName': activeTab});
      });

      moveIcons(true);
      var toggle = $document[0].getElementsByClassName('toggler')[0];
      toggle.addEventListener('click', function (evt) {
        moveIcons();
      });
    }

    function isActiveTab(tab) {
      return tab === activeTab;
    }

    // Move button icons for map menu and emogeos when side panel opens or closes
    function moveIcons(isLoading) {
      var sidePanelNode = $document[0].getElementById('map-side-panel');
      var sidePanelRightPosition = $window.getComputedStyle(sidePanelNode, null).getPropertyValue('right');
      sidePanelRightPosition = parseInt(sidePanelRightPosition);
      var sidePanelLeftPosition = Math.abs(sidePanelRightPosition);

      // On loading emogeo buttons and map menu buttons are positioned after side panel
      // If not loading these buttons are positioned before side panel toggle complete
      if (isLoading && sidePanelRightPosition < 0) sidePanelLeftPosition = 0;
      else if (isLoading) sidePanelLeftPosition = sidePanelNode.offsetWidth;

      var emogeosNode = $document[0].getElementsByClassName('emogeo-controls')[0];
      var mapMenuNode = $document[0].getElementsByClassName('map-menu')[0];
      if (sidePanelLeftPosition === 0) {
        if (emogeosNode) emogeosNode.style.right = "10px";
        if (mapMenuNode) mapMenuNode.style.right = "10px";
      }
      else {
        if (emogeosNode) emogeosNode.style.right = sidePanelLeftPosition + 10 + "px";
        if (mapMenuNode) mapMenuNode.style.right = sidePanelLeftPosition + 10 + "px";
      }
    }

    function onLoad(tab) {
      if (clickedFeatureId && tab === activeTab) {
        $rootScope.$broadcast('load-tab', {'spotId': clickedFeatureId, 'tabName': activeTab});
      }
    }

    function setActiveTab(tab) {
      activeTab = tab;
      $rootScope.$broadcast('load-tab', {'spotId': clickedFeatureId, 'tabName': activeTab});
    }
  }
}());
