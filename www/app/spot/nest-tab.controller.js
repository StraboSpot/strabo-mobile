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
    vm.parentSpots = [];
    vm.goToSpot = goToSpot;
    vm.spot = vmParent.spot;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In NestTabController');

      vm.parentSpots = getParents(vmParent.spot);
      vm.childrenSpots = getChildren(vmParent.spot);
    }

    function getChildren(thisSpot) {
      var childrenSpots = [];
      if (thisSpot.properties.images) {
        var imageBasemaps = _.map(thisSpot.properties.images, function (image) {
          return image.id;
        });
        childrenSpots = _.filter(vmParent.spots, function (spot) {
          return _.contains(imageBasemaps, spot.properties.image_basemap);
        });
      }
      // Only non-point features can have children
      if (_.propertyOf(thisSpot.geometry)('type') !== 'Point') {
        var otherSpots = _.reject(vmParent.spots, function (spot) {
          return spot.properties.id === thisSpot.properties.id;
        });
        _.each(otherSpots, function (spot) {
          // If Spot is a point and is inside thisSpot then Spot is a child
          if (_.propertyOf(spot.geometry)('type') === 'Point') {
            if (turf.inside(spot, thisSpot)) childrenSpots.push(spot);
          }
          // If Spot is not a point and all of its points are inside thisSpot then Spot is a child
          else {
            var points = turf.explode(spot);
            if (points.features) {
              var pointsInside = [];
              _.each(points.features, function (point) {
                if (turf.inside(point, thisSpot)) pointsInside.push(point);
              });
              if (points.features.length === pointsInside.length) childrenSpots.push(spot);
            }
          }
        });
      }
      return childrenSpots;
    }

    function getParents(thisSpot) {
      var parentSpots = [];
      if (thisSpot.properties.image_basemap) {
        var parentImageBasemapSpot = _.find(vmParent.spots, function (spot) {
          return _.find(spot.properties.images, function (image) {
            return image.id === thisSpot.properties.image_basemap;
          });
        });
        parentSpots.push(parentImageBasemapSpot);
      }
      else {
        var otherSpots = _.reject(vmParent.spots, function (spot) {
          return spot.properties.id === thisSpot.properties.id;
        });
        if (_.propertyOf(thisSpot.geometry)('type') === 'Point') {
          // If thisSpot is a point and the point is inside a polygon Spot then that polygon Spot is a parent
          _.each(otherSpots, function (spot) {
            if (_.propertyOf(spot.geometry)('type') === 'Polygon' || _.propertyOf(spot.geometry)(
                'type') === 'MutiPolygon') {
              if (turf.inside(thisSpot, spot)) parentSpots.push(spot);
            }
          });
        }
        else {
          // If thisSpot is a line or polygon and all of its points are inside a feature then
          // that feature is a parent of this Spot
          var points = turf.explode(thisSpot);
          if (points.features) {
            _.each(otherSpots, function (spot) {
              if (_.propertyOf(spot.geometry)('type') !== 'Point') {
                var pointsInside = [];
                _.each(points.features, function (point) {
                  if (turf.inside(point, spot)) pointsInside.push(point);
                });
                if (points.features.length === pointsInside.length) parentSpots.push(spot);
              }
            });
          }
        }
      }
      return parentSpots;
    }

    /**
     * Public Functions
     */

    function goToSpot(id) {
      vmParent.submit('/app/spotTab/' + id + '/nest');
    }
  }
}());
