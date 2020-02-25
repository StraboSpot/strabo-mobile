(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboSedSharedBeddingFieldsDirective', straboSedSharedBeddingFieldsDirective);

  function straboSedSharedBeddingFieldsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/sed/bedding/shared-bedding-fields.directive.html'
    };
  }
}());
