(function () {
  'use strict';

  angular
    .module('app')
    .controller('NestTabController', NestTabController);

  NestTabController.$inject = ['$location', '$log', '$scope', '$state', 'SpotFactory'];

  function NestTabController($location, $log, $scope, $state, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = undefined;
    vmParent.choices = undefined;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.childrenSpots = [];
    vm.goToSpot = goToSpot;
    vm.isNesting = SpotFactory.getActiveNesting();
    vm.hideContNesting = !vmParent.spot.geometry;
    vm.nestText = '';
    vm.parentSpots = [];
    vm.spot = vmParent.spot;
    vm.toggleNesting = toggleNesting;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In NestTabController');

      if (vm.isNesting && _.isEmpty(SpotFactory.getActiveNest())) {
        vm.isNesting = false;
        toggleNesting();
      }
      setNestToggleText();

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
      if (_.propertyOf(thisSpot.geometry)('type')) {
        if (_.propertyOf(thisSpot.geometry)('type') !== 'Point') {
          var otherSpots = _.reject(vmParent.spots, function (spot) {
            return spot.properties.id === thisSpot.properties.id || !spot.geometry;
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
          return spot.properties.id === thisSpot.properties.id || !spot.geometry;
        });
        if (_.propertyOf(thisSpot.geometry)('type')) {
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
      }
      return parentSpots;
    }

    function setNestToggleText() {
      vm.nestText = vm.isNesting ? 'Continuous Nesting On' : 'Continuous Nesting Off';
    }

    /**
     * Public Functions
     */

    function goToSpot(id) {
      vmParent.submit('/app/spotTab/' + id + '/nest');
    }

    function toggleNesting() {
      SpotFactory.setActiveNesting(vm.isNesting);
      if (vm.isNesting) {
        $log.log('Starting Nesting');
        SpotFactory.clearActiveNest();
        setNestToggleText();
        SpotFactory.addSpotToActiveNest(vm.spot);
      }
      else {
        setNestToggleText();
        var activeNest = SpotFactory.getActiveNest();
        SpotFactory.clearActiveNest();
        $log.log('Adding spots to nest:', activeNest);
        var fc = turf.featureCollection(activeNest);
        var newSpot = turf.envelope(fc);
        // turf.envelope doesn't seem to include any points that are also vertices when
        // it creates the envelope rectangle so make the rectangle a little bit bigger
        if (newSpot.geometry && newSpot.geometry.coordinates) {
          _.each(newSpot.geometry.coordinates, function (rectCoords) {
            rectCoords[0][0] = rectCoords[0][0] - .0001; // bottom left
            rectCoords[0][1] = rectCoords[0][1] - .0001;
            rectCoords[1][0] = rectCoords[1][0] + .0001; // bottom right
            rectCoords[1][1] = rectCoords[1][1] - .0001;
            rectCoords[2][0] = rectCoords[2][0] + .0001; // upper right
            rectCoords[2][1] = rectCoords[2][1] + .0001;
            rectCoords[3][0] = rectCoords[3][0] - .0001; // upper left
            rectCoords[3][1] = rectCoords[3][1] + .0001;
            rectCoords[4] = rectCoords[0];
          });
        }
        SpotFactory.setNewSpot(newSpot).then(function (id) {
          $location.path('/app/spotTab/' + id + '/spot');
        });
      }
    }
  }
}());
