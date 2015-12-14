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
        'templateUrl': 'app/user/login.html',
        'controller': 'LoginController as vm',
        'resolve': {
          'prepUserFactory': prepUserFactory
        }
      })
      .state('app', {
        'url': '/app',
        'abstract': true,
        'templateUrl': 'app/menu/menu.html',
        'controller': 'MenuController as vm',
        'resolve': {
          'prepPreferencesFactory': prepPreferencesFactory,
          'prepProjectFactory': prepProjectFactory,
          'prepUserFactory': prepUserFactory,
          'prepSpotFactory': prepSpotFactory
        }
      })
      .state('app.projects', {
        'cache': false,
        'url': '/projects',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/projects.html',
            'controller': 'ProjectsController as vm'
          }
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
      .state('app.new-project', {
        'cache': false,
        'url': '/new-project',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/project.html',
            'controller': 'ProjectController as vm'
          }
        }
      })
      .state('app.daily-setup', {
        'cache': false,
        'url': '/daily-setup',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/daily-setup.html'
          }
        }
      })
      .state('app.rock-units', {
        'cache': false,
        'url': '/rock-units',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/rock-units.html',
            'controller': 'RockUnitsController as vm'
          }
        }
      })
      .state('app.rock-unit', {
        'cache': false,
        'url': '/rock-units/:unit_label_abbreviation',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/rock-unit.html',
            'controller': 'RockUnitController as vm'
          }
        }
      })
      .state('app.new-rock-unit', {
        'cache': false,
        'url': '/rock-units/new-rock-unit',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/rock-unit.html',
            'controller': 'RockUnitController as vm'
          }
        }
      })
      .state('app.tools', {
        'cache': false,
        'url': '/tools',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/tools.html',
            'controller': 'ToolsController as vm'
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
      .state('app.preferences', {
        'cache': false,
        'url': '/preferences',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/preferences.html',
            'controller': 'PreferencesController as vm'
          }
        }
      })
      .state('app.image-basemaps', {
        'cache': false,
        'url': '/image-basemaps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/image-basemaps.html',
            'controller': 'ImageBasemapsController as vm'
          }
        }
      })
      .state('app.image-basemap', {
        'cache': false,
        'url': '/image-basemaps/:imagebasemapId',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/image-basemap.html',
            'controller': 'ImageBasemapController as vm'
          }
        }
      })
      .state('app.spots', {
        'cache': false,
        'url': '/spots',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spot/spots.html',
            'controller': 'SpotsController as vm'
          }
        }
      })
      // setup an abstract state for the spot tabs directive
      .state('spotTab', {
        'url': '/spotTab',
        'abstract': true,
        'templateUrl': 'app/spot/spot.html',
        'controller': 'SpotController as vm',
        'resolve': {
          'prepSpotFactory': prepSpotFactory,
          'prepSpotForms': prepSpotForms
        }
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
      .state('spotTab.orientation-old', {
        'cache': false,
        'url': '/:spotId/orientation-old',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/orientation-old-tab.html',
            'controller': 'OrientationOldTabController as vmChild'
          }
        }
      })
      .state('spotTab.orientation-data', {
        'cache': false,
        'url': '/:spotId/orientation-data',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/orientation-data-tab.html',
            'controller': 'OrientationDataTabController as vmChild'
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
            'controller': 'ImagesTabController as vmChild'
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
      .state('spotTab._3dstructures', {
        'cache': false,
        'url': '/:spotId/_3dstructures',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/3dstructures-tab.html',
            'controller': '_3DStructuresTabController as vmChild'
          }
        }
      })
      .state('app.orientation', {
        'cache': false,
        'url': '/orientation',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spot/orientation.html',
            'controller': 'OrientationController as vm'
          }
        }
      })
      .state('app.new-linear-orientation', {
        'cache': false,
        'url': '/new-linear-orientation',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spot/orientation.html',
            'controller': 'OrientationController as vm'
          }
        }
      })
      .state('app.new-planar-orientation', {
        'cache': false,
        'url': '/new-planar-orientation',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spot/orientation.html',
            'controller': 'OrientationController as vm'
          }
        }
      })
      .state('app.new-tabular-zone-orientation', {
        'cache': false,
        'url': '/new-tabular-zone-orientation',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spot/orientation.html',
            'controller': 'OrientationController as vm'
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

  function prepSpotFactory(SpotFactory) {
    return SpotFactory.loadSpots();
  }

  function prepSpotForms(SpotFormsFactory) {
    return SpotFormsFactory.loadTracesForm();
  }

  function prepUserFactory(UserFactory) {
    return UserFactory.loadUser();
  }
}());
