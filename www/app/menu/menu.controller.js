(function () {
  'use strict';

  angular
    .module('app')
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$state'];

  function MenuController($state) {
    var vm = this;
    vm.editProject = editProject;
    vm.editUser = editUser;
    vm.openTools = openTools;

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
