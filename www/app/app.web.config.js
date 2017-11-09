(function () {
  'use strict';

  angular
    .module('app')
    .config(config);

  function config($urlRouterProvider, $stateProvider) {
    // Declare Login and Main Menu States and Dashboard State for WEB
    $stateProvider
    /* .state('login', {
     'cache': false,
     'url': '/login',
     'templateUrl': 'app/login/login.html',
     'controller': 'LoginController as vm',
     'resolve': {
     'prepLogin': prepLogin
     }
     })*/
      .state('app', {
        'url': '/app',
        'abstract': true,
        'templateUrl': 'app/menu/menu.web.html',
        'controller': 'MenuController as vm',
        'resolve': {
          'prepMenu': prepMenu
        }
      })
      .state('app.dashboard', {
        'cache': false,
        'url': '/dashboard',
        'views': {
          'menuContent': {
            'templateUrl': 'app/dashboard/dashboard.web.html',
            'controller': 'DashboardController'
          }
        }
      });

    // Declare Main Menu Content States
    var mainStates = [
      {'state': 'about', 'url': 'about', 'template': 'about/about', 'controller': 'About'},
      //{'state': 'archiveTiles', 'url': 'map/archiveTiles', 'template': 'maps/offline-maps/archive-tiles', 'controller': 'ArchiveTiles'},
      {'state': 'description', 'url': 'description', 'template': 'project/description/description', 'controller': 'Description'},
      {'state': 'image-basemap', 'url': 'image-basemaps/:imagebasemapId', 'template': 'maps/image-basemap/image-basemap', 'controller': 'ImageBasemap'},
      {'state': 'image-basemaps', 'url': 'image-basemaps', 'template': 'maps/image-basemaps/image-basemaps', 'controller': 'ImageBasemaps'},
      {'state': 'images', 'url': 'images', 'template': 'attributes/images/images', 'controller': 'Images'},
      {'state': 'manage-project', 'url': 'manage-project', 'template': 'project/manage/manage-project', 'controller': 'ManageProject'},
      {'state': 'map', 'url': 'map', 'template': 'maps/map/map', 'controller': 'Map'},
      {'state': 'misc', 'url': 'misc', 'template': 'misc/misc', 'controller': 'Misc'},
      //{'state': 'offlinemap', 'url': 'offlinemap', 'template': 'maps/offline-maps/offline-map', 'controller': 'OfflineMap'},
      {'state': 'other-maps', 'url': 'other-maps', 'template': 'maps/other-maps/other-maps', 'controller': 'OtherMaps'},
      {'state': 'preferences', 'url': 'preferences', 'template': 'project/preferences/preferences', 'controller': 'Preferences'},
      {'state': 'relationship', 'url': 'relationships/:relationship_id', 'template': 'relationship/relationship', 'controller': 'Relationship'},
      {'state': 'relationships', 'url': 'relationships', 'template': 'relationships/relationships', 'controller': 'Relationships'},
      {'state': 'samples', 'url': 'samples', 'template': 'attributes/samples/samples', 'controller': 'Samples'},
      //{'state': 'spots', 'url': 'spots', 'template': 'spots/spots', 'controller': 'Spots'},
      {'state': 'tag', 'url': 'tags/:tag_id', 'template': 'tag/tag', 'controller': 'Tag'},
      {'state': 'tags', 'url': 'tags', 'template': 'tags/tags', 'controller': 'Tags'},
      {'state': 'tools', 'url': 'tools', 'template': 'project/tools/tools', 'controller': 'Tools'},
      {'state': 'user', 'url': 'user', 'template': 'user/user', 'controller': 'User'},
      // For WEB only
      {'state': 'login', 'url': 'login', 'template': 'login/login', 'controller': 'Login'}
    ];
    _.each(mainStates, function (mainState) {
      $stateProvider.state('app.' + mainState.state, {
        'cache': false,
        'url': '/' + mainState.url,
        'views': {
          'menuContent': {
            'templateUrl': 'app/' + mainState.template + '.web.html',   // Added .web for WEB
            'controller': mainState.controller + 'Controller as vm'
          }
        }
      });
    });

    // Declare Spot Tab State
    $stateProvider.state('app.spotTab', {
        'cache': false,
        'url': '/spotTab',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spots/spots.web.html',
            'controller': 'SpotsController as vm'
          },
          'spot-data@app.spotTab': {
            'templateUrl': 'app/spot/spot/spot.web.html',
            'controller': 'SpotController as vm'
          }
        },
        'onExit': function ($log, SpotFactory) {
          if (!SpotFactory.getKeepSpotSelected()) {
            $log.log('Exiting Spots State. Clearing current Spot ...');
            SpotFactory.clearCurrentSpot();
          }
          else SpotFactory.setKeepSpotSelected(false);
        }
      });

    // Declare Spot Tab Childview States
    var spotTabStates = [
      {'state': '_3dstructures', 'template': '3d-structures/3dstructures-tab', 'controller': '_3DStructures'},
      {'state': 'images', 'template': 'images/images-tab', 'controller': 'Images'},
      {'state': 'nesting', 'template': 'nesting/nesting-tab', 'controller': 'Nesting'},
      {'state': 'orientations', 'template': 'orientations/orientations-tab', 'controller': 'Orientations'},
      {'state': 'other-features', 'template': 'other-features/other-features-tab', 'controller': 'OtherFeatures'},
      {'state': 'relationships', 'template': 'relationships/relationships-tab', 'controller': 'Relationships'},
      {'state': 'samples', 'template': 'samples/samples-tab', 'controller': 'Samples'},
      {'state': 'spot', 'template': 'spot-tab/spot-tab', 'controller': 'Spot'},
      {'state': 'tags', 'template': 'tags/tags-tab', 'controller': 'Tags'}
    ];
    _.each(spotTabStates, function (spotTabState) {
      $stateProvider.state('app.spotTab.' + spotTabState.state, {
        'cache': false,
        'url': '/:spotId/' + spotTabState.state,
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/' + spotTabState.template + '.web.html',   // Added .web for WEB
            'controller': spotTabState.controller + 'TabController as vmChild'
          }
        }
      });
    });

    // If none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/map');
  }

  /*
   function prepLogin(LocalStorageFactory, UserFactory) {
   return LocalStorageFactory.setupLocalforage().then(function () {
   return UserFactory.loadUser();
   });
   }
   */
  function prepMenu($ionicLoading, LocalStorageFactory, DataModelsFactory, ProjectFactory, RemoteServerFactory, SpotFactory,
                    UserFactory, OtherMapsFactory, AutoLoginFactory) {
    $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loading Data Models...'});
    return DataModelsFactory.loadDataModels().then(function () {
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loading Database...'});
      return LocalStorageFactory.setupLocalforage().then(function () {
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loading User...'});
        return AutoLoginFactory.autoLogin().then(function () {
          $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loaded User<br>Loading Project...'});
          return UserFactory.loadUser().then(function () {
            $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Automatically logged in...'});
            return ProjectFactory.prepProject().then(function () {
              $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loaded User<br>Loaded Project<br>Loading Spots...'});
              return SpotFactory.loadSpots().then(function () {
                $ionicLoading.hide();
                return RemoteServerFactory.loadDbUrl().then(function () {
                  return OtherMapsFactory.loadOtherMaps();
                });
              });
            });
          });
        });
      });
    });
  }
}());
