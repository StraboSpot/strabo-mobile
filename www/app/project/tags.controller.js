(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsController', TagsController);

  TagsController.$inject = ['$ionicPopover', '$ionicPopup', '$location', '$log', '$scope', 'DataModelsFactory',
    'HelpersFactory', 'ProjectFactory'];

  function TagsController($ionicPopover, $ionicPopup, $location, $log, $scope, DataModelsFactory, HelpersFactory,
                          ProjectFactory) {
    var vm = this;

    var isDelete = false;

    vm.deleteAllTags = deleteAllTags;
    vm.deleteTag = deleteTag;
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getTagTypeLabel = getTagTypeLabel;
    vm.goToTag = goToTag;
    vm.newTag = newTag;
    vm.tags = [];

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        vm.tags = ProjectFactory.getTags();
        createPopover();
      }
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/project/tags-popover.html', {
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

    function deleteAllTags() {
      vm.popover.hide();
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Tags',
        'template': 'Are you sure you want to delete <b>ALL</b> tags?'
      });
      confirmPopup.then(
        function (res) {
          if (res) {
            ProjectFactory.destroyTags().then(function () {
              activate();
            });
          }
        }
      );
    }

    function deleteTag(tag) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Tag',
        'template': 'Are you sure you want to delete Tag ' + tag.name + '?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.destroyTag(tag.id).then(function () {
            activate();
          });
        }
        isDelete = false;
      });
    }

    function getNumTaggedFeatures(tag) {
      return ProjectFactory.getNumTaggedFeatures(tag);
    }

    function getTagTypeLabel(type) {
      return DataModelsFactory.getTagTypeLabel(type);
    }

    function goToTag(id) {
      if (!isDelete) $location.path('/app/tags/' + id);
    }

    function newTag() {
      var id = HelpersFactory.newId();
      $location.path('/app/tags/' + id);
    }
  }
}());
