(function () {
  'use strict';

  angular
    .module('app')
    .run(function ($ionicPlatform, $window) {
      $ionicPlatform.ready(function () {
        if ($window.cordova && $window.StatusBar) {
          $window.StatusBar.styleLightContent();
          $window.StatusBar.backgroundColorByName('black');
          $window.StatusBar.overlaysWebView(false);
        }
      });
    });
}());
