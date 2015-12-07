(function () {
  'use strict';

  angular
    .module('app')
    .controller('ProjectsController', ProjectsController);

  ProjectsController.$inject = ['$ionicPopup', '$state', 'ProjectFactory'];

  function ProjectsController($ionicPopup, $state, ProjectFactory) {
    var vm = this;

    vm.newProject = newProject;
    vm.projects = [];
    vm.switchProject = switchProject;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.projects = ProjectFactory.getProjects();
    }

    /**
     * Public Functions
     */

    function newProject() {
      $state.go('app.new-project');
    }

    function switchProject(project) {
      $ionicPopup.alert({
        'title': 'In Progress ...',
        'template': 'This will switch to project ' + project.project_name
      });
    }
  }
}());
