(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupmembersController', SpotTabGroupmembersController);

  SpotTabGroupmembersController.$inject = ['$scope', '$log', 'CurrentSpot'];

  function SpotTabGroupmembersController($scope, $log, CurrentSpot) {
    var vm = this;
    var vmParent = $scope.vm;

    $log.log('inside spot tab group members Controller');

    vm.addGroupMember = function () {
      CurrentSpot.setCurrentSpot(vmParent.spot);
      vmParent.openModal('groupMembersModal');
    };
  }
}());
