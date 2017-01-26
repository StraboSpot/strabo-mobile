(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboPreferencesDirective', straboPreferencesDirective);

  function straboPreferencesDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/project/preferences/preferences.directive.html'
    };
  }
}());