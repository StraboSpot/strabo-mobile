(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageBasemapController', ImageBasemapController);

  ImageBasemapController.$inject = ['$ionicActionSheet', '$ionicSideMenuDelegate', '$log', '$state', 'MapDrawFactory',
    'ImageBasemapFactory', 'MapFeaturesFactory', 'MapSetupFactory', 'MapViewFactory'];

  function ImageBasemapController($ionicActionSheet, $ionicSideMenuDelegate, $log, $state, MapDrawFactory, ImageBasemapFactory,
                                  MapFeaturesFactory, MapSetupFactory, MapViewFactory) {
    var vm = this;

    vm.goToImageBasemaps = goToImageBasemaps;
    vm.imageBasemap = ImageBasemapFactory.getCurrentImageBasemap();
    vm.showActionsheet = showActionsheet;

    var map;

    activate();

    function activate() {
      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

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

    function goToImageBasemaps() {
      $state.go('app.image-basemaps');
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
