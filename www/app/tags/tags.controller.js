(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsController', TagsController);

  TagsController.$inject = ['$ionicModal', '$ionicPopup', '$location', '$log', '$scope', '$state', 'DataModelsFactory',
  'HelpersFactory', 'LiveDBFactory', 'ProjectFactory', 'SpotFactory', 'TagFactory', 'IS_WEB'];

  function TagsController($ionicModal, $ionicPopup, $location, $log, $scope, $state, DataModelsFactory, HelpersFactory, 
    LiveDBFactory, ProjectFactory, SpotFactory, TagFactory, IS_WEB) {
    var vm = this;

    vm.allTags = [];
    vm.allTagsToDisplay = [];
    vm.isTagging = TagFactory.getActiveTagging();
    vm.selectedType = 'all';
    vm.setActiveTagsModal = {};
    vm.spotDisplay = [];
    vm.tagIdSelected = undefined;
    vm.tagText = '';

    vm.closeModal = closeModal;
    vm.deleteTag = deleteTag;
    vm.filterAllTagsType = filterAllTagsType;
    vm.getActiveTags = getActiveTags;
    vm.getLabel = getLabel;
    vm.getNumTaggedFeatures = getNumTaggedFeatures;
    vm.getSpotName = getSpotName;
    vm.getTagTypeLabel = getTagTypeLabel;
    vm.goToSpot = goToSpot;
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
        vm.allTags = ProjectFactory.getTags();
        vm.allTagsToDisplay = vm.allTags;
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
        if (vm.setActiveTagsModal) vm.setActiveTagsModal.remove();
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
      vm.tagText = vm.isTagging ? 'Continuous Tagging On' : 'Continuous Tagging Off';
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

    function deleteTag(tag) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Tag',
        'template': 'Are you sure you want to delete Tag ' + tag.name + '?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          TagFactory.removeActiveTag(tag.id);
          ProjectFactory.destroyTag(tag.id).then(function () {
            if (IS_WEB) {
              vm.tagIdSelected = undefined;
              $log.log('Delete tag from LiveDB.', ProjectFactory.getCurrentProject());
              LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
              $location.path('app/tags');
            }
            activate();
          });
        }
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

    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
    }

    function getNumTaggedFeatures(tag) {
      return TagFactory.getNumTaggedFeatures(tag);
    }

    function getSpotName(spot){
      return SpotFactory.getNameFromId(spot);
    }

    function getTagTypeLabel(type) {
      return TagFactory.getTagTypeLabel(type);
    }

    function goToTag(id) {
      vm.tagIdSelected = id;
      $location.path('/app/tags/' + id);
    }

    function goToSpot(spotId){
      vm.spotIdSelected = spotId;
      $location.path('/app/spotTab/' + spotId + '/spot');
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
