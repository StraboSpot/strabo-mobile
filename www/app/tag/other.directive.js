(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboOtherTagDirective', straboOtherTagDirective);

  function straboOtherTagDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag/other.directive.html'
    };
  }
}());
