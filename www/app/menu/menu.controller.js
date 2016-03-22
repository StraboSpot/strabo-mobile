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
    vm.getUserImage = getUserImage;
    vm.getUserName = getUserName;
    vm.switchProject = switchProject;
    vm.projectDetail = projectDetail;
    vm.projectName = '';
    vm.userImage = null;
    vm.userName = null;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      var currentProject = ProjectFactory.getCurrentProject();
      if (_.isEmpty(currentProject)) $state.go('app.manage-project');

      // Watch for user image changes
      $scope.$watch('vm.getUserImage()', function (userImage) {
        vm.userImage = userImage;
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

    function editUser() {
      $state.go('app.user');
    }

    function getProjectName() {
      return ProjectFactory.getProjectName();
    }

    function getUserImage() {
      return UserFactory.getUserImage();
    }

    function getUserName() {
      return UserFactory.getUserName();
    }

    function projectDetail() {
      $state.go('app.project');
    }

    function switchProject() {
      ProjectFactory.switchProject = true;
      if ($state.current.name === 'app.manage-project') $state.reload();
      else $state.go('app.manage-project');
    }
  }
}());
