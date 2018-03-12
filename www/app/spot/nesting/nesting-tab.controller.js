(function () {
  'use strict';

  angular
    .module('app')
    .controller('NestingTabController', NestingTabController);

  NestingTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$rootScope', '$scope', '$state', 'FormFactory',
    'HelpersFactory', 'SpotFactory', 'IS_WEB'];

  function NestingTabController($ionicModal, $ionicPopup, $log, $rootScope, $scope, $state, FormFactory, HelpersFactory,
                                SpotFactory, IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.nestTab = vm;

    var thisTabName = 'nesting';

    vm.childrenSpots = [];
    vm.isNesting = SpotFactory.getActiveNesting();
    vm.hideContNesting = undefined;
    vm.nestText = '';
    vm.parentSpots = [];
    vm.spot = {};

    vm.goToSpot = goToSpot;
    vm.isiOS = isiOS;
    vm.stereonetSpots = stereonetSpots;
    vm.toggleNesting = toggleNesting;
    vm.updateNest = updateNest;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In NestingTabController');

      // Loading tab from Spots list
      if ($state.current.name === 'app.spotTab.' + thisTabName) loadTab($state);
      // Loading tab in Map side panel
      $scope.$on('load-tab', function (event, args) {
        if (args.tabName === thisTabName) {
          vmParent.saveSpot().finally(function () {
            vmParent.spotChanged = false;
            loadTab({
              'current': {'name': 'app.spotTab.' + thisTabName},
              'params': {'spotId': args.spotId}
            });
          });
        }
      });
    }

    function loadTab(state) {
      vmParent.loadTab(state);   // Need to load current state into parent

      FormFactory.setForm('surface_feature');

      vm.hideContNesting = !vmParent.spot.geometry;
      vm.isNesting = SpotFactory.getActiveNesting();
      vm.spot = vmParent.spot;

      if (vm.isNesting && _.isEmpty(SpotFactory.getActiveNest())) {
        vm.isNesting = false;
        toggleNesting();
      }
      setNestToggleText();
      updateNest();

      $ionicModal.fromTemplateUrl('app/shared/new-nest-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vmParent.newNestModal = modal;
      });
    }

    function getChildren(thisSpot) {
      var childrenSpots = [];
      if (thisSpot.properties.images) {
        var imageBasemaps = _.map(thisSpot.properties.images, function (image) {
          return image.id;
        });
        var imageBasemapChildrenSpots = _.filter(vmParent.spots, function (spot) {
          return _.contains(imageBasemaps, spot.properties.image_basemap);
        });
        childrenSpots.push(imageBasemapChildrenSpots);
      }
      if (thisSpot.properties.sed && thisSpot.properties.sed.strat_section) {
        var stratSectionChildrenSpots = _.filter(vmParent.spots, function (spot) {
          return thisSpot.properties.sed.strat_section.strat_section_id === spot.properties.strat_section_id;
        });
        childrenSpots.push(stratSectionChildrenSpots);
      }
      childrenSpots = _.flatten(childrenSpots);
      // Only non-point features can have children
      if (_.propertyOf(thisSpot.geometry)('type')) {
        if (_.propertyOf(thisSpot.geometry)('type') !== 'Point') {
          var otherSpots = _.reject(vmParent.spots, function (spot) {
            return spot.properties.id === thisSpot.properties.id || !spot.geometry;
          });
          _.each(otherSpots, function (spot) {
            if ((!thisSpot.properties.image_basemap && !spot.properties.image_basemap) ||
              (thisSpot.properties.image_basemap && spot.properties.image_basemap &&
                thisSpot.properties.image_basemap === spot.properties.image_basemap)) {
              // If Spot is a point and is inside thisSpot then Spot is a child
              if (_.propertyOf(spot.geometry)('type') === 'Point' &&
                (_.propertyOf(thisSpot.geometry)('type') === 'Polygon' ||
                  _.propertyOf(thisSpot.geometry)('type') === 'MutiPolygon')) {
                if (turf.inside(spot, thisSpot)) childrenSpots.push(spot);
              }
              // If Spot is not a point and all of its points are inside thisSpot then Spot is a child
              else if (_.propertyOf(thisSpot.geometry)('type') === 'Polygon' || _.propertyOf(thisSpot.geometry)(
                  'type') === 'MutiPolygon') {
                var points = turf.explode(spot);
                if (points.features) {
                  var pointsInside = [];
                  _.each(points.features, function (point) {
                    if (turf.inside(point, thisSpot)) pointsInside.push(point);
                  });
                  if (points.features.length === pointsInside.length) childrenSpots.push(spot);
                }
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
      if (thisSpot.properties.strat_section_id) {
        var parentStratSectionSpot = _.find(vmParent.spots, function (spot) {
          return _.find(spot.properties.sed, function (sed) {
            return sed.strat_section_id === thisSpot.properties.strat_section_id;
          });
        });
        parentSpots.push(parentStratSectionSpot);
      }
      parentSpots = _.flatten(parentSpots);
      var otherSpots = _.reject(vmParent.spots, function (spot) {
        return spot.properties.id === thisSpot.properties.id || !spot.geometry;
      });
      _.each(otherSpots, function (spot) {
        if ((!thisSpot.properties.image_basemap && !spot.properties.image_basemap) ||
          (thisSpot.properties.image_basemap && spot.properties.image_basemap &&
            thisSpot.properties.image_basemap === spot.properties.image_basemap)) {
          if (_.propertyOf(thisSpot.geometry)('type')) {
            if (_.propertyOf(thisSpot.geometry)('type') === 'Point') {
              // If thisSpot is a point and the point is inside a polygon Spot then that polygon Spot is a parent
              if (_.propertyOf(spot.geometry)('type') === 'Polygon' || _.propertyOf(spot.geometry)(
                  'type') === 'MutiPolygon') {
                if (turf.inside(thisSpot, spot)) parentSpots.push(spot);
              }
            }
            else {
              // If thisSpot is a line or polygon and all of its points are inside a feature then
              // that feature is a parent of this Spot
              var points = turf.explode(thisSpot);
              if (points.features) {
                if (_.propertyOf(spot.geometry)('type') === 'Polygon' || _.propertyOf(spot.geometry)(
                    'type') === 'MutiPolygon') {
                  var pointsInside = [];
                  _.each(points.features, function (point) {
                    if (turf.inside(point, spot)) pointsInside.push(point);
                  });
                  if (points.features.length === pointsInside.length) parentSpots.push(spot);
                }
              }
            }
          }
        }
      });
      return parentSpots;
    }

    function setNestToggleText() {
      vm.nestText = vm.isNesting ? 'Continuous Nesting On' : 'Continuous Nesting Off';
    }

    /**
     * Public Functions
     */

    function goToSpot(id) {
      vmParent.submit('/app/spotTab/' + id + '/nesting');
    }

    function isiOS() {
      return ionic.Platform.device().platform == "iOS";
    }

    function stereonetSpots(childrenSpots) {
      HelpersFactory.getStereonet(childrenSpots);
    }

    function toggleNesting() {
      SpotFactory.setActiveNesting(vm.isNesting);
      if (vm.isNesting) {
        $log.log('Starting Nesting');
        SpotFactory.clearActiveNest();
        setNestToggleText();
        vmParent.data = {};
        vmParent.newNestProperties = {};
        vmParent.newNestModal.show();
      }
      else {
        setNestToggleText();
        var activeNest = SpotFactory.getActiveNest();
        SpotFactory.clearActiveNest();
        if (_.isEmpty(activeNest)) {
          $ionicPopup.alert({
            'title': 'Empty Nest!',
            'template': 'No Spots were added to the Nest.'
          });
        }
      }
    }

    function updateNest() {
      vm.parentSpots = getParents(vmParent.spot);
      vm.childrenSpots = getChildren(vmParent.spot);
      if (IS_WEB && $state.current.name === 'app.map') $rootScope.$broadcast('updateFeatureLayer');
      else if (IS_WEB && $state.current.name === 'app.image-basemaps.image-basemap') {
        $rootScope.$broadcast('updateFeatureLayer');
      }
    }
  }
}());
