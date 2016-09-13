(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboRelationshipTagDirective', straboRelationshipTagDirective);

  function straboRelationshipTagDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag/relationship.directive.html'
    };
  }
}());
