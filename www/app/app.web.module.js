(function () {
  'use strict';

  angular
    .module('app', [
      'ionic',
      'ngCordova',
      'ngMessages',
      'ui.router'])
    .constant('IS_WEB', true);
}());
