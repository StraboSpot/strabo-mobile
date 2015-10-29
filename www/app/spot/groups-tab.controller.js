(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupsController', SpotTabGroupsController);

  SpotTabGroupsController.$inject = ['$scope', '$log', 'CurrentSpot'];

  function SpotTabGroupsController($scope, $log, CurrentSpot) {
    var vm = this;
    var vmParent = $scope.vm;

    $log.log('inside spot tab groups Controller');

    vm.linkGroup = function () {
      CurrentSpot.setCurrentSpot(vmParent.spot);
      vmParent.openModal('groupModal');
    };
  }
}());
