(function () {
  'use strict';

  angular
    .module('app', [
      'ionic',
      'ngCordova',
      'ngMessages',
      'ui.router',
      'app.DashboardModule'])
    .constant('IS_WEB', true);
}());
