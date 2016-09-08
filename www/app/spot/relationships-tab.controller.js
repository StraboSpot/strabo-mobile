(function () {
  'use strict';

  angular
    .module('app')
    .controller('RelationshipsTabController', RelationshipsTabController);

  RelationshipsTabController.$inject = ['$log', '$scope', '$state', 'HelpersFactory', 'ProjectFactory'];

  function RelationshipsTabController($log, $scope, $state, HelpersFactory, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.addToRelationship = addToRelationship;
    vm.createRelationship = createRelationship;
    vm.goToRelationship = goToRelationship;
    vm.relationships = [];

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In RelationshipsTabController');
      gatherRelevantRelationships();
    }

    function gatherRelevantRelationships() {
      var allRelationships = ProjectFactory.getRelationships();
      _.each(allRelationships, function (relationship) {
        var found = false;
        if ((relationship.a && relationship.a.spots && _.contains(relationship.a.spots, vmParent.spot.properties.id)) ||
          (relationship.b && relationship.b.spots && _.contains(relationship.b.spots, vmParent.spot.properties.id))) {
          found = true;
        }
        if (!found && relationship.a && relationship.a.features) {
          if (_.contains(_.allKeys(relationship.a.features), String(vmParent.spot.properties.id))) found = true;
        }
        if (!found && relationship.b && relationship.b.features) {
          if (_.contains(_.allKeys(relationship.b.features), String(vmParent.spot.properties.id))) found = true;
        }
        if (found) vm.relationships.push(relationship);
      });
    }

    /**
     * Public Functions
     */

    function addToRelationship() {
      vmParent.submit('/app/relationships');
    }

    function createRelationship() {
      var id = HelpersFactory.newId();
      vmParent.submit('/app/relationships/' + id);
    }

    function goToRelationship(id) {
      vmParent.submit('/app/relationships/' + id);
    }
  }
}());
