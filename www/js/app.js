angular.module('app', [
  'ionic',
  'ngCordova',
  'ngMessages'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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
    driver: localforage.WEBSQL,
    name: 'offlineMapTiles'
  });

  // global LF for map names
  mapNamesDb = localforage.createInstance({
      driver: localforage.WEBSQL,
      name: 'MapNames'
  });

  // global LF for spot data
  spotsDb = localforage.createInstance({
      driver: localforage.WEBSQL,
      name: 'Spots'
  });

  // global LF for configuration data
  configDb = localforage.createInstance({
    driver: localforage.WEBSQL,
    name: 'Config'
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('login', {
      cache: false,
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html"
    })

    .state('app.map', {
      cache: false,
      url: "/map",
      views: {
        'menuContent': {
          templateUrl: "templates/map.html",
          controller: 'MapCtrl'
        }
      }
    })

    .state('app.offlinemap', {
      cache: false,
      url: "/offlinemap",
      views: {
        'menuContent': {
          templateUrl: "templates/offlinemap.html",
          controller: "OfflineMapCtrl"
        }
      }
    })

    .state('app.search', {
      url: "/search",
      views: {
        'menuContent': {
          templateUrl: "templates/search.html"
        }
      }
    })

    .state('app.settings', {
      cache: false,
      url: "/settings",
      views: {
        'menuContent': {
          templateUrl: "templates/settings.html",
          controller: "SettingsCtrl"
        }
      }
    })

    .state('app.spots', {
      cache: false,
      url: "/spots",
      views: {
        'menuContent': {
          templateUrl: "templates/spots.html",
          controller: 'SpotsCtrl'
        }
      }
    })

    .state('app.newspot', {
      cache: false,
      url: "/spots/newspot",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/details.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.details', {
      cache: false,
      url: "/spots/:spotId/details",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/details.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.notes', {
      cache: false,
      url: "/spots/:spotId/notes",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/notes.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.pictures', {
      cache: false,
      url: "/spots/:spotId/pictures",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/pictures.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.georeference', {
      cache: false,
      url: "/spots/:spotId/georeference",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/georeference.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.links', {
      cache: false,
      url: "/spots/:spotId/links",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/links.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.groups', {
      cache: false,
      url: "/spots/:spotId/groups",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/groups.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.groupmembers', {
      cache: false,
      url: "/spots/:spotId/groupmembers",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/groupmembers.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.rockdescription', {
      cache: false,
      url: "/spots/:spotId/rockdescription",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/rockdescription.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.rocksample', {
      cache: false,
      url: "/spots/:spotId/rocksample",
      views: {
        'menuContent': {
          templateUrl: "templates/tabs/rocksample.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.archiveTiles', {
      url: "/map/archiveTiles",
      views: {
        'menuContent': {
          templateUrl: "templates/archiveTiles.html",
          controller: 'ArchiveTilesCtrl'
        }
      }
    })

    .state('app.debug', {
      url: "/debug",
      views: {
        'menuContent': {
          templateUrl: "templates/debug.html",
          controller: 'DebugCtrl'
        }
      }
    })

    .state('app.about', {
      url: "/about",
      views: {
        'menuContent': {
          templateUrl: "templates/about.html"
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
