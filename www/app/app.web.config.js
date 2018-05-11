(function () {
  'use strict';

  angular
    .module('app')
    .config(config);

  function config($urlRouterProvider, $stateProvider) {
    // Declare Login and Main Menu States and Dashboard State for WEB
    $stateProvider
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

    // Declare Main Menu and Child Content States
    var states = [
      {'state': 'about', 'url': 'about', 'template': 'about/about', 'controller': 'About', 'view': 'menuContent'},
      {'state': 'description', 'url': 'description', 'template': 'project/description/description', 'controller': 'Description', 'view': 'menuContent'},
      {'state': 'image-basemaps.image-basemap', 'url': ':imagebasemapId', 'template': 'maps/image-basemap/image-basemap', 'controller': 'ImageBasemap', 'view': 'image-basemap-view'},
      {'state': 'image-basemaps', 'url': 'image-basemaps', 'template': 'maps/image-basemaps/image-basemaps', 'controller': 'ImageBasemaps', 'view': 'menuContent'},
      {'state': 'images', 'url': 'images', 'template': 'attributes/images/images', 'controller': 'Images', 'view': 'menuContent'},
      {'state': 'manage-project', 'url': 'manage-project', 'template': 'project/manage/manage-project', 'controller': 'ManageProject', 'view': 'menuContent'},
      {'state': 'map', 'url': 'map', 'template': 'maps/map/map', 'controller': 'Map', 'view': 'menuContent'},
      {'state': 'misc', 'url': 'misc', 'template': 'misc/misc', 'controller': 'Misc', 'view': 'menuContent'},
      {'state': 'other-maps', 'url': 'other-maps', 'template': 'maps/other-maps/other-maps', 'controller': 'OtherMaps', 'view': 'menuContent'},
      {'state': 'preferences', 'url': 'preferences', 'template': 'project/preferences/preferences', 'controller': 'Preferences', 'view': 'menuContent'},
      {'state': 'relationships.relationship', 'url': ':relationship_id', 'template': 'relationship/relationship', 'controller': 'Relationship', 'view': 'relationship-view@app.relationships'},
      {'state': 'relationships', 'url': 'relationships', 'template': 'relationships/relationships', 'controller': 'Relationships', 'view': 'menuContent'},
      {'state': 'samples', 'url': 'samples', 'template': 'attributes/samples/samples', 'controller': 'Samples', 'view': 'menuContent'},
      {'state': 'strat-section', 'url': 'strat-sections/:stratSectionId', 'template': 'maps/strat-section/strat-section', 'controller': 'StratSection', 'view': 'menuContent'},
      //{'state': 'strat-sections.strat-section', 'url': ':stratSectionId', 'template': 'maps/strat-section/strat-section', 'controller': 'StratSection', 'view': 'strat-section-view'},
      {'state': 'strat-sections', 'url': 'strat-sections', 'template': 'maps/strat-sections/strat-sections', 'controller': 'StratSections', 'view': 'menuContent'},
      {'state': 'tags.tag', 'url': ':tag_id', 'template': 'tag/tag', 'controller': 'Tag', 'view': 'tag-view@app.tags'},
      {'state': 'tags', 'url': 'tags', 'template': 'tags/tags', 'controller': 'Tags', 'view': 'menuContent'},
      {'state': 'tools', 'url': 'tools', 'template': 'project/tools/tools', 'controller': 'Tools', 'view': 'menuContent'},
      {'state': 'user', 'url': 'user', 'template': 'user/user', 'controller': 'User', 'view': 'menuContent'},
      // For WEB only
      {'state': 'login', 'url': 'login', 'template': 'login/login', 'controller': 'Login', 'view': 'menuContent'}
    ];
    _.each(states, function (state) {
      var viewKey = state.view;
      var view = {};
      view[viewKey] = {
        'templateUrl': 'app/' + state.template + '.web.html',   // Added .web for WEB
        'controller': state.controller + 'Controller as vm'
      };
      $stateProvider.state('app.' + state.state, {
        'cache': false,
        'url': '/' + state.url,
        'views': view
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
      {'state': 'minerals', 'template': 'minerals/minerals-tab', 'controller': 'Minerals'},
      {'state': 'nesting', 'template': 'nesting/nesting-tab', 'controller': 'Nesting'},
      {'state': 'orientations', 'template': 'orientations/orientations-tab', 'controller': 'Orientations'},
      {'state': 'other-features', 'template': 'other-features/other-features-tab', 'controller': 'OtherFeatures'},
      {'state': 'relationships', 'template': 'relationships/relationships-tab', 'controller': 'Relationships'},
      {'state': 'samples', 'template': 'samples/samples-tab', 'controller': 'Samples'},
      {'state': 'spot', 'template': 'spot-tab/spot-tab', 'controller': 'Spot'},
      {'state': 'sed-interpretations', 'template': 'sed/interpretations/interpretations-tab', 'controller': 'SedInterpretations'},
      {'state': 'sed-lithologies', 'template': 'sed/lithologies/lithologies-tab', 'controller': 'SedLithologies'},
      {'state': 'sed-structures', 'template': 'sed/structures/structures-tab', 'controller': 'SedStructures'},
      {'state': 'strat-section', 'template': 'sed/strat-section/strat-section-tab', 'controller': 'StratSection'},
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
