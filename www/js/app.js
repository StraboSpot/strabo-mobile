angular.module('app', [
  'ionic',
 // 'openlayers-directive',
  'ngCordova',
  'LocalForageModule'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(['$localForageProvider', function($localForageProvider){
    // mobile chrome doesn't support blob storage in indexedDB very well, so we need to use WebSQL for now
    $localForageProvider.config({
        driver      : 'webSQLStorage', // if you want to force a driver {asyncStorage,webSQLStorage,localStorageWrapper}
        name        : 'offlineLeafletTiles', // name of the database and prefix for your data, it is "lf" by default
        version     : 1.0, // version of the database, you shouldn't have to use this
        storeName   : 'keyvaluepairs', // name of the table
        description : 'offline leaflet tiles storage'
    });
}])

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
        'menuContent' :{
          templateUrl: "templates/map.html",
          controller: 'MapCtrl'
        }
      }
    })

    .state('app.offlinemap', {
      url: "/offlinemap",
      views: {
        'menuContent' :{
          templateUrl: "templates/offlinemap.html",
          controller: 'OfflineMapCtrl'
        }
      }
    })

		.state('app.search', {
      url: "/search",
      views: {
        'menuContent' :{
          templateUrl: "templates/search.html"
        }
      }
    })

    .state('app.spots', {
      url: "/spots",
      views: {
        'menuContent' :{
          templateUrl: "templates/spots.html",
          controller: 'SpotsCtrl'
        }
      }
    })

    .state('app.spot', {
      url: "/spots/:spotId",
      views: {
        'menuContent' :{
          templateUrl: "templates/spot.html",
          controller: 'SpotCtrl'
        }
      }
    })
    
    .state('app.newspot', {
      url: "/spots/newspot",
      views: {
        'menuContent' :{
          templateUrl: "templates/spot.html",
          controller: 'SpotCtrl'
        }
      }
    })

    .state('app.about', {
      url: "/about",
      views: {
        'menuContent' :{
          templateUrl: "templates/about.html"
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
