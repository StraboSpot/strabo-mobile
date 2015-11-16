(function () {
  'use strict';

  angular
    .module('app')
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$log', '$scope', '$state', 'UserFactory'];

  function MenuController($log, $scope, $state, UserFactory) {
    var vm = this;
    vm.editProject = editProject;
    vm.editUser = editUser;
    vm.getUserNameVar = getUserNameVar;
    vm.loggedIn = false;
    vm.isLoggedIn = isLoggedIn;
    vm.openTools = openTools;
    vm.userName = '';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      // Watch whether we have a login or not
      $scope.$watch('vm.isLoggedIn()', function (loggedIn) {
        vm.loggedIn = loggedIn;
        if (loggedIn) {
          getUserName();
        }
      });

      // For user name changes
      $scope.$watch('vm.getUserNameVar()', function (userName) {
        vm.userName = userName;
        $log.log('User name: ', userName);
      });
    }

    function getUserName() {
      UserFactory.getUserName().then(function (userName) {
        if (userName) {
          vm.userName = userName;
        }
        else {
          UserFactory.getLogin().then(function (login) {
            vm.userName = login.email;
          });
        }
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

    function getUserNameVar() {
      return UserFactory.getUserNameVar();
    }

    function isLoggedIn() {
      return UserFactory.isLoggedIn();
    }

    function openTools() {
      $state.go('app.tools');
    }
  }
}());
