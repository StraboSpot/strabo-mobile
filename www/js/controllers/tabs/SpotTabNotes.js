angular
  .module('app')
  .controller('SpotTabNotesController', function ($scope,
                                            $log,
                                            $stateParams) {
    $log.log('inside spot tab notes Controller');

    // load the current state into the parent, we do this because stateparams are accessible only through the child
    // and we need to propogate this to the parent because of business logic currently stuck in the parent controller
    $scope.load($stateParams);
  });
