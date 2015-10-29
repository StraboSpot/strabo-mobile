(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabRockdescriptionController', SpotTabRockdescriptionController);

  SpotTabRockdescriptionController.$inject = ['$log'];

  function SpotTabRockdescriptionController($log) {
    $log.log('inside spot tab rock description Controller');
  }
}());
