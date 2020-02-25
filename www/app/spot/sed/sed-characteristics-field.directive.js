(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedCharacteristicsFieldDirective', straboSedCharacteristicsFieldDirective);

  function straboSedCharacteristicsFieldDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/sed-characteristics-field.directive.html'
    };
  }
}());
