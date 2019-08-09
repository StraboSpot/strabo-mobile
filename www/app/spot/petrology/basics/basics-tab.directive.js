(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboPetBasicsTabDirective', straboPetBasicsTabDirective);

  function straboPetBasicsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/petrology/basics/basics-tab.directive.html'
    };
  }
}());