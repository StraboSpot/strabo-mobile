(function () {
  'use strict';

  angular
    .module('app')
    .config(config);

  function config($ionicConfigProvider, $urlRouterProvider, $stateProvider) {
    // Align title text in nav bar in ion-view directive to left side
    $ionicConfigProvider.navBar.alignTitle('left');

    // Set up states
    $stateProvider
      .state('login', {
        'cache': false,
        'url': '/login',
        'templateUrl': 'app/remote-connection/login.html',
        'controller': 'LoginController as vm'
      })
      .state('app', {
        'url': '/app',
        'abstract': true,
        'templateUrl': 'app/menu/menu.html',
        'controller': 'MenuController as vm',
        'resolve': {
          'prepProjectFactory': prepProjectFactory,
          'prepUserFactory': prepUserFactory
        }
      })
      .state('app.project', {
        'cache': false,
        'url': '/project',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/project.html',
            'controller': 'ProjectController as vm'
          }
        }
      })
      .state('app.tools', {
        'cache': false,
        'url': '/tools',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/tools.html'/* ,
             'controller': 'ToolsController as vm'*/
          }
        }
      })
      .state('app.user', {
        'cache': false,
        'url': '/user',
        'views': {
          'menuContent': {
            'templateUrl': 'app/user/user.html',
            'controller': 'UserController as vm'
          }
        }
      })
      .state('app.map', {
        'cache': false,
        'url': '/map',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/map.html',
            'controller': 'MapController as vm'
          }
        }
      })
      .state('app.offlinemap', {
        'cache': false,
        'url': '/offlinemap',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/offline-map.html',
            'controller': 'OfflineMapController as vm'
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
      .state('app.preferences', {
        'cache': false,
        'url': '/preferences',
        'views': {
          'menuContent': {
            'templateUrl': 'app/config/preferences.html',
            'controller': 'PreferencesController as vm'
          }
        },
        'resolve': {
          'prepPreferencesFactory': prepPreferencesFactory
        }
      })
      .state('app.image-maps', {
        'cache': false,
        'url': '/image-maps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/image-maps.html',
            'controller': 'ImageMapsController as vm'
          }
        }
      })
      .state('app.image-map', {
        'cache': false,
        'url': '/image-maps/:imagemapId',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/image-map.html',
            'controller': 'ImageMapController as vm'
          }
        }
      })
      .state('app.spots', {
        'cache': false,
        'url': '/spots',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spots/spots.html',
            'controller': 'SpotsController as vm'
          }
        }
      })
      // setup an abstract state for the spot tabs directive
      .state('spotTab', {
        'url': '/spotTab',
        'abstract': true,
        'templateUrl': 'app/spot/spot.html',
        'controller': 'SpotController as vm'
      })
      .state('spotTab.custom', {
        'cache': false,
        'url': '/:spotId/custom',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/custom-tab.html',
            'controller': 'SpotTabCustomController as vmChild'
          }
        }
      })
      .state('spotTab.orientation', {
        'cache': false,
        'url': '/:spotId/orientation',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/orientation-tab.html',
            'controller': 'OrientationTabController as vmChild'
          }
        }
      })
      .state('spotTab.georeference', {
        'cache': false,
        'url': '/:spotId/georeference',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/georeference-tab.html',
            'controller': 'SpotTabGeoreferenceController as vmChild'
          }
        }
      })
      .state('spotTab.groupmembers', {
        'cache': false,
        'url': '/:spotId/groupmembers',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/groupmembers-tab.html',
            'controller': 'SpotTabGroupmembersController as vmChild'
          }
        }
      })
      .state('spotTab.groups', {
        'cache': false,
        'url': '/:spotId/groups',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/groups-tab.html',
            'controller': 'SpotTabGroupsController as vmChild'
          }
        }
      })
      .state('spotTab.images', {
        'cache': false,
        'url': '/:spotId/images',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/images-tab.html',
            'controller': 'SpotTabImagesController as vmChild'
          }
        }
      })
      .state('spotTab.links', {
        'cache': false,
        'url': '/:spotId/links',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/links-tab.html',
            'controller': 'SpotTabLinksController as vmChild'
          }
        }
      })
      .state('spotTab.spot', {
        'cache': false,
        'url': '/:spotId/spot',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/spot-tab.html',
            'controller': 'SpotTabController as vmChild'
          }
        }
      })
      .state('spotTab.rockdescription', {
        'cache': false,
        'url': '/:spotId/rockdescription',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/rockdescription-tab.html',
            'controller': 'SpotTabRockdescriptionController as vmChild'
          }
        }
      })
      .state('spotTab.sample', {
        'cache': false,
        'url': '/:spotId/sample',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/sample-tab.html',
            'controller': 'SampleTabController as vmChild'
          }
        }
      })
      .state('app.archiveTiles', {
        'url': '/map/archiveTiles',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/archive-tiles.html',
            'controller': 'ArchiveTilesController as vm'
          }
        }
      })
      .state('app.debug', {
        'url': '/debug',
        'views': {
          'menuContent': {
            'templateUrl': 'app/debug/debug.html',
            'controller': 'DebugController as vm'
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
  }

  function prepPreferencesFactory(PreferencesFactory) {
    return PreferencesFactory.loadPreferences();
  }

  function prepProjectFactory(ProjectFactory) {
    return ProjectFactory.loadProject();
  }

  function prepUserFactory(UserFactory) {
    return UserFactory.loadUser();
  }
}());
