(function () {
  'use strict';

  angular
    .module('app')
    .controller('ProjectController', ProjectController);

  ProjectController.$inject = ['DataModelsFactory', 'FormFactory', 'ProjectFactory'];

  function ProjectController(DataModelsFactory, FormFactory, ProjectFactory) {
    var vm = this;

    vm.data = {};
    vm.isNewProject = null;
    vm.showField = showField;
    vm.survey = {};
    vm.submit = submit;
    vm.valid = true;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = DataModelsFactory.getDataModel('project').survey;
      vm.data = ProjectFactory.getCurrentProject().description;
      fixDates();
    }

    // Convert date string to Date type
    function fixDates() {
      if (vm.data.start_date) vm.data.start_date = new Date(vm.data.start_date);
      if (vm.data.end_date) vm.data.end_date = new Date(vm.data.end_date);
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
      if (valid) ProjectFactory.saveProjectItem('description', vm.data);
    }
  }
}());
