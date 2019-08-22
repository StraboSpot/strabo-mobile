(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboNotesTabDirective', straboNotesTabDirective);

  function straboNotesTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/notes/notes-tab.directive.html'
    };
  }
}());