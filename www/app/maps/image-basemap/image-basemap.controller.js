(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapController', ImageBasemapController);

  ImageBasemapController.$inject = ['$ionicHistory', '$ionicLoading', '$ionicModal', '$ionicPopover', '$ionicPopup',
    '$ionicSideMenuDelegate', '$location', '$log', '$rootScope', '$scope', '$state', '$timeout', 'FormFactory',
    'HelpersFactory', 'MapDrawFactory', 'MapFeaturesFactory', 'MapSetupFactory', 'MapViewFactory',
    'ProjectFactory', 'SpotFactory', 'IS_WEB'];

  function ImageBasemapController($ionicHistory, $ionicLoading, $ionicModal, $ionicPopover, $ionicPopup,
                                  $ionicSideMenuDelegate, $location, $log, $rootScope, $scope, $state, $timeout,
                                  FormFactory, HelpersFactory, MapDrawFactory, MapFeaturesFactory, MapSetupFactory,
                                  MapViewFactory, ProjectFactory, SpotFactory, IS_WEB) {
    var vm = this;

    var currentSpot = {};
    var datasetsLayerStates;
    var map;
    var tagsToAdd = [];

    vm.allTags = [];
    vm.clickedFeatureId = undefined;
    vm.data = {};
    vm.imageBasemap = {};
    vm.imageBasemapScaleLabel = undefined;
    vm.isNesting = SpotFactory.getActiveNesting();
    vm.newNestModal = {};
    vm.newNestProperties = {};
    vm.popover = {};
    vm.saveEditsText = 'Save Edits';
    vm.showSaveEditsBtn = false;

    vm.closeModal = closeModal;
    vm.createTag = createTag;
    vm.goBack = goBack;
    vm.groupSpots = groupSpots;
    vm.hasLinkedImages = hasLinkedImages;
    vm.saveEdits = saveEdits;
    vm.toggleNesting = toggleNesting;
    vm.toggleTagChecked = toggleTagChecked;
    vm.unlinkImages = unlinkImages;
    vm.zoomToSpotsExtent = zoomToSpotsExtent;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $ionicLoading.show({
        'template': '<ion-spinner></ion-spinner><br>Loading Image Basemap...'
      });
      $log.log('Loading Image Basemap ...');

      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      currentSpot = SpotFactory.getCurrentSpot();
      if (currentSpot) vm.clickedFeatureId = currentSpot.properties.id;

      createModals();
      createPopover();
      createMap();
    }

    function createMap() {
      var switcher = new ol.control.LayerSwitcher();

      setImageBasemap();
      MapViewFactory.setInitialMapView(vm.imageBasemap);
      MapSetupFactory.setMap();
      MapSetupFactory.setImageBasemapLayers(vm.imageBasemap).then(function () {
        MapSetupFactory.setOtherLayers();
        MapSetupFactory.setMapControls(switcher);
        MapSetupFactory.setPopupOverlay();

        map = MapSetupFactory.getMap();
        datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map, vm.imageBasemap);
        MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map, vm.imageBasemap);
        MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);

        // If we have a current feature set the selected symbol
        if (vm.clickedFeatureId && IS_WEB) {
          var feature = MapFeaturesFactory.getFeatureById(vm.clickedFeatureId);
          if (!_.isEmpty(feature)) MapFeaturesFactory.setSelectedSymbol(map, feature.getGeometry());
        }

        createSwitcher(switcher);

        vm.currentZoom = HelpersFactory.roundToDecimalPlaces(map.getView().getZoom(), 2);
        updateScaleBar(map.getView().getResolution());
        createMapInteractions();
        createPageEvents();

        $ionicLoading.hide();
        $log.log('Done Loading Image Basemap');
        $timeout(function () {
          map.updateSize();         // use OpenLayers API to force map to update
        });
      });
    }

    function createMapInteractions() {
      // When the map is moved update the zoom control
      map.on('moveend', function (evt) {
        var mapZoom = HelpersFactory.roundToDecimalPlaces(evt.map.getView().getZoom(), 2);
        if (vm.currentZoom !== mapZoom) {
          vm.currentZoom = mapZoom;
          updateScaleBar(evt.map.getView().getResolution());
          $scope.$apply();
        }
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
      });

      // display popup on click
      map.on('click', function (evt) {
        $log.log('map clicked');
        MapFeaturesFactory.removeSelectedSymbol(map);

        // are we in draw mode?  If so we dont want to display any popovers during draw mode
        if (!MapDrawFactory.isDrawMode()) {
          var feature = MapFeaturesFactory.getClickedFeature(map, evt);
          var layer = MapFeaturesFactory.getClickedLayer(map, evt);
          if (feature && layer && layer.get('name') !== 'geolocationLayer') {
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
        MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);
      });

      // Spot deleted from map side panel
      $rootScope.$on('deletedSpot', function () {
        vm.clickedFeatureId = undefined;
        MapFeaturesFactory.removeSelectedSymbol(map);
        MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);
      });

      $scope.$on('$destroy', function () {
        MapDrawFactory.cancelEdits();    // Cancel any edits
        vm.popover.remove();            // Remove the popover
        vm.addTagModal.remove();
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
          $log.log('e', e);
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
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/maps/image-basemap/image-basemap-popover.html', {
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
            MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);
            switcher.renderPanel();
          }
          else if (lyr.get('name') === 'datasetsLayer') {  // Datasets as a Group
            lyr.getLayers().forEach(function (layer) {     // Individual Datasets
              datasetsLayerStates[layer.get('datasetId')] = lyr.getVisible();
            });
            MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);
            switcher.renderPanel();
          }
        });
      });
    }

    // Use predefined values as scale values
    function getScaleLabelValue(x) {
      if (x < 2) return 1;
      if (x < 5) return 2;
      if (x < 10) return 5;
      if (x < 20) return 10;
      if (x < 50) return 20;
      if (x < 100) return 50;
      if (x < 200) return 100;
      if (x < 500) return 200;
      if (x < 1000) return 500;
      if (x < 5000) return 1000;
      return 5000;
    }

    function setImageBasemap() {
      _.each(SpotFactory.getActiveSpots(), function (spot) {
        _.each(spot.properties.images, function (image) {
          if (image.id.toString() === $state.params.imagebasemapId) vm.imageBasemap = image;
        });
      });
    }

    function updateScaleBar(res) {
      var imageBasemapScaleLine = document.getElementById('image-basemap-scale-line');
      var imageBasemapScaleLineInner = document.getElementById('image-basemap-scale-line-inner');
      if (vm.imageBasemap.width_of_image_view && vm.imageBasemap.units_of_image_view && vm.currentZoom) {
        var width = {'value': vm.imageBasemap.width_of_image_view, 'unit': vm.imageBasemap.units_of_image_view};

        // Convert value to larger or smaller unit if necessary
        var x = width.value / vm.currentZoom / 4;
        if (x < 1) width = HelpersFactory.convertToSmallerUnit(width.value, width.unit);
        else if (width.unit === 'm' && x >= 1000) width = HelpersFactory.convertToLargerUnit(width.value, width.unit);
        else if (width.unit === 'cm' && x >= 100) width = HelpersFactory.convertToLargerUnit(width.value, width.unit);
        else if (width.unit === 'mm' && x >= 100) width = HelpersFactory.convertToLargerUnit(width.value, width.unit);
        else if (width.unit === '_m' && x >= 1000) width = HelpersFactory.convertToLargerUnit(width.value, width.unit);

        x = width.value / vm.currentZoom / 4;
        var scaleWidthValueLabel = getScaleLabelValue(x);
        var divisor = width.value / vm.currentZoom / scaleWidthValueLabel;
        var scaleWidthUnitLabel = width.unit;
        if (scaleWidthUnitLabel === '_m') scaleWidthUnitLabel = 'um';
        var scaleWidthPixels = vm.imageBasemap.width / res / vm.currentZoom / divisor;
        imageBasemapScaleLine.style.width = scaleWidthPixels.toString() + 'px';
        vm.imageBasemapScaleLabel = scaleWidthValueLabel + ' ' + scaleWidthUnitLabel;
        imageBasemapScaleLine.style.visibility = 'visible';
        imageBasemapScaleLineInner.style.visibility = 'visible';
      }
      else {
        imageBasemapScaleLine.style.visibility = 'hidden';
        imageBasemapScaleLineInner.style.visibility = 'hidden';
      }
    }

    /**
     * Public Functions
     */

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
      else $location.path('/app/image-basemaps');
    }

    function groupSpots() {
      vm.popover.hide();
      MapDrawFactory.groupSpots();
    }

    function hasLinkedImages() {
      var linkedImages = ProjectFactory.getLinkedImages(vm.imageBasemap.id);
      if (!linkedImages) return false;
      else return ProjectFactory.getLinkedImages(vm.imageBasemap.id).length > 1;
    }

    function saveEdits() {
      vm.saveEditsText = 'Saved Edits';
      MapDrawFactory.saveEdits(vm.clickedFeatureId);
    }

    function toggleNesting() {
      vm.popover.hide();
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

    function unlinkImages() {
      vm.popover.hide();
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Unlink Images',
        'template': 'Are you sure you want to unlink <b>ALL</b> images in this set?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.unlinkImages(vm.imageBasemap.id);
          map.getLayers().forEach(function (layer) {
            if (layer.get('name') === 'imageBasemapLayer') {
              map.removeLayer(layer);
            }
          });
          MapSetupFactory.setImageBasemapLayers(vm.imageBasemap).then(function () {
            datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map, vm.imageBasemap);
            MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map, vm.imageBasemap);
            MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);
          });
        }
      });
    }

    function zoomToSpotsExtent() {
      vm.popover.hide();
      MapViewFactory.zoomToSpotsExtent(map, vm.imageBasemap);
    }
  }
}());
