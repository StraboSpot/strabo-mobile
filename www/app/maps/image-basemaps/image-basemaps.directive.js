(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboImageBasemapsDirective', straboImageBasemapsDirective);

  function straboImageBasemapsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/maps/image-basemaps/image-basemaps.directive.html'
    };
  }
}());