(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedLithologyButtonsDirective', straboSedLithologyButtonsDirective);

  function straboSedLithologyButtonsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/lithology-buttons.directive.html'
    };
  }
}());
