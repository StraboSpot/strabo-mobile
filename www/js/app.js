angular.module('app', [
  'ionic',
  // 'openlayers-directive',
  'ngCordova'
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
  })

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
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'MenuCtrl'
    })

    .state('app.map', {
      url: "/map",
      views: {
        'menuContent': {
          templateUrl: "templates/map.html",
          controller: 'MapCtrl'
        }
      }
    })

    .state('app.offlinemap', {
      url: "/offlinemap",
      views: {
        'menuContent': {
          templateUrl: "templates/offlinemap.html"
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

    .state('app.spots', {
      url: "/spots",
      views: {
        'menuContent': {
          templateUrl: "templates/spots.html",
          controller: 'SpotsCtrl'
        }
      }
    })

    .state('app.spot', {
      url: "/spots/:spotId",
      views: {
        'menuContent': {
          templateUrl: "templates/spot.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.newspot', {
      url: "/spots/newspot",
      views: {
        'menuContent': {
          templateUrl: "templates/spot.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.mapname', {
      url: "/map/mapname",
      views: {
        'menuContent': {
          templateUrl: "templates/mapname.html",
          controller: 'MapNameCtrl'
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
  $urlRouterProvider.otherwise('/app/map');
});