(function () {
  'use strict';

  angular
    .module('app')
    .controller('NestTabController', NestTabController);

  NestTabController.$inject = ['$log', '$scope', '$state', 'MapViewFactory', 'SpotFactory'];

  function NestTabController($log, $scope, $state, MapViewFactory, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = undefined;
    vmParent.choices = undefined;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.childrenSpots = [];
    vm.getName = getName;
    vm.parentSpot = undefined;
    vm.goToMap = goToMap;
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

    function getName(spotId) {
      return SpotFactory.getNameFromId(spotId);
    }

    function goToMap() {
      if (_.has(vmParent.spot.properties, 'image_basemap')) {
        vmParent.submit('/app/image-basemaps/' + vmParent.spot.properties.image_basemap);
      }
      else {
        var center = SpotFactory.getCenter(vmParent.spot);
        var spotCenter = ol.proj.transform([center.lon, center.lat], 'EPSG:4326', 'EPSG:3857');
        MapViewFactory.setMapView(new ol.View({
          'center': spotCenter,
          'zoom': 16
        }));
        vmParent.submit('/app/map');
      }
    }

    function goToSpot(id) {
      vmParent.submit('/app/spotTab/' + id + '/spot');
    }
  }
}());
