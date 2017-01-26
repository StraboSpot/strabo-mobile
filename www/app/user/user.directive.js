(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboUserDirective', straboUserDirective);

  function straboUserDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/user/user.directive.html'
    };
  }
}());