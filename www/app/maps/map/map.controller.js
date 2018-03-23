(function () {
  'use strict';

  angular
    .module('app')
    .controller('MapController', MapController);

  MapController.$inject = ['$ionicHistory', '$ionicLoading', '$ionicModal', '$ionicPopover', '$ionicPopup',
    '$ionicSideMenuDelegate', '$location', '$log', '$rootScope', '$scope', '$timeout', 'FormFactory', 'HelpersFactory',
    'ImageFactory', 'MapFactory', 'MapDrawFactory', 'MapFeaturesFactory', 'MapLayerFactory', 'MapSetupFactory',
    'MapViewFactory', 'ProjectFactory', 'SpotFactory', 'IS_WEB'];

  function MapController($ionicHistory, $ionicLoading, $ionicModal, $ionicPopover, $ionicPopup, $ionicSideMenuDelegate,
                         $location, $log, $rootScope, $scope, $timeout, FormFactory, HelpersFactory, ImageFactory,
                         MapFactory, MapDrawFactory, MapFeaturesFactory, MapLayerFactory, MapSetupFactory,
                         MapViewFactory, ProjectFactory, SpotFactory, IS_WEB) {
    var vm = this;

    var datasetsLayerStates;
    var map;
    var onlineState;
    var spotsThisMap = {};
    var tagsToAdd = [];

    vm.allTags = [];
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

    vm.cacheOfflineTiles = cacheOfflineTiles;
    vm.closeModal = closeModal;
    vm.createTag = createTag;
    vm.goBack = goBack;
    vm.groupSpots = groupSpots;
    vm.hasSpotBackView = hasSpotBackView;
    vm.isiOS = isiOS;
    vm.isOnline = isOnline;
    vm.saveEdits = saveEdits;
    vm.stereonetSpots = stereonetSpots;
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

      createModals();
      createPopover();
      createMap();
    }

    function createMap() {
      var switcher = new ol.control.LayerSwitcher();

      // Get the Spots to be mapped
      gatherSpots();

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
      else MapViewFactory.zoomToSpotsExtent(map, spotsThisMap);

      // Set the Map Vector Layers
      MapFeaturesFactory.setMappableSpots(spotsThisMap);
      datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map);
      MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map);
      MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map);

      // If we have a current feature set the selected symbol
      if (vm.clickedFeatureId && IS_WEB) {
        var feature = MapFeaturesFactory.getFeatureById(vm.clickedFeatureId);
        if (!_.isEmpty(feature)) MapFeaturesFactory.setSelectedSymbol(map, feature.getGeometry());
      }

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
        vm.currentZoom = HelpersFactory.roundToDecimalPlaces(evt.map.getView().getZoom(), 2);
        $scope.$apply();
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
      });

      // Display popup on click
      map.on('click', function (evt) {
        $log.log('map clicked');
        MapFeaturesFactory.removeSelectedSymbol(map);

        // Are we in draw mode?  If so we don't want to display any popovers during draw mode
        if (!MapDrawFactory.isDrawMode()) {
          var feature = MapFeaturesFactory.getClickedFeature(map, evt);
          var layer = MapFeaturesFactory.getClickedLayer(map, evt);
          if (feature && feature.get('id') && layer && layer.get('name') !== 'geolocationLayer') {
            vm.clickedFeatureId = feature.get('id');
            if (IS_WEB) {
              MapFeaturesFactory.setSelectedSymbol(map, feature.getGeometry());
              $rootScope.$broadcast('clicked-mapped-spot', {'spotId': vm.clickedFeatureId});
            }
            else MapFeaturesFactory.showMapPopup(feature, evt);
          }
          else vm.clickedFeatureId = undefined;
          $scope.$apply();
        }
      });

      var popup = MapSetupFactory.getPopupOverlay();
      popup.getElement().addEventListener('click', function (e) {
        var action = e.target.getAttribute('data-action');
        if (action) {
          if (action === 'takePicture') {
            popup.hide();
            ImageFactory.setIsReattachImage(false);
            ImageFactory.setCurrentSpot(SpotFactory.getSpotById(vm.clickedFeatureId));
            ImageFactory.setCurrentImage({'image_type': 'photo'});
            ImageFactory.takePicture();
          }
          else if (action === 'more') {
            popup.hide();
            $location.path('/app/spotTab/' +vm.clickedFeatureId + '/spot');
            $scope.$apply();
          }
          e.preventDefault();
        }
      }, false);
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
      $rootScope.$on('updateMapFeatureLayer', function () {
        updateFeatureLayer();
      });

      // Spot deleted from map side panel
      $rootScope.$on('deletedSpot', function () {
        vm.clickedFeatureId = undefined;
        MapFeaturesFactory.removeSelectedSymbol(map);
        updateFeatureLayer();
      });

      $scope.$on('$destroy', function () {
        MapViewFactory.setMapView(map);
        MapLayerFactory.saveVisibleLayers(map);
        MapDrawFactory.cancelEdits();    // Cancel any edits
        vm.addTagModal.remove();
        vm.newNestModal.remove();
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
        var lmode = MapDrawFactory.getLassoMode();
        $log.log('LassoMode:', lmode);
        draw.on('drawend', function (e) {
          MapDrawFactory.doOnDrawEnd(e);
          var selectedSpots = SpotFactory.getSelectedSpots();
          if (!_.isEmpty(selectedSpots)) {

            if (lmode == "tags") {
              $log.log("tag mode enabled");

              //cull spots to only those shown on map
              var visibleSpots = MapFeaturesFactory.getVisibleLassoedSpots(selectedSpots, map);
              SpotFactory.setSelectedSpots(visibleSpots);

              vm.allTags = ProjectFactory.getTags();
              tagsToAdd = [];
              vm.addTagModal.show();
              MapDrawFactory.setLassoMode("");
            }
            else if (lmode == "stereonet") {
              $log.log("stereonet mode enabled");

              //use MapFeaturesFactory to get only mapped orientations
              var stereonetSpots = MapFeaturesFactory.getVisibleLassoedSpots(selectedSpots, map);
              $log.log('stereonetSpots: ', stereonetSpots);

              HelpersFactory.getStereonet(stereonetSpots);
              MapDrawFactory.setLassoMode("");
            }
          }
        });
      });

      // Watch whether we have internet access or not
      $scope.$watch('vm.isOnline()', function (online) {
        if (onlineState !== online) {
          onlineState = online;
          MapLayerFactory.switchTileLayers(map, onlineState);
          MapLayerFactory.setVisibleLayers(map);
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
          if (lyr.get('layergroup') === 'Datasets') {     // Individual Datasets
            datasetsLayerStates[lyr.get('datasetId')] = lyr.getVisible();
            updateFeatureLayer();
            switcher.renderPanel();
          }
          else if (lyr.get('name') === 'datasetsLayer') {  // Datasets as a Group
            lyr.getLayers().forEach(function (layer) {     // Individual Datasets
              datasetsLayerStates[layer.get('datasetId')] = lyr.getVisible();
            });
            updateFeatureLayer();
            switcher.renderPanel();
          }
        });
      });
    }

    // Get only the Spots not mapped on an image basemap or strat section
    function gatherSpots() {
      var activeSpots = SpotFactory.getActiveSpots();
      var mappableSpots = _.reject(activeSpots, function (spot) {
        return _.has(spot.properties, 'image_basemap') || _.has(spot.properties, 'strat_section_id');
      });
      // Remove spots that don't have a geometry defined
      spotsThisMap = _.reject(mappableSpots, function (spot) {
        return !_.has(spot, 'geometry');
      });
      $log.log('Spots on this Map:', spotsThisMap);
    }

    function updateFeatureLayer() {
      $log.log('Updating Map Feature Layer ...');
      gatherSpots();
      MapFeaturesFactory.setMappableSpots(spotsThisMap);
      MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map);
    }

    /**
     *  Public Functions
     */

    // Cache the tiles in the current view but don't switch to the offline layer
    function cacheOfflineTiles() {
      vm.popover.hide().then(function () {
        if (onlineState) {
          MapViewFactory.setMapView(map);
          MapLayerFactory.saveVisibleLayers(map);

          // Check valid zoom level
          var maxZoom = _.find(MapFactory.getMaps(), function (gotMap) {
            return gotMap.id === MapLayerFactory.getVisibleLayers()['baselayer'].get('id');
          }).maxZoom;
          if (HelpersFactory.roundToDecimalPlaces(map.getView().getZoom(), 2) > maxZoom) {
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
      });
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

    function goBack() {
      if ($ionicHistory.backView()) $ionicHistory.goBack();
    }

    function groupSpots() {
      vm.popover.hide().then(function () {
        MapDrawFactory.groupSpots();
      });
    }

    function hasSpotBackView() {
      var backView = $ionicHistory.backView();
      return backView && backView.stateName.split('.')[1] === 'spotTab';
    }

    function isOnline() {
      return navigator.onLine;
    }

    function isiOS() {
      return ionic.Platform.device().platform == "iOS";
    }

    function saveEdits() {
      vm.saveEditsText = 'Saved Edits';
      MapDrawFactory.saveEdits(vm.clickedFeatureId);
    }

    function stereonetSpots() {
      vm.popover.hide().then(function () {
        MapDrawFactory.stereonetSpots();
      });
    }

    function toggleNesting() {
      vm.popover.hide().then(function () {
        vm.isNesting = !vm.isNesting;
        SpotFactory.setActiveNesting(vm.isNesting);
        if (vm.isNesting) {
          $log.log('Starting Nesting');
          SpotFactory.clearActiveNest();
          FormFactory.setForm('surface_feature');
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
      });
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
      vm.popover.hide().then(function () {
        MapViewFactory.zoomToSpotsExtent(map, spotsThisMap);
      });
    }
  }
}());
