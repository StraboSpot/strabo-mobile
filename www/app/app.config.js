'use strict';

angular
  .module('app')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('login', {
        'cache': false,
        'url': '/login',
        'templateUrl': 'app/remote-connection/login.html',
        'controller': 'LoginController'
      })

      .state('app', {
        'url': '/app',
        'abstract': true,
        'templateUrl': 'app/layout/menu.html'
      })

      .state('app.map', {
        'cache': false,
        'url': '/map',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/map.html',
            'controller': 'MapController'
          }
        }
      })

      .state('app.offlinemap', {
        'cache': false,
        'url': '/offlinemap',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/offline-map.html',
            'controller': 'OfflineMapController'
          }
        }
      })

      .state('app.search', {
        'url': '/search',
        'views': {
          'menuContent': {
            'templateUrl': 'app/layout/search.html'
          }
        }
      })

      .state('app.settings', {
        'cache': false,
        'url': '/settings',
        'views': {
          'menuContent': {
            'templateUrl': 'app/settings/settings.html',
            'controller': 'SettingsController'
          }
        }
      })

      .state('app.image-maps', {
        'cache': false,
        'url': '/image-maps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/image-maps.html',
            'controller': 'ImageMapsController'
          }
        }
      })

      .state('app.image-map', {
        'cache': false,
        'url': '/image-maps/:imagemapId',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/image-map.html',
            'controller': 'ImageMapController'
          }
        }
      })

      .state('app.spots', {
        'cache': false,
        'url': '/spots',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spots/spots.html',
            'controller': 'SpotsController'
          }
        }
      })

      // setup an abstract state for the spot tabs directive
      .state('spotTab', {
        'url': '/spotTab',
        'abstract': true,
        'templateUrl': 'app/spot/abstract-spot.html',
        'controller': 'SpotController'
      })

      .state('spotTab.custom', {
        'cache': false,
        'url': '/:spotId/custom',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/custom-tab.html',
            'controller': 'SpotTabCustomController'
          }
        }
      })
      .state('spotTab.details', {
        'cache': false,
        'url': '/:spotId/details',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/details-tab.html',
            'controller': 'SpotTabDetailController'
          }
        }
      })
      .state('spotTab.georeference', {
        'cache': false,
        'url': '/:spotId/georeference',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/georeference-tab.html',
            'controller': 'SpotTabGeoreferenceController'
          }
        }
      })
      .state('spotTab.groupmembers', {
        'cache': false,
        'url': '/:spotId/groupmembers',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/groupmembers-tab.html',
            'controller': 'SpotTabGroupmembersController'
          }
        }
      })
      .state('spotTab.groups', {
        'cache': false,
        'url': '/:spotId/groups',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/groups-tab.html',
            'controller': 'SpotTabGroupsController'
          }
        }
      })
      .state('spotTab.images', {
        'cache': false,
        'url': '/:spotId/images',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/images-tab.html',
            'controller': 'SpotTabImagesController'
          }
        }
      })
      .state('spotTab.links', {
        'cache': false,
        'url': '/:spotId/links',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/links-tab.html',
            'controller': 'SpotTabLinksController'
          }
        }
      })
      .state('spotTab.notes', {
        'cache': false,
        'url': '/:spotId/notes',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/notes-tab.html',
            'controller': 'SpotTabNotesController'
          }
        }
      })
      .state('spotTab.rockdescription', {
        'cache': false,
        'url': '/:spotId/rockdescription',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/rockdescription-tab.html',
            'controller': 'SpotTabRockdescriptionController'
          }
        }
      })
      .state('spotTab.rocksample', {
        'cache': false,
        'url': '/:spotId/rocksample',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/rocksample-tab.html',
            'controller': 'SpotTabRocksampleController'
          }
        }
      })

      .state('app.archiveTiles', {
        'url': '/map/archiveTiles',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/archive-tiles.html',
            'controller': 'ArchiveTilesController'
          }
        }
      })

      .state('app.debug', {
        'url': '/debug',
        'views': {
          'menuContent': {
            'templateUrl': 'app/debug/debug.html',
            'controller': 'DebugController'
          }
        }
      })

      .state('app.about', {
        'url': '/about',
        'views': {
          'menuContent': {
            'templateUrl': 'app/layout/about.html'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });
