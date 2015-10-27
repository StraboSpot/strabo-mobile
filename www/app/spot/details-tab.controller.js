(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabDetailController', SpotTabDetailController);

  SpotTabDetailController.$inject = ['$scope', '$stateParams', '$log'];

  function SpotTabDetailController($scope, $stateParams, $log) {
    $log.log('inside spot tab detail Controller');

    // load the current state into the parent, we do this because stateparams are accessible only through the child
    // and we need to propogate this to the parent because of business logic currently stuck in the parent controller
    $scope.load($stateParams);
  }
}());
