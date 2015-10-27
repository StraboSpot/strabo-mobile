(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabRockdescriptionController', SpotTabRockdescriptionController);

  SpotTabRockdescriptionController.$inject = ['$scope', '$log', '$stateParams'];

  function SpotTabRockdescriptionController($scope, $log, $stateParams) {
    $log.log('inside spot tab rock description Controller');

    // load the current state into the parent, we do this because stateparams are accessible only through the child
    // and we need to propogate this to the parent because of business logic currently stuck in the parent controller
    $scope.load($stateParams);
  }
}());
