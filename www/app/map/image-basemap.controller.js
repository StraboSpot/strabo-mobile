(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapController', ImageBasemapController);

  ImageBasemapController.$inject = ['$ionicActionSheet', '$ionicSideMenuDelegate', '$location', '$log', '$state',
    'MapDrawFactory', 'MapFeaturesFactory', 'MapSetupFactory', 'MapViewFactory', 'SpotFactory'];

  function ImageBasemapController($ionicActionSheet, $ionicSideMenuDelegate, $location, $log, $state, MapDrawFactory,
                                  MapFeaturesFactory, MapSetupFactory, MapViewFactory,
                                  SpotFactory) {
    var vm = this;

    vm.goBack = goBack;
    vm.imageBasemap = {};
    vm.showActionsheet = showActionsheet;

    var map;

    /**
     * Private Functions
     */

    activate();

    function activate() {
      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      setImageBasemap();
      MapSetupFactory.setImageBasemap(vm.imageBasemap);
      MapSetupFactory.setInitialMapView();
      MapSetupFactory.setMap();
      MapSetupFactory.setLayers();
      MapSetupFactory.setMapControls();
      MapSetupFactory.setPopupOverlay();

      map = MapSetupFactory.getMap();
      MapFeaturesFactory.createFeatureLayer(map, vm.imageBasemap);

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
    }

    function setImageBasemap() {
      _.each(SpotFactory.getSpots(), function (spot) {
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

    function showActionsheet() {
      $ionicActionSheet.show({
        'titleText': 'Map Actions',
        'buttons': [{
          'text': '<i class="icon ion-map"></i> Zoom to Extent of Spots'
        }, {
          'text': '<i class="icon ion-grid"></i> Add Features to a New Station'
        }],
        'cancelText': 'Cancel',
        'cancel': function () {
          $log.log('CANCELLED');
        },
        'buttonClicked': function (index) {
          $log.log('BUTTON CLICKED', index);
          switch (index) {
            case 0:
              MapViewFactory.zoomToSpotsExtent(map, vm.imageBasemap);
              break;
            case 1:
              MapDrawFactory.groupSpots();
              break;
          }
          return true;
        }
      });
    }
  }
}());
