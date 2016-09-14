(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsController', TagsController);

  TagsController.$inject = ['$ionicPopover', '$ionicPopup', '$location', '$log', '$scope', 'DataModelsFactory',
    'HelpersFactory', 'ProjectFactory', 'TagFactory'];

  function TagsController($ionicPopover, $ionicPopup, $location, $log, $scope, DataModelsFactory, HelpersFactory,
                          ProjectFactory, TagFactory) {
    var vm = this;

    var isDelete = false;

    vm.selectedType = 'all';
    vm.tags = [];

    vm.deleteAllTags = deleteAllTags;
    vm.deleteTag = deleteTag;
    vm.filterTagType = filterTagType;
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getTagTypeLabel = getTagTypeLabel;
    vm.goToTag = goToTag;
    vm.newTag = newTag;
    vm.filterTagType = filterTagType;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        vm.tags = ProjectFactory.getTags();
        vm.tagsToDisplay = vm.tags;
        createPopover();
      }

      _.each(vm.tags, function (tag) {
        // Fix all old tags which have a categorization element
        if (tag.categorization) {
          tag.type = 'other';
          tag.other_type = tag.categorization;
          delete tag.categorization;
          ProjectFactory.saveTag(tag);
        }
      })
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

    function filterTagType() {
      if (vm.selectedType === 'all') vm.tagsToDisplay = vm.tags;
      else {
        vm.tagsToDisplay = _.filter(vm.tags, function (tag) {
          return tag.type === vm.selectedType;
        });
      }
    }

    function getNumTaggedFeatures(tag) {
      return ProjectFactory.getNumTaggedFeatures(tag);
    }

    function getTagTypeLabel(type) {
      return TagFactory.getTagTypeLabel(type);
    }

    function goToTag(id) {
      if (!isDelete) $location.path('/app/tags/' + id);
    }

    function newTag() {
      var id = HelpersFactory.getNewId();
      $location.path('/app/tags/' + id);
    }
  }
}());
