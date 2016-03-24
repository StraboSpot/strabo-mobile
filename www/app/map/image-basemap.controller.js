(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapController', ImageBasemapController);

  ImageBasemapController.$inject = ['$ionicPopover', '$ionicSideMenuDelegate', '$location', '$log', '$scope',
    '$state', 'MapDrawFactory', 'MapFeaturesFactory', 'MapSetupFactory', 'MapViewFactory', 'SpotFactory'];

  function ImageBasemapController($ionicPopover, $ionicSideMenuDelegate, $location, $log, $scope, $state,
                                  MapDrawFactory, MapFeaturesFactory, MapSetupFactory, MapViewFactory, SpotFactory) {
    var vm = this;

    vm.goBack = goBack;
    vm.groupSpots = groupSpots;
    vm.imageBasemap = {};
    vm.zoomToSpotsExtent = zoomToSpotsExtent;

    var map;

    /**
     * Private Functions
     */

    activate();

    function activate() {
      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      createPopover();
      var switcher = new ol.control.LayerSwitcher();

      setImageBasemap();
      MapSetupFactory.setImageBasemap(vm.imageBasemap);
      MapSetupFactory.setInitialMapView();
      MapSetupFactory.setMap();
      MapSetupFactory.setLayers();
      MapSetupFactory.setMapControls(switcher);
      MapSetupFactory.setPopupOverlay();

      map = MapSetupFactory.getMap();
      var datasetsLayerStates = MapFeaturesFactory.getInitialDatasetLayerStates(map, vm.imageBasemap);
      MapFeaturesFactory.createDatasetsLayer(datasetsLayerStates, map, vm.imageBasemap);
      MapFeaturesFactory.createFeatureLayer(datasetsLayerStates, map, vm.imageBasemap);

      // When the map is moved update the zoom control
      map.on('moveend', function (evt) {
        vm.currentZoom = evt.map.getView().getZoom();
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
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
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/map/image-basemap-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      // Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        vm.popover.remove();
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

    function goBack() {
      var currentSpot = SpotFactory.getCurrentSpot();
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
      MapDrawFactory.groupSpots($scope);
    }

    function zoomToSpotsExtent() {
      vm.popover.hide();
      MapViewFactory.zoomToSpotsExtent(map, vm.imageBasemap);
    }
  }
}());
