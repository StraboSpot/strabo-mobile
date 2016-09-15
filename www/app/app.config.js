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
          'prepLogin': prepLogin
        }
      })
      .state('app', {
        'url': '/app',
        'abstract': true,
        'templateUrl': 'app/menu/menu.html',
        'controller': 'MenuController as vm',
        'resolve': {
          'prepMenu': prepMenu
        }
      })
      .state('app.description', {
        'cache': false,
        'url': '/description',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/description.html',
            'controller': 'DescriptionController as vm'
          }
        }
      })
      .state('app.manage-project', {
        'cache': false,
        'url': '/manage-project',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/manage-project.html',
            'controller': 'ManageProjectController as vm'
          }
        }
      })
      .state('app.relationships', {
        'cache': false,
        'url': '/relationships',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tag-relationship/relationships.html',
            'controller': 'RelationshipsController as vm'
          }
        }
      })
      .state('app.relationship', {
        'cache': false,
        'url': '/relationships/:relationship_id',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tag-relationship/relationship.html',
            'controller': 'RelationshipController as vm'
          }
        }
      })
      .state('app.tags', {
        'cache': false,
        'url': '/tags',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tag-relationship/tags.html',
            'controller': 'TagsController as vm'
          }
        }
      })
      .state('app.tag', {
        'cache': false,
        'url': '/tags/:tag_id',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tag-relationship/tag.html',
            'controller': 'TagController as vm'
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
      .state('app.other-maps', {
        'cache': false,
        'url': '/other-maps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/other-maps.html',
            'controller': 'OtherMapsController as vm'
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
      .state('app.spotTab', {
        'url': '/spotTab',
        'abstract': true,
        'views': {
          'menuContent': {
            'templateUrl': 'app/spot/spot.html',
            'controller': 'SpotController as vm'
          }
        }
      })
      .state('app.spotTab.orientation-data', {
        'cache': false,
        'url': '/:spotId/orientation-data',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/orientation-data-tab.html',
            'controller': 'OrientationDataTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.images', {
        'cache': false,
        'url': '/:spotId/images',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/images-tab.html',
            'controller': 'ImagesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.inferences', {
        'cache': false,
        'url': '/:spotId/inferences',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/inferences-tab.html',
            'controller': 'InferencesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.nest', {
        'cache': false,
        'url': '/:spotId/nest',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/nest-tab.html',
            'controller': 'NestTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.other-features', {
        'cache': false,
        'url': '/:spotId/other-features',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/other-features-tab.html',
            'controller': 'OtherFeaturesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.spot', {
        'cache': false,
        'url': '/:spotId/spot',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/spot-tab.html',
            'controller': 'SpotTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.samples', {
        'cache': false,
        'url': '/:spotId/samples',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/samples-tab.html',
            'controller': 'SamplesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab._3dstructures', {
        'cache': false,
        'url': '/:spotId/_3dstructures',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/3dstructures-tab.html',
            'controller': '_3DStructuresTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.tags', {
        'cache': false,
        'url': '/:spotId/tags',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/tags-tab.html',
            'controller': 'TagsTabController as vmChild'
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
        'cache': false,
        'url': '/debug',
        'views': {
          'menuContent': {
            'templateUrl': 'app/debug/debug.html',
            'controller': 'DebugController as vm'
          }
        }
      })
      .state('app.about', {
        'cache': false,
        'url': '/about',
        'views': {
          'menuContent': {
            'templateUrl': 'app/about/about.html'/*,
            'controller': 'AboutController as vm'*/
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  }

  function prepLogin(LocalStorageFactory, UserFactory) {
    return LocalStorageFactory.setupLocalforage().then(function () {
      return UserFactory.loadUser();
    });
  }

  function prepMenu(LocalStorageFactory, DataModelsFactory, ProjectFactory, RemoteServerFactory, SpotFactory,
                    UserFactory, OtherMapsFactory) {
    return DataModelsFactory.loadDataModels().then(function () {
      return LocalStorageFactory.setupLocalforage().then(function () {
        return UserFactory.loadUser().then(function () {
          return ProjectFactory.prepProject().then(function () {
            return SpotFactory.loadSpots().then(function () {
              return RemoteServerFactory.loadDbUrl().then(function () {
                return OtherMapsFactory.loadOtherMaps();
              });
            });
          });
        });
      });
    });
  }
}());
