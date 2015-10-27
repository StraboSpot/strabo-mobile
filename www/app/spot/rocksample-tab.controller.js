(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabRocksampleController', SpotTabRocksampleController);

  SpotTabRocksampleController.$inject = ['$log'];

  function SpotTabRocksampleController($log) {
    $log.log('inside spot tab rock sample Controller');
  }
}());
