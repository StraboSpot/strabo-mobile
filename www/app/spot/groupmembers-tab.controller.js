(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupmembersController', SpotTabGroupmembersController);

  SpotTabGroupmembersController.$inject = ['$scope', '$stateParams', '$log', 'CurrentSpotFactory'];

  function SpotTabGroupmembersController($scope, $stateParams, $log, CurrentSpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab group members Controller');

    vm.addGroupMember = function () {
      CurrentSpotFactory.setCurrentSpot(vmParent.spot);
      vmParent.openModal('groupMembersModal');
    };
  }
}());
