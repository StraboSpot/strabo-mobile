(function () {
  'use strict';

  angular
    .module('app')
    .controller('ToolsController', ToolsController);

  ToolsController.$inject = ['$location', 'FormFactory', 'ProjectFactory'];

  function ToolsController($location, FormFactory, ProjectFactory) {
    var vm = this;

    vm.data = {};
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        FormFactory.setForm('tools');
        vm.data = ProjectFactory.getProjectTools();
      }
    }

    /**
     * Public Functions
     */

    function submit() {
      var valid = FormFactory.validate(vm.data);
      if (valid) ProjectFactory.saveProjectItem('tools', vm.data);
    }
  }
}());
