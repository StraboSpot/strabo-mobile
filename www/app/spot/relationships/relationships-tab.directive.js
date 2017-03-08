(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboRelationshipsTabDirective', straboRelationshipsTabDirective);

  function straboRelationshipsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/relationships/relationships-tab.directive.html'
    };
  }
}());