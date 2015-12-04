(function () {
  'use strict';

  angular
    .module('app')
    .controller('RockUnitsController', RockUnitsController);

  RockUnitsController.$inject = ['$log', '$state', 'ProjectFactory'];

  function RockUnitsController($log, $state, ProjectFactory) {
    var vm = this;
    vm.rockUnits = [];
    vm.newRockUnit = newRockUnit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.rockUnits = ProjectFactory.getRockUnits();
    }

    /**
     * Public Functions
     */

    function newRockUnit() {
      $state.go('app.new-rock-unit');
    }
  }
}());
