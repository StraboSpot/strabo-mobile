(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboMapSidePanel', straboMapSidePanel);

  function straboMapSidePanel() {
    return {
      'restrict': 'E',
      'templateUrl': 'app/maps/side-panel/side-panel.template.html',
      'transclude': true,
      'replace': true
    };
  }
}());
