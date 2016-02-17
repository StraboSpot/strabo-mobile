(function () {
  'use strict';

  angular
    .module('app')
    .controller('ProjectController', ProjectController);

  ProjectController.$inject = ['$state', 'DataModelsFactory', 'FormFactory', 'ProjectFactory'];

  function ProjectController($state, DataModelsFactory, FormFactory, ProjectFactory) {
    var vm = this;

    vm.data = {};
    vm.goToProjects = goToProjects;
    vm.isNewProject = null;
    vm.showField = showField;
    vm.survey = [];
    vm.submit = submit;
    vm.valid = true;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = DataModelsFactory.getDataModel('project').survey;
      if ($state.current.name === 'app.new-project') {
        vm.isNewProject = true;
      }
      else {
        vm.isNewProject = false;
        vm.data = ProjectFactory.getProjectData();
        vm.data = fixDates(vm.data);
      }
    }

    // Convert date string to Date type
    function fixDates(data) {
      if (data.start_date) data.start_date = new Date(data.start_date);
      if (data.end_date) data.end_date = new Date(data.end_date);
      return data;
    }

    /**
     * Public Functions
     */

    function goToProjects() {
      $state.go('app.projects');
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit() {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        if ($state.current.name === 'app.new-project') {
          var added = ProjectFactory.addNewProject(vm.data);
          if (added) $state.go('app.projects');
        }
        else {
          ProjectFactory.save(vm.data);
        }
      }
    }
  }
}());
