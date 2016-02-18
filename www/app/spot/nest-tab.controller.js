(function () {
  'use strict';

  angular
    .module('app')
    .controller('NestTabController', NestTabController);

  NestTabController.$inject = ['$log', '$scope', '$state'];

  function NestTabController($log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = undefined;
    vmParent.choices = undefined;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.childrenSpots = [];
    vm.parentSpot = undefined;
    vm.goToSpot = goToSpot;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In NestTabController');

      vm.parentSpot = getParent(vmParent.spot);
      vm.childrenSpots = getChildren(vmParent.spot);
    }

    function getChildren(thisSpot) {
      if (thisSpot.properties.images) {
        var imageBasemaps = _.map(thisSpot.properties.images, function (image) {
          return image.id;
        });
        return _.filter(vmParent.spots, function (spot) {
          return _.contains(imageBasemaps, spot.properties.image_basemap);
        });
      }
      return [];
    }

    function getParent(thisSpot) {
      if (thisSpot.properties.image_basemap) {
        var parentSpot = _.find(vmParent.spots, function (spot) {
          return _.find(spot.properties.images, function (image) {
            return image.id === thisSpot.properties.image_basemap;
          });
        });
        return parentSpot;
      }
      return undefined;
    }

    /**
     * Public Functions
     */

    function goToSpot(id) {
      vmParent.submit('/app/spotTab/' + id + '/spot');
    }
  }
}());
