(function () {
  'use strict';

  angular
    .module('app')
    .controller('MapController', MapController);

  MapController.$inject = ['$ionicActionSheet', '$ionicPopup', '$ionicSideMenuDelegate', '$location', '$log', '$scope',
    'DrawFactory', 'MapFeaturesFactory', 'MapLayerFactory', 'MapSetupFactory', 'MapViewFactory', 'OfflineTilesFactory'];

  function MapController($ionicActionSheet, $ionicPopup, $ionicSideMenuDelegate, $location, $log, $scope, DrawFactory,
                         MapFeaturesFactory, MapLayerFactory, MapSetupFactory, MapViewFactory, OfflineTilesFactory) {
    var vm = this;
    vm.cacheOfflineTiles = cacheOfflineTiles;
    vm.isOnline = isOnline;
    vm.showActionsheet = showActionsheet;
    vm.toggleLocation = toggleLocation;

    var map;

    activate();

    function activate() {
      // Disable dragging back to ionic side menu because this affects drawing tools
      $ionicSideMenuDelegate.canDragContent(false);

      MapSetupFactory.setImageMap(null);
      MapSetupFactory.setInitialMapView();
      MapSetupFactory.setMap();
      MapSetupFactory.setLayers();
      MapSetupFactory.setMapControls();
      MapSetupFactory.setPopupOverlay();

      map = MapSetupFactory.getMap();

      getMapView();
      MapFeaturesFactory.createFeatureLayer(map);

      // When the map is moved save the new view and update the zoom control
      map.on('moveend', function (evt) {
        MapViewFactory.setMapView(map.getView());
        vm.currentZoom = evt.map.getView().getZoom();
      });

      map.on('touchstart', function (event) {
        $log.log('touch');
        $log.log(event);
      });

      // Display popup on click
      map.on('click', function (evt) {
        $log.log('map clicked');

        // Are we in draw mode?  If so we don't want to display any popovers during draw mode
        if (!DrawFactory.isDrawMode()) {
          MapFeaturesFactory.showPopup(map, evt);
        }
      });

      // Watch whether we have internet access or not
      $scope.$watch('vm.isOnline()', function (online) {
        MapLayerFactory.setVisibleLayers(map, online);
      });
    }

    /**
     *  Private Functions
     */

    // If there is a Map View set then reset the map to that view,
    // otherwise zoom to the extent of the spots
    function getMapView() {
      if (MapViewFactory.getMapView()) {
        $log.log('A mapview is set, changing map view to that');
        map.setView(MapViewFactory.getMapView());
      }
      else {
        MapViewFactory.zoomToSpotsExtent(map);
      }
    }

    /**
     *  Public Functions
     */

    // Cache the tiles in the current view but don't switch to the offline layer
    function cacheOfflineTiles() {
      if (navigator.onLine) {
        // Get the map extent
        var mapViewExtent = MapViewFactory.getMapViewExtent(map);

        // set the extent into the MapViewFactory
        MapViewFactory.setExtent(MapLayerFactory.getCurrentVisibleLayer(map), mapViewExtent.topRight,
          mapViewExtent.bottomLeft,
          mapViewExtent.zoom);

        // we set the current map provider so if we ever come back, we should try to use that map provider instead of the default provider
        OfflineTilesFactory.setCurrentMapProvider(MapLayerFactory.getCurrentVisibleLayer(map));

        $location.path('/app/map/archiveTiles');
      }
      else {
        $ionicPopup.alert({
          'title': 'Offline!',
          'template': 'You must be online to save a map!'
        });
      }
    }

    function isOnline() {
      return navigator.onLine;
    }

    function showActionsheet() {
      $ionicActionSheet.show({
        'titleText': 'Map Actions',
        'buttons': [{
          'text': '<i class="icon ion-map"></i> Zoom to Extent of Spots'
        }, {
          'text': '<i class="icon ion-archive"></i>Save Map for Offline Use'
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
              MapViewFactory.zoomToSpotsExtent(map);
              break;
            case 1:
              vm.cacheOfflineTiles();
              break;
            case 2:
              DrawFactory.groupSpots();
              break;
          }
          return true;
        }
      });
    }

    // Get current position
    function toggleLocation() {
      vm.locationOn = angular.isUndefined(vm.locationOn) || vm.locationOn === false;
      MapViewFactory.getCurrentLocation(map, vm.locationOn);
    }
  }
}());
