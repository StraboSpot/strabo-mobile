(function () {
  'use strict';

  angular
    .module('app')
    .controller('Orientation2TabController', Orientation2TabController);

  Orientation2TabController.$inject = ['$log', '$scope', '$state'];

  function Orientation2TabController($log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.addLine = addLine;
    vm.addPlane = addPlane;
    vm.addTabularZone = addTabularZone;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In Orientation2TabController');
    }

    /**
     * Public Functions
     */

    function addLine() {
      $state.go('app.new-linear-orientation');
    }

    function addPlane() {
      $state.go('app.new-planar-orientation');
    }

    function addTabularZone() {
      $state.go('app.new-tabular-zone-orientation');
    }
  }
}());
