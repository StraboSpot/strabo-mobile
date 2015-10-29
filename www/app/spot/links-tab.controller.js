(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabLinksController', SpotTabLinksController);

  SpotTabLinksController.$inject = ['$scope', '$log', 'CurrentSpot'];

  function SpotTabLinksController($scope, $log, CurrentSpot) {
    var vm = this;
    var vmParent = $scope.vm;

    $log.log('inside spot tab links Controller');

    vm.linkSpot = function () {
      CurrentSpot.setCurrentSpot(vmParent.spot);
      vmParent.openModal('linkModal');
    };

    vm.setLinkRelationship = function (item, relationship) {
      var related_spot = _.find(vmParent.links_selected, function (rel_spot) {
        return rel_spot.id === item.id;
      });
      related_spot['relationship'] = relationship.type;
    };
  }
}());