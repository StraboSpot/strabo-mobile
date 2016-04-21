(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagsTabController', TagsTabController);

  TagsTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state', 'ProjectFactory'];

  function TagsTabController($ionicModal, $ionicPopup, $log, $scope, $state, ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    var isDelete = false;

    vm.closeModal = closeModal;
    vm.addTag = addTag;
    vm.goToTag = goToTag;
    vm.isOptionChecked = isOptionChecked;
    vm.removeTag = removeTag;
    vm.tags = [];
    vm.toggleChecked = toggleChecked;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In TagsTabController');
      vm.tags = ProjectFactory.getTagsBySpotId(vmParent.spot.properties.id);
      vm.allTags = ProjectFactory.getTags();
      $log.log('Tags for this Spot:', vm.tags);

      $ionicModal.fromTemplateUrl('app/spot/add-tag-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.addTagModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.addTagModal.remove();
      });
    }

    /**
     * Public Functions
     */

    function addTag() {
      vm.addTagModal.show();
    }

    function closeModal(modal) {
      vm[modal].hide();
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
  }
}());
