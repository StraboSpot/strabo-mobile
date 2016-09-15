(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsTabController', TagsTabController);

  TagsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'HelpersFactory',
    'ProjectFactory', 'TagFactory'];

  function TagsTabController($ionicModal, $ionicPopup, $log, $scope, $state, HelpersFactory, ProjectFactory,
                             TagFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.isTagging = ProjectFactory.getActiveTagging();
    vm.tagText = '';

    vm.closeModal = closeModal;
    vm.createNewActiveTag = createNewActiveTag;
    vm.createTag = createTag;
    vm.getActiveTags = getActiveTags;
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
        'backdropClickToClose': false
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
      vm.tagText = vm.isTagging ? 'Continuous Tagging On (Spot Level Only)' : 'Continuous Tagging Off (Spot Level Only)';
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
      var id = HelpersFactory.getNewId();
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
