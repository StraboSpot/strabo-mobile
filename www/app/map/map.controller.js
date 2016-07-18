(function () {
  'use strict';

  angular
    .module('app')
    .controller('MapController', MapController);

  MapController.$inject = ['$ionicHistory', '$ionicPopover', '$ionicPopup', '$ionicSideMenuDelegate', '$location',
    '$log', '$scope', 'HelpersFactory', 'MapDrawFactory', 'MapFeaturesFactory', 'MapLayerFactory', 'MapSetupFactory',
    'MapViewFactory', 'SpotFactory', 'OfflineTilesFactory'];

  function MapController($ionicHistory, $ionicPopover, $ionicPopup, $ionicSideMenuDelegate, $location, $log, $scope,
                         HelpersFactory, MapDrawFactory, MapFeaturesFactory, MapLayerFactory, MapSetupFactory,
                         MapViewFactory, SpotFactory, OfflineTilesFactory) {
    var vm = this;

    vm.cacheOfflineTiles = cacheOfflineTiles;
    vm.currentSpot = SpotFactory.getCurrentSpot();
    vm.currentZoom = '';
    vm.groupSpots = groupSpots;
    vm.isOnline = isOnline;
    vm.returnToSpot = returnToSpot;
    vm.saveEdits = saveEdits;
    vm.saveEditsText = 'Save Edits';
    vm.showSaveEditsBtn = false;
    vm.toggleLocation = toggleLocation;
    vm.zoomToSpotsExtent = zoomToSpotsExtent;

    var map;
    if (!vm.currentSpot) HelpersFactory.setBackView($ionicHistory.currentView().url);

    activate();

    /**
     *  Private Functions
     */

    function activate() {
      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      createPopover();
      var switcher = new ol.control.LayerSwitcher();

      MapSetupFactory.setImageBasemap(null);
      MapSetupFactory.setInitialMapView();
      MapSetupFactory.setMap();
      MapSetupFactory.setLayers();
      MapSetupFactory.setMapControls(switcher);
      MapSetupFactory.setPopupOverlay();

      map = MapSetupFactory.getMap();

      getMapView();
      var datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map);
      MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map);
      MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map);

      // When the map is moved save the new view and update the zoom control
      map.on('moveend', function (evt) {
        MapViewFactory.setMapView(map.getView());
        vm.currentZoom = evt.map.getView().getZoom();
        $scope.$apply();
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
      });

      // Cleanup when we leave the page
      $scope.$on('$ionicView.leave', function () {
        MapDrawFactory.cancelEdits();    // Cancel any edits
        vm.popover.remove();            // Remove the popover
      });

      // Add a `change:visible` listener to all layers currently within the map
      ol.control.LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
        l.on('change', function (e) {
          var lyr = e.target;
          if (lyr.get('title') === 'Datasets') {
            _.each(lyr.getLayerStatesArray(), function (layerState) {
              if (datasetsLayerStates[layerState.layer.get('id')] !== layerState.visible) {
                datasetsLayerStates[layerState.layer.get('id')] = layerState.visible;
              }
            });
            MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map);
            switcher.renderPanel();
          }
        });
      });

      // Display popup on click
      map.on('click', function (evt) {
        $log.log('map clicked');

        // Are we in draw mode?  If so we don't want to display any popovers during draw mode
        if (!MapDrawFactory.isDrawMode()) {
          MapFeaturesFactory.showPopup(map, evt);
        }
      });

      // Watch whether we have internet access or not
      $scope.$watch('vm.isOnline()', function (online) {
        MapLayerFactory.setVisibleLayers(map, online);
      });

      $scope.$on('enableSaveEdits', function (e, data) {
        vm.showSaveEditsBtn = data;
        vm.saveEditsText = 'Save Edits';
        _.defer(function () {
          $scope.$apply();
        });
      });
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/map/map-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });
    }

    // If there is a Map View set then reset the map to that view,
    // otherwise zoom to the extent of the spots
    function getMapView() {
      if (MapViewFactory.getMapView()) {
        $log.log('A mapview is set, changing map view to that');
        map.setView(MapViewFactory.getMapView());
      }
      else {
        MapViewFactory.zoomToSpotsExtent(map);
      }
    }

    /**
     *  Public Functions
     */

    // Cache the tiles in the current view but don't switch to the offline layer
    function cacheOfflineTiles() {
      vm.popover.hide();
      if (navigator.onLine) {
        // Get the map extent
        var mapViewExtent = MapViewFactory.getMapViewExtent(map);

        // set the extent into the MapViewFactory
        MapViewFactory.setExtent(MapLayerFactory.getCurrentVisibleLayer(map), mapViewExtent.topRight,
          mapViewExtent.bottomLeft,
          mapViewExtent.zoom);

        // we set the current map provider so if we ever come back, we should try to use that map provider instead of the default provider
        OfflineTilesFactory.setCurrentMapProvider(MapLayerFactory.getCurrentVisibleLayer(map));

        $location.path('/app/map/archiveTiles');
      }
      else {
        $ionicPopup.alert({
          'title': 'Offline!',
          'template': 'You must be online to save a map!'
        });
      }
    }

    function groupSpots() {
      vm.popover.hide();
      MapDrawFactory.groupSpots($scope);
    }

    function isOnline() {
      return navigator.onLine;
    }

    function returnToSpot() {
      $location.path('/app/spotTab/' + vm.currentSpot.properties.id + '/spot');
    }

    function saveEdits() {
      vm.saveEditsText = 'Saved Edits';
      MapDrawFactory.saveEdits();
    }

    // Get current position
    function toggleLocation() {
      vm.locationOn = angular.isUndefined(vm.locationOn) || vm.locationOn === false;
      MapViewFactory.getCurrentLocation(map, vm.locationOn);
    }

    function zoomToSpotsExtent() {
      vm.popover.hide();
      MapViewFactory.zoomToSpotsExtent(map);
    }
  }
}());
