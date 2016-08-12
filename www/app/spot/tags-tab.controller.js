(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsTabController', TagsTabController);

  TagsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'HelpersFactory',
    'ProjectFactory'];

  function TagsTabController($ionicModal, $ionicPopup, $log, $scope, $state, HelpersFactory, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    var isDelete = false;

    vm.addTag = addTag;
    vm.closeModal = closeModal;
    vm.createNewActiveTag = createNewActiveTag;
    vm.createTag = createTag;
    vm.getActiveTags = getActiveTags;
    vm.goToTag = goToTag;
    vm.tagText = '';
    vm.isOptionChecked = isOptionChecked;
    vm.isTagging = ProjectFactory.getActiveTagging();
    vm.removeTag = removeTag;
    vm.tags = [];
    vm.toggleActiveTagChecked = toggleActiveTagChecked;
    vm.toggleChecked = toggleChecked;
    vm.toggleTagging = toggleTagging;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In TagsTabController');
      vm.tags = ProjectFactory.getTagsBySpotId(vmParent.spot.properties.id);
      vm.allTags = ProjectFactory.getTags();
      $log.log('Tags for this Spot:', vm.tags);
      setTagToggleText();

      $ionicModal.fromTemplateUrl('app/spot/add-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.addTagModal = modal;
      });

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
        vm.addTagModal.remove();
        vm.setActiveTagsModal.remove();
      });
    }

    function setTagToggleText() {
      vm.tagText = vm.isTagging ? 'Continuous Tagging On' : 'Continuous Tagging Off';
    }

    /**
     * Public Functions
     */

    function addTag() {
      vm.addTagModal.show();
    }

    function closeModal(modal) {
      vm[modal].hide();
      if (modal === 'setActiveTagsModal') {
        ProjectFactory.addToActiveTags(vmParent.spot.properties.id);
        activate();
      }
    }

    function createNewActiveTag() {
      ProjectFactory.setAddNewActiveTag(true);
      createTag();
    }

    function createTag() {
      vm.setActiveTagsModal.hide();
      vm.addTagModal.hide();
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

    function goToTag(id) {
      if (!isDelete) vmParent.submit('/app/tags/' + id);
    }

    function isOptionChecked(tag) {
      if (tag.spots) return tag.spots.indexOf(vmParent.spot.properties.id) !== -1;
      return false;
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
            vm.tags = ProjectFactory.getTagsBySpotId(vmParent.spot.properties.id);
            $log.log('Tags for this Spot:', vm.tags);
          });
        }
        isDelete = false;
      });
    }

    function toggleChecked(tag) {
      if (!tag.spots) tag.spots = [];
      var i = tag.spots.indexOf(vmParent.spot.properties.id);
      if (i === -1) tag.spots.push(vmParent.spot.properties.id);
      else tag.spots.splice(i, 1);
      ProjectFactory.saveTag(tag).then(function () {
        vm.tags = ProjectFactory.getTagsBySpotId(vmParent.spot.properties.id);
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
