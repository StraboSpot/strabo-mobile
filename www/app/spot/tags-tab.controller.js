(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsTabController', TagsTabController);

  TagsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory',
    'HelpersFactory', 'ProjectFactory'];

  function TagsTabController($ionicModal, $ionicPopup, $log, $scope, $state, DataModelsFactory, HelpersFactory,
                             ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    var isDelete = false;

    vm.closeModal = closeModal;
    vm.createNewActiveTag = createNewActiveTag;
    vm.createTag = createTag;
    vm.getActiveTags = getActiveTags;
    vm.getTagTypeLabel = getTagTypeLabel;
    vm.goToTag = goToTag;
    vm.tagText = '';
    vm.isTagging = ProjectFactory.getActiveTagging();
    vm.removeTag = removeTag;
    vm.removeTagFromFeatures = removeTagFromFeatures;
    vm.toggleActiveTagChecked = toggleActiveTagChecked;
    vm.toggleTagging = toggleTagging;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In TagsTabController');
      loadActiveTagging();

      $ionicModal.fromTemplateUrl('app/spot/set-active-tags-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.setActiveTagsModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.setActiveTagsModal.remove();
      });
    }

    function loadActiveTagging() {
      if (vm.isTagging && _.isEmpty(ProjectFactory.getActiveTags())) {
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
        ProjectFactory.addToActiveTags(vmParent.spot.properties.id);
        loadActiveTagging();
      }
    }

    function createNewActiveTag() {
      ProjectFactory.setAddNewActiveTag(true);
      createTag();
    }

    function createTag() {
      vm.setActiveTagsModal.hide();
      var id = HelpersFactory.newId();
      vmParent.submit('/app/tags/' + id);
    }

    function getActiveTags() {
      var activeTags = ProjectFactory.getActiveTags();
      if (_.isEmpty(activeTags)) return '';
      var tagNames = _.map(activeTags, function (activeTag) {
        return activeTag.name;
      }).join(', ');
      return 'Active Tags: ' + tagNames;
    }

    function getTagTypeLabel(type) {
      return DataModelsFactory.getTagTypeLabel(type);
    }

    function goToTag(id) {
      if (!isDelete) vmParent.submit('/app/tags/' + id);
    }

    function removeTag(tag) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Remove Tag',
        'template': 'Are you sure you want to remove the tag ' + tag.name + ' from this Spot? This will <b>not</b> delete the tag itself.'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.removeTagFromSpot(tag.id, vmParent.spot.properties.id).then(function () {
            vmParent.loadTags();
            loadActiveTagging();
          });
        }
        isDelete = false;
      });
    }

    function removeTagFromFeatures(tag) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Remove Tag From Features',
        'template': 'Are you sure you want to remove the tag ' + tag.name + ' from ALL features in this Spot? This will <b>not</b> delete the tag itself.'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.removeTagFromFeatures(tag.id, vmParent.spot.properties.id).then(function () {
            vmParent.loadTags();
            loadActiveTagging();
          });
        }
        isDelete = false;
      });
    }

    function toggleActiveTagChecked(inTag) {
      ProjectFactory.setActiveTags(inTag);
    }

    function toggleTagging() {
      ProjectFactory.setActiveTagging(vm.isTagging);
      if (vm.isTagging) {
        $log.log('Starting Tagging');
        ProjectFactory.clearActiveTags();
        setTagToggleText();
        vm.setActiveTagsModal.show();
      }
      else {
        setTagToggleText();
        $log.log('Adding spots to tag:', ProjectFactory.getActiveTags());
        ProjectFactory.clearActiveTags();
      }
    }
  }
}());
