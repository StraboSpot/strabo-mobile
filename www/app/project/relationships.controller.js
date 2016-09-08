(function () {
  'use strict';

  angular
    .module('app')
    .controller('RelationshipsController', RelationshipsController);

  RelationshipsController.$inject = ['$ionicPopover', '$ionicPopup', '$location', '$scope', 'HelpersFactory',
    'ProjectFactory'];

  function RelationshipsController($ionicPopover, $ionicPopup, $location, $scope, HelpersFactory, ProjectFactory) {
    var vm = this;

    var isDelete = false;

    vm.deleteAllRelationships = deleteAllRelationships;
    vm.deleteRelationship = deleteRelationship;
    vm.goToRelationship = goToRelationship;
    vm.newRelationship = newRelationship;
    vm.relationships = [];

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        vm.relationships = ProjectFactory.getRelationships();
        createPopover();
      }
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/project/relationships-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      // Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        vm.popover.remove();
      });
    }

    /**
     * Public Functions
     */

    function deleteAllRelationships() {
      vm.popover.hide();
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Relationships',
        'template': 'Are you sure you want to delete <b>ALL</b> relationships?'
      });
      confirmPopup.then(
        function (res) {
          if (res) {
            ProjectFactory.destroyRelationships().then(function () {
              activate();
            });
          }
        }
      );
    }

    function deleteRelationship(relationship) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Relationship',
        'template': 'Are you sure you want to delete Relationships ' + relationship.name + '?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.destroyRelationship(relationship.id).then(function () {
            activate();
          });
        }
        isDelete = false;
      });
    }

    function goToRelationship(id) {
      if (!isDelete) $location.path('/app/relationships/' + id);
    }

    function newRelationship() {
      var id = HelpersFactory.newId();
      $location.path('/app/relationships/' + id);
    }
  }
}());
