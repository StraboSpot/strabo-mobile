(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboImagesDirective', straboImagesDirective);

  function straboImagesDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/attributes/images/images.directive.html'
    };
  }
}());