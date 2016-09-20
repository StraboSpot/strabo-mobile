(function () {
  'use strict';

  angular
    .module('app')
    .controller('MapController', MapController);

  MapController.$inject = ['$ionicHistory', '$ionicModal', '$ionicPopover', '$ionicPopup', '$ionicSideMenuDelegate',
    '$location', '$log', '$scope', 'HelpersFactory', 'MapFactory', 'MapDrawFactory', 'MapFeaturesFactory',
    'MapLayerFactory', 'MapSetupFactory', 'MapViewFactory', 'ProjectFactory', 'SpotFactory'];

  function MapController($ionicHistory, $ionicModal, $ionicPopover, $ionicPopup, $ionicSideMenuDelegate, $location,
                         $log, $scope, HelpersFactory, MapFactory, MapDrawFactory, MapFeaturesFactory, MapLayerFactory,
                         MapSetupFactory, MapViewFactory, ProjectFactory, SpotFactory) {
    var vm = this;

    var onlineState;
    var map;
    var tagsToAdd = [];

    vm.allTags = [];
    vm.currentSpot = SpotFactory.getCurrentSpot();
    vm.currentZoom = '';
    vm.saveEditsText = 'Save Edits';
    vm.showSaveEditsBtn = false;

    vm.cacheOfflineTiles = cacheOfflineTiles;
    vm.closeModal = closeModal;
    vm.createTag = createTag;
    vm.groupSpots = groupSpots;
    vm.isOnline = isOnline;
    vm.returnToSpot = returnToSpot;
    vm.saveEdits = saveEdits;
    vm.toggleChecked = toggleChecked;
    vm.toggleLocation = toggleLocation;
    vm.zoomToSpotsExtent = zoomToSpotsExtent;

    activate();

    /**
     *  Private Functions
     */

    function activate() {
      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      if (!vm.currentSpot) HelpersFactory.setBackView($ionicHistory.currentView().url);

      createPopover();
      var switcher = new ol.control.LayerSwitcher();

      // Setup the Map
      MapViewFactory.setInitialMapView();
      MapSetupFactory.setImageBasemap(null);
      MapSetupFactory.setMap();
      MapSetupFactory.setLayers();
      MapSetupFactory.setMapControls(switcher);
      MapSetupFactory.setPopupOverlay();

      // Get the Map
      map = MapSetupFactory.getMap();

      // Set the Map View
      if (MapViewFactory.getMapView()) map.setView(MapViewFactory.getMapView());
      else MapViewFactory.zoomToSpotsExtent(map);

      // Set the Map Vector Layers
      var datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map);
      MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map);
      MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map);

      $ionicModal.fromTemplateUrl('app/map/add-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.addTagModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.addTagModal.remove();
      });

      // When the map is moved save the new view and update the zoom control
      map.on('moveend', function (evt) {
        vm.currentZoom = evt.map.getView().getZoom();
        $scope.$apply();
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
      });

      // Cleanup when we leave the page (need unloaded, as opposed to leave, so this fires when
      // opening an item from the options button)
      $scope.$on('$ionicView.unloaded', function () {
        MapViewFactory.setMapView(map);
        MapLayerFactory.setVisibleLayer(map);
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
        if (onlineState !== online) {
          onlineState = online;
          if (online) MapLayerFactory.setOnlineLayersVisible(map);
          else MapLayerFactory.setOfflineLayersVisible(map);
        }
      });

      $scope.$on('enableSaveEdits', function (e, data) {
        vm.showSaveEditsBtn = data;
        vm.saveEditsText = 'Save Edits';
        _.defer(function () {
          $scope.$apply();
        });
      });

      $scope.$on('changedDrawMode', function () {
        setMapDrawInteraction();
      });
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/map/map-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });
    }

    function setMapDrawInteraction() {
      var draw = MapDrawFactory.getDrawMode();
      draw.on('drawend', function (e) {
        MapDrawFactory.doOnDrawEnd(e);
        var selectedSpots = SpotFactory.getSelectedSpots();
        if (!_.isEmpty(selectedSpots)) {
          $log.log('Selected Spots:', selectedSpots);
          vm.allTags = ProjectFactory.getTags();
          tagsToAdd = [];
          vm.addTagModal.show();
        }
      });
    }

    /**
     *  Public Functions
     */

    // Cache the tiles in the current view but don't switch to the offline layer
    function cacheOfflineTiles() {
      vm.popover.hide();

      if (onlineState) {
        MapViewFactory.setMapView(map);
        MapLayerFactory.setVisibleLayer(map);

        // Check valid zoom level
        var maxZoom = _.find(MapFactory.getMaps(), function (gotMap) {
          return gotMap.id === MapLayerFactory.getVisibleLayer().get('id');
        }).maxZoom;
        if (map.getView().getZoom() > maxZoom) {
          $ionicPopup.alert({
            'title': 'Map Zoom Max Exceeded!',
            'template': 'Max zoom level for this map is ' + maxZoom + '. Zoom out to save map.'
          });
        }
        else $location.path('/app/map/archiveTiles');
      }
      else {
        $ionicPopup.alert({
          'title': 'Offline!',
          'template': 'You must be online to save a map!'
        });
      }
    }

    function closeModal(modal) {
      vm[modal].hide();
      if (modal === 'addTagModal') {
        var selectedSpots = SpotFactory.getSelectedSpots();
        _.each(tagsToAdd, function (tagToAdd) {
          _.each(selectedSpots, function (selectedSpot) {
            if (!tagToAdd.spots) tagToAdd.spots = [];
            if (!_.contains(tagToAdd.spots, selectedSpot.properties.id)) {
              tagToAdd.spots.push(selectedSpot.properties.id);
            }
          });
          ProjectFactory.saveTag(tagToAdd);
        });
      }
      SpotFactory.clearSelectedSpots();
    }

    function createTag() {
      vm.addTagModal.hide();
      var id = HelpersFactory.getNewId();
      $location.path('/app/tags/' + id);
    }

    function groupSpots() {
      vm.popover.hide();
      MapDrawFactory.groupSpots();
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

    function toggleChecked(tag) {
      var found = _.find(tagsToAdd, function (tagToAdd) {
        return tagToAdd.id === tag.ig;
      });
      if (found) {
        tagsToAdd = _.reject(tagsToAdd, function (tagToAdd) {
          return tagToAdd.id === tag.id;
        });
      }
      else tagsToAdd.push(tag);
    }

    // Get current position
    function toggleLocation() {
      vm.locationOn = !vm.locationOn;
      MapViewFactory.setLocationOn(vm.locationOn);
      MapViewFactory.getCurrentLocation(map);
    }

    function zoomToSpotsExtent() {
      vm.popover.hide();
      MapViewFactory.zoomToSpotsExtent(map);
    }
  }
}());
