(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboAboutDirective', straboAboutDirective);

  function straboAboutDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/about/about.directive.html'
    };
  }
}());