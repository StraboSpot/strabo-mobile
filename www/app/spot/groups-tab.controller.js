(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupsController', SpotTabGroupsController);

  SpotTabGroupsController.$inject = ['$scope', '$stateParams', '$log', 'CurrentSpotFactory'];

  function SpotTabGroupsController($scope, $stateParams, $log, CurrentSpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab groups Controller');

    vm.linkGroup = function () {
      CurrentSpotFactory.setCurrentSpot(vmParent.spot);
      vmParent.openModal('groupModal');
    };
  }
}());
