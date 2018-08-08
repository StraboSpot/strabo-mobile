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

    vm.childGenerations = [];
    vm.childGenerationsFlattened = [];
    vm.isNesting = SpotFactory.getActiveNesting();
    vm.hideContNesting = undefined;
    vm.nestText = '';
    vm.parentGenerations = [];
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

    function getChildren(spots) {
      var allChildrenSpots = [];
      _.each(spots, function (spot) {
        var childrenSpots = SpotFactory.getChildrenSpots(spot);
        if (!_.isEmpty(childrenSpots)) allChildrenSpots.push(childrenSpots);
      });
      return _.flatten(allChildrenSpots);
    }

    function getParents(spots) {
      var allParentSpots = [];
      _.each(spots, function (spot) {
        var parentSpots = SpotFactory.getParentSpots(spot);
        if (!_.isEmpty(parentSpots)) allParentSpots.push(parentSpots);
      });
      return _.flatten(allParentSpots);
    }

    function updateNest() {
      var parentSpots = [vmParent.spot];
      _.times(5, function (i) {
        parentSpots = getParents(parentSpots);
        if (!_.isEmpty(parentSpots)) vm.parentGenerations.push(parentSpots);
      });
      $log.log('parentGenerations', vm.parentGenerations);

      var childSpots = [vmParent.spot];
      _.times(5, function (i) {
        childSpots = getChildren(childSpots);
        if (!_.isEmpty(childSpots)) vm.childGenerations.push(childSpots);
      });
      $log.log('childGenerations', vm.childGenerations);

      vm.childGenerationsFlattened = _.flatten(vm.childGenerations);

      if (IS_WEB && $state.current.name === 'app.map') $rootScope.$broadcast('updateMapFeatureLayer');
      else if (IS_WEB && $state.current.name === 'app.image-basemaps.image-basemap') {
        $rootScope.$broadcast('updateImageBasemapFeatureLayer');
      }
      else if ($state.current.name === 'app.strat-sections.strat-section') {
        $rootScope.$broadcast('updateStratSectionFeatureLayer');
      }
    }
  }
}());
