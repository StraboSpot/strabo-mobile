(function () {
  'use strict';

  angular
    .module('app')
    .run(function ($ionicPlatform, $window) {
      $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if ($window.cordova && $window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if ($window.StatusBar) {
          // org.apache.cordova.statusbar required
          $window.StatusBar.styleDefault();
          StatusBar.styleBlackTranslucent();
          $window.StatusBar.overlaysWebView(false);
        }
      });
    });
}());
