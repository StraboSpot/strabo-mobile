(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabNotesController', SpotTabNotesController);

  SpotTabNotesController.$inject = ['$log'];

  function SpotTabNotesController($log) {
    $log.log('inside spot tab notes Controller');
  }
}());
