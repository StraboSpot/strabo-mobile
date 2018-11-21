(function () {
  'use strict';

  angular
    .module('app')
    .controller('RelationshipsTabController', RelationshipsTabController);

  RelationshipsTabController.$inject = ['$log', '$scope', '$state', 'ProjectFactory'];

  function RelationshipsTabController($log, $scope, $state, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'relationships';

    vm.featureLevelRelationships = [];
    vm.spotLevelRelationships = [];

    vm.goToRelationship = goToRelationship;
    vm.goToRelationships = goToRelationships;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In RelationshipsTabController');

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

    function loadTab (state) {
      vmParent.loadTab(state);  // Need to load current state into parent
      if (vmParent.spot && !_.isEmpty(vmParent.spot)) loadRelationships();
    }

    function loadRelationships() {
      var relationships = ProjectFactory.getRelationshipsBySpotId(vmParent.spot.properties.id);

      _.each(relationships, function (relationship) {
        if (relationship.a && relationship.a.spots && _.contains(relationship.a.spots, vmParent.spot.properties.id)) {
          if (!_.contains(vm.spotLevelRelationships, relationship)) vm.spotLevelRelationships.push(relationship);
        }
        if (relationship.a && relationship.a.features && relationship.a.features[vmParent.spot.properties.id]) {
          vm.featureLevelRelationships = _.reject(vm.featureLevelRelationships, function (featureLevelRelationship) {
            return featureLevelRelationship.id === relationship.id;
          });
          vm.featureLevelRelationships.push(relationship);
        }
        if (relationship.b && relationship.b.spots && _.contains(relationship.b.spots, vmParent.spot.properties.id)) {
          if (!_.contains(vm.spotLevelRelationships, relationship)) vm.spotLevelRelationships.push(relationship);
        }
        if (relationship.b && relationship.b.features && relationship.b.features[vmParent.spot.properties.id]) {
          vm.featureLevelRelationships = _.reject(vm.featureLevelRelationships, function (featureLevelRelationship) {
            return featureLevelRelationship.id === relationship.id;
          });
          vm.featureLevelRelationships.push(relationship);
        }
      });
    }

    /**
     * Public Functions
     */

    function goToRelationship(id) {
      vmParent.submit('/app/relationships/' + id);
    }

    function goToRelationships() {
      vmParent.submit('/app/relationships');
    }
  }
}());
