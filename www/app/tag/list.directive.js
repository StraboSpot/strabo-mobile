(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTaggedListDirective', straboTaggedListDirective);

  function straboTaggedListDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag/list.directive.html'
    };
  }
}());
