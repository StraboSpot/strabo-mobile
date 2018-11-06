(function () {
  'use strict';

  angular
    .module('app', [
      'ngRaven',
      'ionic',
      'ngCordova',
      'ngMessages',
      'ui.router'])
    .constant('IS_WEB', true);
}());
