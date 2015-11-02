(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabNotesController', SpotTabNotesController);

  SpotTabNotesController.$inject = ['$scope', '$stateParams', '$log'];

  function SpotTabNotesController($scope, $stateParams, $log) {
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab notes Controller');
  }
}());
