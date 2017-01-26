(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboManageProjectDirective', straboManageProjectDirective);

  function straboManageProjectDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/project/manage/manage-project.directive.html'
    };
  }
}());