(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupmembersController', SpotTabGroupmembersController);

  SpotTabGroupmembersController.$inject = ['$log', '$scope', '$state', 'SpotFactory'];

  function SpotTabGroupmembersController($log, $scope, $state, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    $log.log('inside spot tab group members Controller');

    vm.addGroupMember = function () {
      vmParent.openModal('groupMembersModal');
    };
  }
}());
