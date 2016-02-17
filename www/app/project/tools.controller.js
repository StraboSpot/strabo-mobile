(function () {
  'use strict';

  angular
    .module('app')
    .controller('ToolsController', ToolsController);

  ToolsController.$inject = ['DataModelsFactory', 'FormFactory', 'ProjectFactory'];

  function ToolsController(DataModelsFactory, FormFactory, ProjectFactory) {
    var vm = this;

    vm.data = {};
    vm.showField = showField;
    vm.survey = [];
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = DataModelsFactory.getDataModel('tools').survey;
      vm.data = ProjectFactory.getProjectData();
    }

    /**
     * Public Functions
     */

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit() {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        ProjectFactory.save(vm.data);
        vm.dataOriginal = vm.data;
      }
    }
  }
}());
