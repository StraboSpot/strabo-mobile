(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsTabController', TagsTabController);

  TagsTabController.$inject = ['$ionicModal', '$log', '$scope', '$state', 'HelpersFactory', 'TagFactory'];

  function TagsTabController($ionicModal, $log, $scope, $state, HelpersFactory, TagFactory) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'tags';

    vm.isTagging = TagFactory.getActiveTagging();
    vm.setActiveTagsModal = {};
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

    function loadTab(state) {
      vmParent.loadTab(state);  // Need to load current state into parent
      loadActiveTagging();

      $ionicModal.fromTemplateUrl('app/spot/tags/set-active-tags-modal.html', {
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
        TagFactory.addToActiveTags(vmParent.spot.properties.id);
        loadActiveTagging();
      }
    }

    function createNewActiveTag() {
      TagFactory.setAddNewActiveTag(true);
      createTag();
    }

    function createTag() {
      vm.setActiveTagsModal.hide();
      var id = HelpersFactory.getNewId();
      vmParent.submit('/app/tags/' + id);
    }

    function getActiveTags() {
      var activeTags = TagFactory.getActiveTags();
      if (_.isEmpty(activeTags)) return '';
      var tagNames = _.map(activeTags, function (activeTag) {
        return activeTag.name;
      }).join(', ');
      return 'Active Tags: ' + tagNames;
    }

    function toggleActiveTagChecked(inTag) {
      TagFactory.setActiveTags(inTag);
    }

    function toggleTagging() {
      vmParent.filterAllTagsType();
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
  }
}());
