(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapController', ImageBasemapController);

  ImageBasemapController.$inject = ['$ionicHistory', '$ionicLoading', '$ionicModal', '$ionicPopover',
    '$ionicSideMenuDelegate', '$location', '$log', '$scope', '$state', 'HelpersFactory', 'MapDrawFactory',
    'MapFeaturesFactory', 'MapSetupFactory', 'MapViewFactory', 'ProjectFactory', 'SpotFactory'];

  function ImageBasemapController($ionicHistory, $ionicLoading, $ionicModal, $ionicPopover, $ionicSideMenuDelegate,
                                  $location, $log, $scope, $state, HelpersFactory, MapDrawFactory, MapFeaturesFactory,
                                  MapSetupFactory, MapViewFactory, ProjectFactory, SpotFactory) {
    var vm = this;

    var currentSpot = SpotFactory.getCurrentSpot();
    var map;
    var tagsToAdd = [];

    vm.allTags = [];
    vm.imageBasemap = {};
    vm.saveEditsText = 'Save Edits';
    vm.showSaveEditsBtn = false;

    vm.closeModal = closeModal;
    vm.createTag = createTag;
    vm.goBack = goBack;
    vm.groupSpots = groupSpots;
    vm.saveEdits = saveEdits;
    vm.toggleChecked = toggleChecked;
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

      if (!currentSpot) HelpersFactory.setBackView($ionicHistory.currentView().url);

      createPopover();
      var switcher = new ol.control.LayerSwitcher();

      setImageBasemap();
      MapSetupFactory.setImageBasemap(vm.imageBasemap);
      MapViewFactory.setInitialMapView(vm.imageBasemap);
      MapSetupFactory.setMap();
      MapSetupFactory.setLayers();
      MapSetupFactory.setMapControls(switcher);
      MapSetupFactory.setPopupOverlay();

      map = MapSetupFactory.getMap();
      var datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map, vm.imageBasemap);
      MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map, vm.imageBasemap);
      MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);

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

      // When the map is moved update the zoom control
      map.on('moveend', function (evt) {
        vm.currentZoom = evt.map.getView().getZoom();
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
      });

      // Cleanup when we leave the page (need unloaded, as opposed to leave, so this fires when
      // opening an item from the options button)
      $scope.$on('$ionicView.unloaded', function () {
        MapDrawFactory.cancelEdits();    // Cancel any edits
        vm.popover.remove();            // Remove the popover
      });

      $scope.$on('$ionicView.enter', function () {
        $ionicLoading.hide();
        $log.log('Done Loading Image Basemap');
      });

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
            MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);
            switcher.renderPanel();
          }
        });
      });

      // display popup on click
      map.on('click', function (evt) {
        $log.log('map clicked');

        // are we in draw mode?  If so we dont want to display any popovers during draw mode
        if (!MapDrawFactory.isDrawMode()) {
          MapFeaturesFactory.showPopup(map, evt);
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
      $ionicPopover.fromTemplateUrl('app/map/image-basemap-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });
    }

    function setMapDrawInteraction() {
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
    }

    function setImageBasemap() {
      _.each(SpotFactory.getActiveSpots(), function (spot) {
        _.each(spot.properties.images, function (image) {
          if (image.id.toString() === $state.params.imagebasemapId) vm.imageBasemap = image;
        });
      });
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
      SpotFactory.clearSelectedSpots();
    }

    function createTag() {
      vm.addTagModal.hide();
      var id = HelpersFactory.getNewId();
      $location.path('/app/tags/' + id);
    }

    function goBack() {
      if (!currentSpot) $location.path('/app/image-basemaps');
      // Return to spot tab unless we got to this image from the images tab (that is if the id
      // of the image basemap we're leaving matches the id of an image of this spot)
      else if (currentSpot.properties.image_basemap &&
        currentSpot.properties.image_basemap.toString() === $state.params.imagebasemapId) {
        $location.path('/app/spotTab/' + currentSpot.properties.id + '/spot');
      }
      else $location.path('/app/spotTab/' + currentSpot.properties.id + '/images');
    }

    function groupSpots() {
      vm.popover.hide();
      MapDrawFactory.groupSpots();
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

    function zoomToSpotsExtent() {
      vm.popover.hide();
      MapViewFactory.zoomToSpotsExtent(map, vm.imageBasemap);
    }
  }
}());
