(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsController', TagsController);

  TagsController.$inject = ['$ionicModal', '$ionicPopover', '$ionicPopup', '$location', '$log', '$scope', '$state',
    'HelpersFactory', 'LiveDBFactory', 'ProjectFactory', 'TagFactory'];

  function TagsController($ionicModal, $ionicPopover, $ionicPopup, $location, $log, $scope, $state, HelpersFactory,
                          LiveDBFactory, ProjectFactory, TagFactory) {
    var vm = this;

    var isDelete = false;

    vm.allTags = [];
    vm.isTagging = TagFactory.getActiveTagging();
    vm.selectedType = 'all';
    vm.setActiveTagsModal = {};
    vm.tagIdSelected = undefined;
    vm.tagText = '';

    vm.closeModal = closeModal;
    vm.deleteAllTags = deleteAllTags;
    vm.deleteTag = deleteTag;
    vm.filterAllTagsType = filterAllTagsType;
    vm.getActiveTags = getActiveTags;
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getTagTypeLabel = getTagTypeLabel;
    vm.goToTag = goToTag;
    vm.newTag = newTag;
    vm.toggleActiveTagChecked = toggleActiveTagChecked;
    vm.toggleTagging = toggleTagging;
    vm.updateTags = updateTags;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if ($state.params && $state.params.tag_id) vm.tagIdSelected = $state.params.tag_id;

      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        loadActiveTagging();
        $log.log('Save project to LiveDB.', ProjectFactory.getCurrentProject());
        LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
        vm.allTags = ProjectFactory.getTags();
        vm.allTagsToDisplay = vm.allTags;
        createPopover();
      }

      _.each(vm.allTags, function (tag) {
        // Fix all old tags which have a categorization element
        if (tag.categorization) {
          tag.type = 'other';
          tag.other_type = tag.categorization;
          delete tag.categorization;
          ProjectFactory.saveTag(tag);
        }
      });

      $ionicModal.fromTemplateUrl('app/tags/set-active-tags-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.setActiveTagsModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.setActiveTagsModal.remove();
      });
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/tags/tags-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      // Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        vm.popover.remove();
      });
    }

    function loadActiveTagging() {
      if (vm.isTagging && _.isEmpty(TagFactory.getActiveTags())) {
        vm.isTagging = false;
        toggleTagging();
      }
      setTagToggleText();
    }

    function setTagToggleText() {
      vm.tagText = vm.isTagging ? 'Continuous Tagging On (Spot Level Only)' : 'Continuous Tagging Off (Spot Level Only)';
    }

    /**
     * Public Functions
     */

    function closeModal(modal) {
      vm[modal].hide();
      if (modal === 'setActiveTagsModal') {
        loadActiveTagging();
      }
    }

    function deleteAllTags() {
      vm.popover.hide();
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Tags',
        'template': 'Are you sure you want to delete <b>ALL</b> tags?'
      });
      confirmPopup.then(
        function (res) {
          if (res) {
            TagFactory.removeActiveTagging();
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
          TagFactory.removeActiveTag(tag.id);
          ProjectFactory.destroyTag(tag.id).then(function () {
            activate();
          });
        }
        isDelete = false;
      });
    }

    function filterAllTagsType() {
      vm.allTagsToDisplay = TagFactory.filterTagsByType(vm.selectedType, vm.allTags);
    }

    function getActiveTags() {
      var activeTags = TagFactory.getActiveTags();
      if (_.isEmpty(activeTags)) return '';
      var tagNames = _.map(activeTags, function (activeTag) {
        return activeTag.name;
      }).join(', ');
      return 'Active Tags: ' + tagNames;
    }

    function getNumTaggedFeatures(tag) {
      return TagFactory.getNumTaggedFeatures(tag);
    }

    function getTagTypeLabel(type) {
      return TagFactory.getTagTypeLabel(type);
    }

    function goToTag(id) {
      vm.tagIdSelected = id;
      if (!isDelete) $location.path('/app/tags/' + id);
    }

    function newTag() {
      var id = HelpersFactory.getNewId();
      vm.tagIdSelected = id;
      $location.path('/app/tags/' + id);
    }

    function toggleActiveTagChecked(inTag) {
      TagFactory.setActiveTags(inTag);
    }

    function toggleTagging() {
      TagFactory.setActiveTagging(vm.isTagging);
      if (vm.isTagging) {
        $log.log('Starting Tagging');
        TagFactory.clearActiveTags();
        setTagToggleText();
        vm.setActiveTagsModal.show();
      }
      else {
        setTagToggleText();
        $log.log('Adding spots to tag:', TagFactory.getActiveTags());
        TagFactory.clearActiveTags();
      }
    }

    function updateTags() {
      vm.allTags = ProjectFactory.getTags();
      vm.allTagsToDisplay = TagFactory.filterTagsByType(vm.selectedType, vm.allTags);
    }
  }
}());
