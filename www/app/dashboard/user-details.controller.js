(function () {
  'use strict';

  angular
    .module('app.DashboardModule')
    .controller('UserDetailsDashboardController', UserDetailsDashboardController);

  UserDetailsDashboardController.$inject = ['$scope'];

  function UserDetailsDashboardController($scope) {
    $scope.age = 38;
  }
}());
