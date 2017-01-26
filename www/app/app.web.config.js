(function () {
  'use strict';

  angular
    .module('app')
    .config(config);

  function config($urlRouterProvider, $stateProvider) {
    // Set up states
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
      })
      .state('app.description', {
        'cache': false,
        'url': '/description',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/description/description.web.html',
            'controller': 'DescriptionController as vm'
          }
        }
      })
      .state('app.login', {
        'cache': false,
        'url': '/login',
        'views': {
          'menuContent': {
            'templateUrl': 'app/login/login.web.html',
            'controller': 'LoginController as vm'
          }
        }
      })
      .state('app.manage-project', {
        'cache': false,
        'url': '/manage-project',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/manage/manage-project.web.html',
            'controller': 'ManageProjectController as vm'
          }
        }
      })
      .state('app.relationships', {
        'cache': false,
        'url': '/relationships',
        'views': {
          'menuContent': {
            'templateUrl': 'app/relationships/relationships.web.html',
            'controller': 'RelationshipsController as vm'
          }
        }
      })
      .state('app.relationships.relationship', {
        'cache': false,
        'url': '/:relationship_id',
        'views': {
          'relationship-view@app.relationships': {
            'templateUrl': 'app/relationship/relationship.web.html',
            'controller': 'RelationshipController as vm'
          }
        }
      })
      .state('app.tags', {
        'cache': false,
        'url': '/tags',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tags/tags.web.html',
            'controller': 'TagsController as vm'
          }
        }
      })
      .state('app.tags.tag', {
        'cache': false,
        'url': '/:tag_id',
        'views': {
          'tag-view@app.tags': {
            'templateUrl': 'app/tag/tag.web.html',
            'controller': 'TagController as vm'
          }
        }
      })
      .state('app.tools', {
        'cache': false,
        'url': '/tools',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/tools/tools.web.html',
            'controller': 'ToolsController as vm'
          }
        }
      })
      .state('app.user', {
        'cache': false,
        'url': '/user',
        'views': {
          'menuContent': {
            'templateUrl': 'app/user/user.web.html',
            'controller': 'UserController as vm'
          }
        }
      })
      .state('app.map', {
        'cache': false,
        'url': '/map',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/map/map.web.html',
            'controller': 'MapController as vm'
          }
        }
      })/*
       .state('app.offlinemap', {
       'cache': false,
       'url': '/offlinemap',
       'views': {
       'menuContent': {
       'templateUrl': 'app/maps/offline-maps/offline-maps.html',
       'controller': 'OfflineMapController as vm'
       }
       }
       })*/
      .state('app.other-maps', {
        'cache': false,
        'url': '/other-maps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/other-maps/other-maps.web.html',
            'controller': 'OtherMapsController as vm'
          }
        }
      })
      .state('app.preferences', {
        'cache': false,
        'url': '/preferences',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/preferences/preferences.web.html',
            'controller': 'PreferencesController as vm'
          }
        }
      })
      .state('app.image-basemaps', {
        'cache': false,
        'url': '/image-basemaps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/image-basemaps/image-basemaps.web.html',
            'controller': 'ImageBasemapsController as vm'
          }
        }
      })
      .state('app.image-basemaps.image-basemap', {
        'cache': false,
        'url': '/:imagebasemapId',
        'views': {
          'image-basemap-view': {
            'templateUrl': 'app/maps/image-basemap/image-basemap.web.html',
            'controller': 'ImageBasemapController as vm'
          }
        }
      })/*
       .state('app.spots', {
       'cache': false,
       'url': '/spots',
       'views': {
       'menuContent': {
       'templateUrl': 'app/spot/spots.html',
       'controller': 'SpotsController as vm'
       }
       }
       })*/
      .state('app.spotTab', {
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
          $log.log('Exiting Spots State. Clearing current Spot ...');
          SpotFactory.clearCurrentSpot();
        }
      })
      .state('app.spotTab.orientations', {
        'cache': false,
        'url': '/:spotId/orientations',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/orientations/orientations-tab.web.html',
            'controller': 'OrientationsTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.images', {
        'cache': false,
        'url': '/:spotId/images',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/images/images-tab.web.html',
            'controller': 'ImagesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.inferences', {
        'cache': false,
        'url': '/:spotId/inferences',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/inferences/inferences-tab.web.html',
            'controller': 'InferencesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.nesting', {
        'cache': false,
        'url': '/:spotId/nesting',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/nesting/nesting-tab.web.html',
            'controller': 'NestingTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.other-features', {
        'cache': false,
        'url': '/:spotId/other-features',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/other-features/other-features-tab.web.html',
            'controller': 'OtherFeaturesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.spot', {
        'cache': false,
        'url': '/:spotId/spot',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/spot-home/spot-tab.web.html',
            'controller': 'SpotTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.samples', {
        'cache': false,
        'url': '/:spotId/samples',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/samples/samples-tab.web.html',
            'controller': 'SamplesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab._3dstructures', {
        'cache': false,
        'url': '/:spotId/_3dstructures',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/3d-structures/3dstructures-tab.web.html',
            'controller': '_3DStructuresTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.tags', {
        'cache': false,
        'url': '/:spotId/tags',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/tags/tags-tab.web.html',
            'controller': 'TagsTabController as vmChild'
          }
        }
      })
      .state('app.archiveTiles', {
        'url': '/maps/archiveTiles',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/offline-maps/archive-tiles.html',
            'controller': 'ArchiveTilesController as vm'
          }
        }
      })
      .state('app.misc', {
        'cache': false,
        'url': '/misc',
        'views': {
          'menuContent': {
            'templateUrl': 'app/misc/misc.web.html',
            'controller': 'MiscController as vm'
          }
        }
      })
      .state('app.about', {
        'cache': false,
        'url': '/about',
        'views': {
          'menuContent': {
            'templateUrl': 'app/about/about.web.html'/*,
             'controller': 'AboutController as vm'*/
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
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
                    UserFactory, OtherMapsFactory) {
    $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loading Data Models...'});
    return DataModelsFactory.loadDataModels().then(function () {
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loading Database...'});
      return LocalStorageFactory.setupLocalforage().then(function () {
        $ionicLoading.show(
          {'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loading User...'});
        return UserFactory.loadUser().then(function () {
          $ionicLoading.show(
            {'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loaded User<br>Loading Project...'});
          return ProjectFactory.prepProject().then(function () {
            $ionicLoading.show(
              {'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loaded User<br>Loaded Project<br>Loading Spots...'});
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
  }
}());
