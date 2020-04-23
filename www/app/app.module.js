(function () {
  'use strict';

  angular
    .module('app', [
      'ngRaven',
      'ionic',
      'ngCordova',
      'ngMessages',
      'ionic.native'
    ])
    // .run(function () {
    //   Pro.init('c569ad', {
    //     appVersion: '1.6.0'
    //   });
    // })
    .constant('IS_WEB', false);
}());
