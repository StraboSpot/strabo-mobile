(function () {
  'use strict';

  angular
    .module('app.DashboardModule')
    .controller('UserDashboardController', UserDashboardController);

  UserDashboardController.$inject = ['$scope'];

  function UserDashboardController($scope) {
    $scope.name = "John Dee";
    console.log($scope.name);
  }
}());
