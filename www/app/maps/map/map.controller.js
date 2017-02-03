(function () {
  'use strict';

  angular
    .module('app')
    .controller('MapController', MapController);

  MapController.$inject = ['$ionicHistory', '$ionicLoading', '$ionicModal', '$ionicPopover', '$ionicPopup',
    '$ionicSideMenuDelegate', '$location', '$log', '$rootScope', '$scope', '$state', '$timeout', 'DataModelsFactory',
    'FormFactory', 'HelpersFactory', 'MapFactory', 'MapDrawFactory', 'MapFeaturesFactory', 'MapLayerFactory',
    'MapSetupFactory', 'MapViewFactory', 'ProjectFactory', 'SpotFactory', 'IS_WEB'];

  function MapController($ionicHistory, $ionicLoading, $ionicModal, $ionicPopover, $ionicPopup, $ionicSideMenuDelegate,
                         $location, $log, $rootScope, $scope, $state, $timeout, DataModelsFactory, FormFactory, HelpersFactory,
                         MapFactory, MapDrawFactory, MapFeaturesFactory, MapLayerFactory, MapSetupFactory,
                         MapViewFactory, ProjectFactory, SpotFactory, IS_WEB) {
    var vm = this;

    var datasetsLayerStates;
    var map;
    var onlineState;
    var tagsToAdd = [];

    vm.allTags = [];
    vm.choices = {};
    vm.clickedFeatureId = undefined;
    vm.currentSpot = {};
    vm.currentZoom = '';
    vm.data = {};
    vm.isNesting = SpotFactory.getActiveNesting();
    vm.isWeb = IS_WEB;
    vm.newNestModal = {};
    vm.newNestProperties = {};
    vm.saveEditsText = 'Save Edits';
    vm.showSaveEditsBtn = false;
    vm.survey = {};

    vm.cacheOfflineTiles = cacheOfflineTiles;
    vm.closeModal = closeModal;
    vm.createTag = createTag;
    vm.groupSpots = groupSpots;
    vm.isOnline = isOnline;
    vm.returnToSpot = returnToSpot;
    vm.saveEdits = saveEdits;
    vm.showField = showField;
    vm.toggleNesting = toggleNesting;
    vm.toggleTagChecked = toggleTagChecked;
    vm.toggleLocation = toggleLocation;
    vm.zoomToSpotsExtent = zoomToSpotsExtent;

    activate();

    /**
     *  Private Functions
     */

    function activate() {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner><br>Loading Map...'
      });
      $log.log('Loading Map ...');

      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      vm.currentSpot = SpotFactory.getCurrentSpot();
      if (vm.currentSpot) vm.clickedFeatureId = vm.currentSpot.properties.id;
      if (!vm.currentSpot && !IS_WEB) HelpersFactory.setBackView($ionicHistory.currentView().url);

      createModals();
      createPopover();
      createMap();
    }

    function createMap() {
      var switcher = new ol.control.LayerSwitcher();

      // Setup the Map
      MapViewFactory.setInitialMapView();
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
      datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map);
      MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map);
      MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map);
      createSwitcher(switcher);

      createMapInteractions();
      createPageEvents();

      $ionicLoading.hide();
      $log.log('Done Loading Map');
      $timeout(function () {
        map.updateSize();         // use OpenLayers API to force map to update
      });
    }

    function createMapInteractions() {
      // When the map is moved save the new view and update the zoom control
      map.on('moveend', function (evt) {
        vm.currentZoom = evt.map.getView().getZoom();
        $scope.$apply();
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
      });

      // Display popup on click
      map.on('click', function (evt) {
        $log.log('map clicked');

        // Are we in draw mode?  If so we don't want to display any popovers during draw mode
        if (!MapDrawFactory.isDrawMode()) {
          var feature = MapFeaturesFactory.getClickedFeature(map, evt);
          var layer = MapFeaturesFactory.getClickedLayer(map, evt);
          if (feature && layer && layer.get('name') !== 'geolocationLayer') {
            vm.clickedFeatureId = feature.get('id');
            if (IS_WEB) $rootScope.$broadcast('clicked-mapped-spot', {'spotId': vm.clickedFeatureId});
            else MapFeaturesFactory.showMapPopup(feature, evt);
          }
          else vm.clickedFeatureId = undefined;
          $scope.$apply();
        }
      });
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/maps/map/add-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.addTagModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/shared/new-nest-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.newNestModal = modal;
      });
    }

    function createPageEvents() {
      $rootScope.$on('updateFeatureLayer', function () {
        MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map);
      });

      // Spot deleted from map side panel
      $rootScope.$on('deletedSpot', function () {
        vm.clickedFeatureId = undefined;
        MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map);
      });

      $scope.$on('$destroy', function () {
        MapViewFactory.setMapView(map);
        MapLayerFactory.setVisibleLayer(map);
        MapDrawFactory.cancelEdits();    // Cancel any edits
        vm.addTagModal.remove();
        vm.popover.remove();            // Remove the popover
      });

      $scope.$on('enableSaveEdits', function (e, data) {
        vm.showSaveEditsBtn = data;
        vm.saveEditsText = 'Save Edits';
        _.defer(function () {
          $scope.$apply();
        });
      });

      $scope.$on('changedDrawMode', function () {
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
      });

      // Watch whether we have internet access or not
      $scope.$watch('vm.isOnline()', function (online) {
        if (onlineState !== online) {
          onlineState = online;
          if (online) MapLayerFactory.setOnlineLayersVisible(map);
          else MapLayerFactory.setOfflineLayersVisible(map);
        }
      });
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/maps/map/map-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });
    }

    // Layer switcher
    function createSwitcher(switcher) {
      // Add a `change:visible` listener to all layers currently within the map
      ol.control.LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
        l.on('change:visible', function (e) {
          var lyr = e.target;
          if (lyr.get('layergroup') === 'Datasets') {
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
      else if (modal === 'newNestModal') {
        if (!vm.newNestProperties.name) vm.newNestProperties.name = HelpersFactory.getNewId().toString();
        if (!_.isEmpty(vm.data)) vm.newNestProperties.surface_feature = {};
        _.extend(vm.newNestProperties.surface_feature, vm.data);
        SpotFactory.setNewNestProperties(vm.newNestProperties);
        vm.data = {};
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

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (show && field.default) {
        if (!vm.data[field.name]) vm.data[field.name] = field.default;
      }
      if (!show) {
        if (vm.data[field.name]) delete vm.data[field.name];
      }
      return show;
    }

    function toggleNesting() {
      vm.popover.hide();
      vm.isNesting = !vm.isNesting;
      SpotFactory.setActiveNesting(vm.isNesting);
      if (vm.isNesting) {
        $log.log('Starting Nesting');
        SpotFactory.clearActiveNest();
        vm.survey = DataModelsFactory.getDataModel('surface_feature').survey;
        vm.choices = DataModelsFactory.getDataModel('surface_feature').choices;
        vm.data = {};
        vm.newNestModal.show();
      }
      else {
        var activeNest = SpotFactory.getActiveNest();
        SpotFactory.clearActiveNest();
        vm.newNestProperties = {};
        if (_.isEmpty(activeNest)) {
          $ionicPopup.alert({
            'title': 'Empty Nest!',
            'template': 'No Spots were added to the Nest.'
          });
        }
      }
    }

    function toggleTagChecked(tag) {
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
