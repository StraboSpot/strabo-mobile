(function () {
  'use strict';

  angular
    .module('app')
    .directive('autoFields', autoFields);

  function autoFields() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/form/auto-fields.template.html'
    };
  }
}());
