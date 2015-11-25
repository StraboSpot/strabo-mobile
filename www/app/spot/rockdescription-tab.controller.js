(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabRockdescriptionController', SpotTabRockdescriptionController);

  SpotTabRockdescriptionController.$inject = ['$log', '$scope', '$state'];

  function SpotTabRockdescriptionController($log, $scope, $state) {
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    $log.log('inside spot tab rock description Controller');
  }
}());
