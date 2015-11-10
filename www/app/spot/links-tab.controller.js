(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabLinksController', SpotTabLinksController);

  SpotTabLinksController.$inject = ['$scope', '$stateParams', '$log', 'CurrentSpotFactory'];

  function SpotTabLinksController($scope, $stateParams, $log, CurrentSpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab links Controller');

    vm.linkSpot = function () {
      CurrentSpotFactory.setCurrentSpot(vmParent.spot);
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
