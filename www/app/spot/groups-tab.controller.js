(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupsController', SpotTabGroupsController);

  SpotTabGroupsController.$inject = ['$log', '$scope', '$state', 'SpotFactory'];

  function SpotTabGroupsController($log, $scope, $state, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    $log.log('inside spot tab groups Controller');

    vm.linkGroup = function () {
      SpotFactory.setCurrentSpot(vmParent.spot);
      vmParent.openModal('groupModal');
    };
  }
}());
