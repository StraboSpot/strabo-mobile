(function () {
  'use strict';

  angular
    .module('app')
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$log', '$scope', '$state', 'ProjectFactory', 'UserFactory'];

  function MenuController($log, $scope, $state, ProjectFactory, UserFactory) {
    var vm = this;
    vm.editProject = editProject;
    vm.editUser = editUser;
    vm.getProjectName = getProjectName;
    vm.getUserName = getUserName;
    vm.loggedIn = false;
    vm.isLoggedIn = isLoggedIn;
    vm.openTools = openTools;
    vm.projectName = '';
    vm.userName = '';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      // Watch whether we have a login or not
      $scope.$watch('vm.isLoggedIn()', function (loggedIn) {
        vm.loggedIn = loggedIn;
        if (loggedIn) getUserName();
      });

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

    function editProject() {
      $state.go('app.project');
    }

    function editUser() {
      $state.go('app.user');
    }

    function getProjectName() {
      return ProjectFactory.getProjectName();
    }

    function getUserName() {
      return UserFactory.getUserName();
    }

    function isLoggedIn() {
      return UserFactory.isLoggedIn();
    }

    function openTools() {
      $state.go('app.tools');
    }
  }
}());
