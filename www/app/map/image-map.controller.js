(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImageMapController', ImageMapController);

  ImageMapController.$inject = ['$ionicActionSheet', '$ionicSideMenuDelegate', '$log', '$state', 'DrawFactory',
    'ImageMapService', 'MapFeaturesFactory', 'MapSetupFactory', 'MapViewFactory'];

  function ImageMapController($ionicActionSheet, $ionicSideMenuDelegate, $log, $state, DrawFactory, ImageMapService,
                              MapFeaturesFactory, MapSetupFactory, MapViewFactory) {
    var vm = this;
    vm.goToImageMaps = goToImageMaps;
    vm.imageMap = ImageMapService.getCurrentImageMap();
    vm.showActionsheet = showActionsheet;

    var map;

    activate();

    function activate() {
      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      MapSetupFactory.setImageMap(vm.imageMap);
      MapSetupFactory.setInitialMapView();
      MapSetupFactory.setMap();
      MapSetupFactory.setLayers();
      MapSetupFactory.setMapControls();
      MapSetupFactory.setPopupOverlay();

      map = MapSetupFactory.getMap();

      MapFeaturesFactory.createFeatureLayer(map, vm.imageMap);

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
        if (!DrawFactory.isDrawMode()) {
          MapFeaturesFactory.showPopup(map, evt);
        }
      });
    }

    function goToImageMaps() {
      $state.go('app.image-maps');
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
              MapViewFactory.zoomToSpotsExtent(map, vm.imageMap);
              break;
            case 1:
              DrawFactory.groupSpots();
              break;
          }
          return true;
        }
      });
    }
  }
}());
