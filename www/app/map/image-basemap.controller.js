(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapController', ImageBasemapController);

  ImageBasemapController.$inject = ['$ionicHistory', '$ionicLoading', '$ionicModal', '$ionicPopover', '$ionicPopup',
    '$ionicSideMenuDelegate', '$location', '$log', '$q', '$scope', '$state', 'DataModelsFactory', 'FormFactory',
    'HelpersFactory', 'ImageFactory', 'MapDrawFactory', 'MapFeaturesFactory', 'MapSetupFactory', 'MapViewFactory',
    'ProjectFactory', 'SpotFactory'];

  function ImageBasemapController($ionicHistory, $ionicLoading, $ionicModal, $ionicPopover, $ionicPopup,
                                  $ionicSideMenuDelegate, $location, $log, $q, $scope, $state, DataModelsFactory,
                                  FormFactory, HelpersFactory, ImageFactory, MapDrawFactory, MapFeaturesFactory,
                                  MapSetupFactory, MapViewFactory, ProjectFactory, SpotFactory) {
    var vm = this;

    var currentSpot = SpotFactory.getCurrentSpot();
    var map;
    var tagsToAdd = [];

    vm.allTags = [];
    vm.choices = {};
    vm.data = {};
    vm.imageBasemap = {};
    vm.isNesting = SpotFactory.getActiveNesting();
    vm.newNestModal = {};
    vm.newNestProperties = {};
    vm.saveEditsText = 'Save Edits';
    vm.showSaveEditsBtn = false;
    vm.survey = {};

    vm.closeModal = closeModal;
    vm.createTag = createTag;
    vm.goBack = goBack;
    vm.groupSpots = groupSpots;
    vm.saveEdits = saveEdits;
    vm.showField = showField;
    vm.toggleNesting = toggleNesting;
    vm.toggleTagChecked = toggleTagChecked;
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

      setImageBasemap().then(function () {
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

        $ionicModal.fromTemplateUrl('app/shared/new-nest-modal.html', {
          'scope': $scope,
          'animation': 'slide-in-up',
          'backdropClickToClose': false,
          'hardwareBackButtonClose': false
        }).then(function (modal) {
          vm.newNestModal = modal;
        });

        // When the map is moved update the zoom control
        map.on('moveend', function (evt) {
          vm.currentZoom = evt.map.getView().getZoom();
        });

        map.on('touchstart', function (event) {
          $log.log('touch');
          $log.log(event);
        });

        // display popup on click
        map.on('click', function (evt) {
          $log.log('map clicked');

          // are we in draw mode?  If so we dont want to display any popovers during draw mode
          if (!MapDrawFactory.isDrawMode()) {
            MapFeaturesFactory.showPopup(map, evt);
          }
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
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.addTagModal.remove();
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
      if (vm.imageBasemap.height && vm.imageBasemap.width) return $q.when(null);
      else {
        return ImageFactory.getImageById(vm.imageBasemap.id).then(function (src) {
          if (!src) src = 'img/image-not-found.png';
          var im = new Image();
          im.src = src;
          vm.imageBasemap.height = im.height;
          vm.imageBasemap.width = im.width;
        });
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
        if(_.isEmpty(activeNest)) {
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

    function zoomToSpotsExtent() {
      vm.popover.hide();
      MapViewFactory.zoomToSpotsExtent(map, vm.imageBasemap);
    }
  }
}());
