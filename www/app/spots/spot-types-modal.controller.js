(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTypeController', SpotTypeController);

  SpotTypeController.$inject = ['NewSpot'];

  function SpotTypeController(NewSpot) {
    var vm = this;

    vm.getSpotTypes = NewSpot.getSpotTypes;
    vm.setSpotType = setSpotType;

    function setSpotType(type) {
      var jsonTemplate = {
        'properties': {
          'type': type
        }
      };
      NewSpot.setNewSpot(jsonTemplate);
    }
  }
}());
