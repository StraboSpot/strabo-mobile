(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTypeController', SpotTypeController);

  SpotTypeController.$inject = ['NewSpotFactory'];

  function SpotTypeController(NewSpotFactory) {
    var vm = this;

    vm.getSpotTypes = NewSpotFactory.getSpotTypes;
    vm.setSpotType = setSpotType;

    function setSpotType(type) {
      var jsonTemplate = {
        'properties': {
          'type': type
        }
      };
      NewSpotFactory.setNewSpot(jsonTemplate);
    }
  }
}());
