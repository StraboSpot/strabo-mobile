(function () {
  'use strict';

  angular
    .module('app', [
      'ionic',
      'ngCordova',
      'ngMessages'
    ])
    .constant('IS_WEB', false);
}());
