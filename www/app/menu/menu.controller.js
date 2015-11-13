(function () {
  'use strict';

  angular
    .module('app')
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$state', 'UserFactory'];

  function MenuController($state, UserFactory) {
    var vm = this;
    vm.editProject = editProject;
    vm.editUser = editUser;
    vm.openTools = openTools;
    vm.userName = '';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      getUserName();
    }

    function getUserName() {
      UserFactory.getUserName().then(function (userName) {
        vm.userName = userName;
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

    function openTools() {
      $state.go('app.tools');
    }
  }
}());
