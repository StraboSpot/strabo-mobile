(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboOtherMapsDirective', straboOtherMapsDirective);

  function straboOtherMapsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/maps/other-maps/other-maps.directive.html'
    };
  }
}());