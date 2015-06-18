angular.module('app')
  .controller('SpotTabNotesCtrl', function ($scope,
                                            $stateParams) {

    console.log('inside spot tab notes ctrl');

    // load the current state into the parent, we do this because stateparams are accessible only through the child
    // and we need to propogate this to the parent because of business logic currently stuck in the parent controller
    $scope.load($stateParams);

  });
