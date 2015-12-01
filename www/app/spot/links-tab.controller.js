(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabLinksController', SpotTabLinksController);

  SpotTabLinksController.$inject = ['$log', '$scope', '$state', 'SpotFactory'];

  function SpotTabLinksController($log, $scope, $state, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    $log.log('inside spot tab links Controller');

    vm.linkSpot = function () {
      vmParent.openModal('linkModal');
    };

    vm.setLinkRelationship = function (item, relationship) {
      var related_spot = _.find(vmParent.links_selected, function (rel_spot) {
        return rel_spot.id === item.id;
      });
      related_spot.relationship = relationship.type;
    };
  }
}());
