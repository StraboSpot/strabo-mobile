angular
  .module('app', [
    'ionic',
    'ngCordova',
    'ngMessages'
  ])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    // localforage is the global for offline map tiles
    localforage.config({
      // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
      'name': 'offlineMapTiles'
    });

    // global LF for map names
    mapNamesDb = localforage.createInstance({
      // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
      'name': 'MapNames'
    });

    // global LF for spot data
    spotsDb = localforage.createInstance({
      // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
      'name': 'Spots'
    });

    // global LF for configuration data
    configDb = localforage.createInstance({
      // driver: localforage.WEBSQL,  // removing the driver lets localforage choose the best driver available to that platform
      'name': 'Config'
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('login', {
        'cache': false,
        'url': '/login',
        'templateUrl': 'templates/login.html',
        'controller': 'LoginController'
      })

      .state('app', {
        'url': '/app',
        'abstract': true,
        'templateUrl': 'templates/menu.html'
      })

      .state('app.map', {
        'cache': false,
        'url': '/map',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/map.html',
            'controller': 'MapController'
          }
        }
      })

      .state('app.offlinemap', {
        'cache': false,
        'url': '/offlinemap',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/offlinemap.html',
            'controller': 'OfflineMapController'
          }
        }
      })

      .state('app.search', {
        'url': '/search',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/search.html'
          }
        }
      })

      .state('app.settings', {
        'cache': false,
        'url': '/settings',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/settings.html',
            'controller': 'SettingsController'
          }
        }
      })

      .state('app.image-maps', {
        'cache': false,
        'url': '/image-maps',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/image-maps.html',
            'controller': 'ImageMapsController'
          }
        }
      })

      .state('app.image-map', {
        'cache': false,
        'url': '/image-maps/:imagemapId',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/image-map.html',
            'controller': 'ImageMapController'
          }
        }
      })

      .state('app.spots', {
        'cache': false,
        'url': '/spots',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/spots.html',
            'controller': 'SpotsController'
          }
        }
      })

      // setup an abstract state for the spot tabs directive
      .state('spotTab', {
        'url': '/spotTab',
        'abstract': true,
        'templateUrl': 'templates/spot.html',
        'controller': 'SpotController'
      })

      .state('spotTab.details', {
        'cache': false,
        'url': '/:spotId/details',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/details.html',
            'controller': 'SpotTabDetailController'
          }
        }
      })

      .state('spotTab.notes', {
        'cache': false,
        'url': '/:spotId/notes',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/notes.html',
            'controller': 'SpotTabNotesController'
          }
        }
      })

      .state('spotTab.photos', {
        'cache': false,
        'url': '/:spotId/photos',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/pictures.html',
            'controller': 'SpotTabPhotosController'
          }
        }
      })

      .state('spotTab.georeference', {
        'cache': false,
        'url': '/:spotId/georeference',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/georeference.html',
            'controller': 'SpotTabGeoreferenceController'
          }
        }
      })

      .state('spotTab.links', {
        'cache': false,
        'url': '/:spotId/links',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/links.html',
            'controller': 'SpotTabLinksController'
          }
        }
      })

      .state('spotTab.groups', {
        'cache': false,
        'url': '/:spotId/groups',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/groups.html',
            'controller': 'SpotTabGroupsController'
          }
        }
      })

      .state('spotTab.groupmembers', {
        'cache': false,
        'url': '/:spotId/groupmembers',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/groupmembers.html',
            'controller': 'SpotTabGroupmembersController'
          }
        }
      })

      .state('spotTab.rockdescription', {
        'cache': false,
        'url': '/:spotId/rockdescription',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/rockdescription.html',
            'controller': 'SpotTabRockdescriptionController'
          }
        }
      })

      .state('spotTab.rocksample', {
        'cache': false,
        'url': '/:spotId/rocksample',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/rocksample.html',
            'controller': 'SpotTabRocksampleController'
          }
        }
      })

      .state('spotTab.custom', {
        'cache': false,
        'url': '/:spotId/custom',
        'views': {
          'spottab-childview': {
            'templateUrl': 'templates/tabs/custom.html',
            'controller': 'SpotTabCustomController'
          }
        }
      })

      .state('app.archiveTiles', {
        'url': '/map/archiveTiles',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/archiveTiles.html',
            'controller': 'ArchiveTilesController'
          }
        }
      })

      .state('app.debug', {
        'url': '/debug',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/debug.html',
            'controller': 'DebugController'
          }
        }
      })

      .state('app.about', {
        'url': '/about',
        'views': {
          'menuContent': {
            'templateUrl': 'templates/about.html'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });
