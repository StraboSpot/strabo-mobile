(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboImagesTabDirective', straboImagesTabDirective);

  function straboImagesTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/images/images-tab.directive.html'
    };
  }
}());