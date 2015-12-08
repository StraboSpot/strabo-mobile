(function () {
  'use strict';

  angular
    .module('app')
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$log', '$scope', '$state', 'ProjectFactory', 'UserFactory'];

  function MenuController($log, $scope, $state, ProjectFactory, UserFactory) {
    var vm = this;
    vm.editUser = editUser;
    vm.getProjectName = getProjectName;
    vm.getUserName = getUserName;
    vm.switchProject = switchProject;
    vm.projectName = '';
    vm.userName = null;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      // Watch for user name changes
      $scope.$watch('vm.getUserName()', function (userName) {
        vm.userName = userName;
        $log.log('Watch user name: ', userName);
      });

      // Watch for project name changes
      $scope.$watch('vm.getProjectName()', function (projectName) {
        vm.projectName = projectName;
        $log.log('Watch project name: ', projectName);
      });
    }

    /**
     * Public Functions
     */

    function editUser() {
      $state.go('app.user');
    }

    function getProjectName() {
      return ProjectFactory.getProjectName();
    }

    function getUserName() {
      return UserFactory.getUserName();
    }

    function switchProject() {
      $state.go('app.projects');
    }
  }
}());
