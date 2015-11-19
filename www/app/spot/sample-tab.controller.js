(function () {
  'use strict';

  angular
    .module('app')
    .controller('SampleTabController', SampleTabController);

  SampleTabController.$inject = ['$scope', '$stateParams', '$log'];

  function SampleTabController($scope, $stateParams, $log) {
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('In SampleTabController');
  }
}());
