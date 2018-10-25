(function () {
  'use strict';

  angular
    .module('app', [
      'ionic',
      'ngCordova',
      'ngMessages'
    ])
    // .run(function () {
    //   Pro.init('c569ad', {
    //     appVersion: '1.6.0'
    //   });
    // })
    .constant('IS_WEB', false);
}());
