(function () {
  'use strict';

  angular
    .module('app')
    .controller('ThinSectionController', ThinSectionController);

  ThinSectionController.$inject = ['$compile', '$ionicHistory', '$ionicModal', '$ionicPopover', '$ionicPopup',
    '$ionicSideMenuDelegate', '$location', '$log', '$q', '$rootScope', '$scope', '$state', '$timeout', 'FormFactory',
    'HelpersFactory', 'ImageFactory', 'MapDrawFactory', 'MapEmogeosFactory', 'MapFeaturesFactory', 'MapLayerFactory',
    'MapSetupFactory', 'MapViewFactory', 'ProjectFactory', 'SpotFactory', 'ThinSectionFactory', 'IS_WEB'];

  function ThinSectionController($compile, $ionicHistory, $ionicModal, $ionicPopover, $ionicPopup,
                                 $ionicSideMenuDelegate, $location, $log, $q, $rootScope, $scope, $state, $timeout,
                                 FormFactory, HelpersFactory, ImageFactory, MapDrawFactory, MapEmogeosFactory,
                                 MapFeaturesFactory, MapLayerFactory, MapSetupFactory, MapViewFactory, ProjectFactory,
                                 SpotFactory, ThinSectionFactory, IS_WEB) {
    var vm = this;

    var currentSpot = {};
    var datasetsLayerStates;
    var imageSources = [];
    var maps = {};
    var spotsThisMap = [];
    var tagsToAdd = [];
    var switchers = {};

    //vm.addIntervalModal = {};
    vm.allTags = [];
    vm.clickedFeatureId = undefined;
    vm.data = {};
    vm.images = [];
    vm.imagesSelected = [];
    vm.isNesting = SpotFactory.getActiveNesting();
    vm.newNestModal = {};
    vm.newNestProperties = {};
    vm.popover = {};
    vm.saveEditsText = 'Save Edits';
    vm.showSaveEditsBtns = {};
    vm.thisSpotWithThinSection = {};

    vm.closeModal = closeModal;
    vm.createTag = createTag;
    vm.getImageSrc = getImageSrc;
    vm.goBack = goBack;
    vm.goToSpot = goToSpot;
    vm.groupSpots = groupSpots;
    vm.hasRelationships = hasRelationships;
    vm.isiOS = isiOS;
    vm.saveEdits = saveEdits;
    vm.stereonetSpots = stereonetSpots;
    vm.toggleImageSelected = toggleImageSelected;
    vm.toggleNesting = toggleNesting;
    vm.toggleTagChecked = toggleTagChecked;
    vm.zoomToSpotsExtent = zoomToSpotsExtent;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('Loading Thin Section ...');

      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      currentSpot = SpotFactory.getCurrentSpot();
      if (currentSpot) vm.clickedFeatureId = currentSpot.properties.id;
      //MapEmogeosFactory.clearSelectedSpot();

      getSpotWithThinSection();
      createModals();
      createPopover();
      createPageEvents();
    }

    function createMap(image) {
      var mapName = 'map' + image.id;
      maps[mapName] = {};
      switchers[mapName] = new ol.control.LayerSwitcher();

      MapViewFactory.setInitialMapView(image);
      MapSetupFactory.setMap(mapName);
      MapSetupFactory.setImageBasemapLayers(image, mapName).then(function () {
        MapSetupFactory.setOtherLayers(mapName);
        MapSetupFactory.setMapControls(switchers[mapName], mapName);
        MapSetupFactory.setPopupOverlay(mapName);

        maps[mapName] = MapSetupFactory.getMap(mapName);
        var spots = gatherSpotsOnImage(image.id);
        $log.log('Spots on this Map:', spots);
        MapFeaturesFactory.setMappableSpots(spots, mapName);
        datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(maps[mapName], mapName);
        MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, maps[mapName], mapName);
        MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, maps[mapName], mapName);

        // If we have a current feature set the selected symbol
        if (vm.clickedFeatureId && IS_WEB) {
          var feature = MapFeaturesFactory.getFeatureById(vm.clickedFeatureId, mapName);
          if (!_.isEmpty(feature)) MapFeaturesFactory.setSelectedSymbol(maps[mapName], feature.getGeometry());
        }

        createSwitcher(switchers[mapName], maps[mapName]);

        vm.currentZoom = HelpersFactory.roundToDecimalPlaces(maps[mapName].getView().getZoom(), 2);
        //updateScaleBar(maps[mapName].getView().getResolution());
        createMapInteractions(maps[mapName]);

        $log.log('Done Loading Image Basemap');
        $timeout(function () {
          maps[mapName].updateSize();         // use OpenLayers API to force map to update
        });
      });
    }

    function createMapInteractions(map) {
      // When the map is moved update the zoom control
      map.on('moveend', function (evt) {
        var mapZoom = HelpersFactory.roundToDecimalPlaces(evt.map.getView().getZoom(), 2);
        if (vm.currentZoom !== mapZoom) {
          vm.currentZoom = mapZoom;
          $scope.$apply();
        }
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
      });

      // display popup on click
      map.on('click', function (evt) {
        //$log.log('map clicked at pixel:', evt.pixel, 'mapcoords:', map.getCoordinateFromPixel(evt.pixel));
        _.each(maps, function (m) {
          MapFeaturesFactory.removeSelectedSymbol(m);
        });
        //MapEmogeosFactory.clearSelectedSpot();

        // are we in draw mode?  If so we dont want to display any popovers during draw mode
        var mapName = map.getProperties().target;
        if (!MapDrawFactory.isDrawMode(mapName)) {
          var feature = MapFeaturesFactory.getClickedFeature(map, evt);
          var layer = MapFeaturesFactory.getClickedLayer(map, evt);
          if (feature && feature.get('id') && layer && layer.get('name') !== 'geolocationLayer') {
            vm.clickedFeatureId = feature.get('id');
            //MapEmogeosFactory.setSelectedSpot(SpotFactory.getSpotById(vm.clickedFeatureId));
            if (IS_WEB) {
              MapFeaturesFactory.setSelectedSymbol(map, feature.getGeometry());
              $rootScope.$broadcast('clicked-mapped-spot', {'spotId': vm.clickedFeatureId});
            }
            else MapFeaturesFactory.showMapPopup(feature, evt);
          }
          else {
            vm.clickedFeatureId = undefined;
            //if (IS_WEB) MapEmogeosFactory.resetAllEmogeoButtons();
          }
          $scope.$apply();
        }
      });

      // Draw Map Axes
      map.on('precompose', function (event) {
        if ($state.current.name === 'app.thin-section') {
          var ctx = event.context;
          var pixelRatio = event.frameState.pixelRatio;
          var mapName = event.target.getTarget();
          var imageId = parseInt(mapName.split('map')[1]);
          var mapImage = _.find(vm.images, function (image) {
            return image.id === imageId;
          });
          ThinSectionFactory.drawAxes(ctx, pixelRatio, mapImage, mapName);

          var mapSize = map.getSize();
          var mapExtent = map.getView().calculateExtent(map.getSize());
          // $log.log(mapSize, mapExtent);
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
            var spot = SpotFactory.getSpotById(vm.clickedFeatureId);
            if (spot.properties.surface_feature &&
              spot.properties.surface_feature.surface_feature_type === 'thin_interval') {
              goToSpot(vm.clickedFeatureId, 'micro-lithologies');
            }
            else goToSpot(vm.clickedFeatureId, 'spot');
            $scope.$apply();
          }
          e.preventDefault();
        }
      }, false);
    }

    function createMapsLayout() {
      // Remove child nodes of maps element
      var mapsEle = document.getElementById('maps');
      _.times(mapsEle.childNodes.length, function () {
        mapsEle.removeChild(mapsEle.childNodes[0]);
      });

      // Calc height % for rows based on at most 2 image basemaps per row
      var numImages = vm.imagesSelected.length;
      var heightPercent = 100 / Math.ceil(numImages/2);

      // Create row and columns for image basemaps then create the maps
      var newRowEle = {};
      var selectedImages = _.filter(vm.images, function (image) {
        return _.contains(vm.imagesSelected, image.id);
      });
      _.each(selectedImages, function (image, i) {
        if (i % 2 === 0) {
          newRowEle = document.createElement('div');
          newRowEle.classList.add('row');
          newRowEle.classList.add('thin-section-layout-row');
          newRowEle.style.height = heightPercent + '%';
          mapsEle.appendChild(newRowEle);
        }
        var newColEle = document.createElement('div');
        newColEle.classList.add('col');
        newRowEle.appendChild(newColEle);
        createMapWithSelectedImage(image, newColEle);
      });
    }

    function createMapWithSelectedImage(image, colEle) {
      // Create div element for the a single image basemap
      var newMapDiv = document.createElement('div');
      var mapName = 'map' + image.id;
      newMapDiv.setAttribute('id', mapName);
      newMapDiv.classList.add('thin-section-map');
      colEle.appendChild(newMapDiv);

      // Create div element for the Save Edits button
      vm.showSaveEditsBtns[mapName] = false;
      var click = "vm.saveEdits('" + mapName + "')";
      var showSaveEditsBtn = "vm.showSaveEditsBtns['" + mapName + "']";
      var saveEditsDiv = $compile(
        "<div ng-show=" + showSaveEditsBtn + " ng-click=" + click + "></div>")($scope)[0];
      saveEditsDiv.classList.add('saveEditsMultMaps');
      saveEditsDiv.innerHTML = vm.saveEditsText;
      newMapDiv.appendChild(saveEditsDiv);

      createMap(image);
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/maps/map/add-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
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
      $rootScope.$on('updateThinSectionFeatureLayer', function () {
        $log.log('Updating Thin Section Feature Layer ...');
        updateFeatureLayers();
      });

      // Spot deleted from map side panel
      $rootScope.$on('deletedSpot', function () {
        $log.log('Handling Deleted Spot ...');
        vm.clickedFeatureId = undefined;
        updateFeatureLayers();
      });

      $scope.$on('$destroy', function () {
        $log.log('Destroying Thin Section Page ...');

        // Cancel edits for all maps
        _.each(maps, function (m) {
          MapDrawFactory.cancelEdits(m.getProperties().target);
        });

        vm.popover.remove();                       // Remove the popover
        vm.addTagModal.remove();
      });

      $scope.$on('enableSaveEdits', function (e, data, mapName) {
        $log.log('Enabling Save Edits ...');
        vm.showSaveEditsBtns[mapName] = data;
        vm.saveEditsText = 'Save Edits';
        _.defer(function () {
          $scope.$apply();
        });
      });

      $scope.$on('changedDrawMode', function (junk, mapName) {
        $log.log('Changing Draw Mode ...');
        var draw = MapDrawFactory.getDrawMode(mapName);
        var lmode = MapDrawFactory.getLassoMode();
        $log.log('LassoMode:', lmode);
        draw.on('drawend', function (e) {
          var map = e.target.getMap();
          var mapName = map.getProperties().target;
          var imageId = mapName.split('map')[1];
          var image = _.find(vm.images, function (image) {
            return image.id.toString() === imageId;
          });
          MapDrawFactory.doOnDrawEnd(e, image, vm.thisSpotWithThinSection, mapName);
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
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/maps/thin-section/thin-section-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });
    }

    // Layer switcher
    function createSwitcher(switcher, map) {
      // Add a `change:visible` listener to all layers currently within the map
      ol.control.LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
        l.on('change:visible', function (e) {
          var lyr = e.target;
          if (lyr.get('layergroup') === 'Datasets') {     // Individual Datasets
            datasetsLayerStates[lyr.get('datasetId')] = lyr.getVisible();
            updateFeatureLayer(map);
            switcher.renderPanel();
          }
          else if (lyr.get('name') === 'datasetsLayer') {  // Datasets as a Group
            lyr.getLayers().forEach(function (layer) {     // Individual Datasets
              datasetsLayerStates[layer.get('datasetId')] = lyr.getVisible();
            });
            updateFeatureLayer(map);
            switcher.renderPanel();
          }
        });
      });
    }

    function gatherImages() {
      var promises = [];
      imageSources = [];
      if (vm.thisSpotWithThinSection.properties.images) {
        _.each(vm.thisSpotWithThinSection.properties.images, function (image) {
          image.spotId = vm.thisSpotWithThinSection.properties.id;
          vm.images.push(image);
          var promise = ImageFactory.getImageById(image.id).then(function (src) {
            if (IS_WEB) imageSources[image.id] = "https://strabospot.org/pi/" + image.id;
            else if (src) imageSources[image.id] = src;
            else imageSources[image.id] = 'img/image-not-found.png';
          });
          promises.push(promise);
        });
      }

      var childrenSpots = SpotFactory.getChildrenSpots(vm.thisSpotWithThinSection);
      _.each(childrenSpots, function (spot) {
        _.each(spot.properties.images, function (image) {
          if (image.image_type === 'micrograph_ref' || image.image_type === 'micrograph') vm.images.push(image);
          var promise = ImageFactory.getImageById(image.id).then(function (src) {
            if (IS_WEB) imageSources[image.id] = "https://strabospot.org/pi/" + image.id;
            else if (src) imageSources[image.id] = src;
            else imageSources[image.id] = 'img/image-not-found.png';
          });
          promises.push(promise);
        });
      });
      $log.log('All Images:', vm.images);
      return $q.all(promises).then(function () {
        //$log.log('Image Sources:', imageSources);
      });
    }

    // Get only the Spots where the image_basemap id matches the id of one of the linked images being loaded
    function gatherSpotsOnImage(imageId) {
      var activeSpots = SpotFactory.getActiveSpots();
      var linkedImagesIds = _.union([imageId], ProjectFactory.getLinkedImages(imageId));
      var mappableSpots = _.filter(activeSpots, function (spot) {
        return _.contains(linkedImagesIds, spot.properties.image_basemap);
      });
      // Remove spots that don't have a geometry defined
      return _.reject(mappableSpots, function (spot) {
        return !_.has(spot, 'geometry');
      });
    }

    function getSpotWithThinSection() {
      // Get the Spot that has this Thin Section
      //vm.thisSpotWithThinSection = ThinSectionFactory.getSpotWithThisThinSection($state.params.thinSectionId);
      vm.thisSpotWithThinSection = SpotFactory.getSpotWithImageId($state.params.thinSectionId);
      gatherImages();
      $log.log('thisSpotWithThinSection', vm.thisSpotWithThinSection);
    }

    function isImageSelected(imageId) {
      return _.contains(vm.imagesSelected, imageId);
    }

    function setSelectedImageStyle(imageId) {
      var imageElement = document.getElementById(imageId);
      imageElement.style.height = '150px';
      imageElement.style.width = '150px';
      imageElement.style.background = 'blue';
      imageElement.style.border = '10px';
      imageElement.style.borderStyle = 'solid';
    }

    function setUnselectedImageStyle(imageId) {
      var imageElement = document.getElementById(imageId);
      imageElement.style.height = '200px';
      imageElement.style.width = '200px';
      imageElement.style.background = 'none';
      imageElement.style.border = '0px';
      imageElement.style.borderStyle = 'none';
    }

    function updateFeatureLayer(map) {
      $log.log('Updating Thin Section Feature Layer ...');
      var mapName = map.getTarget();
      var imageId = parseInt(mapName.split('map')[1]);
      var spots = gatherSpotsOnImage(imageId);
      MapFeaturesFactory.setMappableSpots(spots, mapName);
      datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map, mapName);
      MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map, mapName);
      MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, mapName);
      //MapViewFactory.zoomToSpotsExtent(map, spots);

      updateSelectedSymbol(map);
    }

    function updateFeatureLayers() {
      _.each(maps, function (map) {
        updateFeatureLayer(map);
      });
    }

    // If on WEB and we have a current feature set the selected symbol
    function updateSelectedSymbol(map) {
      var mapName = map.getTarget();
      if (IS_WEB && vm.clickedFeatureId) {
        MapFeaturesFactory.removeSelectedSymbol(map);
        var feature = MapFeaturesFactory.getFeatureById(vm.clickedFeatureId, mapName);
        if (!_.isEmpty(feature)) MapFeaturesFactory.setSelectedSymbol(map, feature.getGeometry());
      }
      else if (IS_WEB && !vm.clickedFeatureId) MapFeaturesFactory.removeSelectedSymbol(map);
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

    function getImageSrc(imageId) {
      return imageSources[imageId] || 'img/loading-image.png';
    }

    function goBack() {
      if ($ionicHistory.backView()) $ionicHistory.goBack();
      else $location.path('/app/thin-sections');
    }

    function goToSpot(id, page) {
      vm.clickedFeatureId = id;
      if (page) $location.path('/app/spotTab/' + id + '/' + page);
      else $location.path('/app/spotTab/' + id + '/spot');
    }

    function groupSpots() {
      vm.popover.hide().then(function () {
        MapDrawFactory.groupSpots();
      });
    }

    function hasRelationships(spotId) {
      return !_.isEmpty(ProjectFactory.getRelationshipsBySpotId(spotId));
    }

    function isiOS() {
      return ionic.Platform.device().platform == "iOS";
    }

    function saveEdits(mapName) {
      vm.saveEditsText = 'Saved Edits';
      MapDrawFactory.saveEdits(vm.clickedFeatureId, mapName);
    }

    function stereonetSpots() {
      vm.popover.hide().then(function () {
        MapDrawFactory.stereonetSpots();
      });
    }

    function toggleImageSelected(image) {
      if (isImageSelected(image.id)) {
        vm.imagesSelected = _.without(vm.imagesSelected, image.id);
        setUnselectedImageStyle(image.id);
        delete maps['map' + image.id];
        createMapsLayout();
      }
      else {
        vm.imagesSelected.push(image.id);
        setSelectedImageStyle(image.id);
        createMapsLayout();
      }
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

    function zoomToSpotsExtent() {
      vm.popover.hide().then(function () {
        MapViewFactory.zoomToSpotsExtent(map, spotsThisMap);
      });
    }
  }
}());
