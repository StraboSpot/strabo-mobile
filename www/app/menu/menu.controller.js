(function () {
  'use strict';

  angular
    .module('app')
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$ionicLoading', '$log', '$scope', '$state', 'ProjectFactory', 'ThinSectionFactory',
    'UserFactory'];

  function MenuController($ionicLoading, $log, $scope, $state, ProjectFactory, ThinSectionFactory, UserFactory) {
    var vm = this;

    vm.projectName = '';
    vm.userImage = null;
    vm.userName = null;

    vm.editUser = editUser;
    vm.getIsMode = getIsMode;
    vm.getProjectName = getProjectName;
    vm.getUserImage = getUserImage;
    vm.getUserName = getUserName;
    vm.isActive = isActive;
    vm.projectDetail = projectDetail;
    vm.showLoadingSpinner = showLoadingSpinner;
    vm.showMicrographWorkspace = showMicrographWorkspace;

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

    function getIsMode(mode) {
      var preferences = ProjectFactory.getPreferences();
      var project = ProjectFactory.getCurrentProject();
      return _.has(preferences, mode) && project.is_testing_mode;
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

    function isActive(state) {
      return state === $state.current.name || $state.current.name.startsWith(state);
    }

    function projectDetail() {
      $state.go('app.manage-project');
    }

    function showLoadingSpinner() {
      if ($state.current.name !== 'app.map') {
        $ionicLoading.show({
          'template': '<ion-spinner></ion-spinner><br>Loading Map...'
        });
      }
    }

    function showMicrographWorkspace() {
      // return !_.isEmpty(ThinSectionFactory.getSpotsWithMicrographs());
    }
  }
}());
