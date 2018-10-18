(function () {
  'use strict';

  angular
    .module('app')
    .factory('TagFactory', TagFactory);

  TagFactory.$inject = ['$ionicModal', '$log', '$q', 'ProjectFactory'];

  function TagFactory($ionicModal, $log, $q, ProjectFactory) {
    var addNewActiveTag = false;
    var activeTags = [];
    var isActiveTagging = false;
    var tagTypeLabels = {};
    var isMineralTag = false;

    activate();

    return {
      'addToActiveTags': addToActiveTags,
      'clearActiveTags': clearActiveTags,
      'createMineralsTagModal': createMineralsTagModal,
      'filterTagsByType': filterTagsByType,
      'getActiveTagging': getActiveTagging,
      'getActiveTags': getActiveTags,
      'getAddNewActiveTag': getAddNewActiveTag,
      'getGeologicUnits': getGeologicUnits,
      'getIsMineralsTag': getIsMineralsTag,
      'getNumTaggedFeatures': getNumTaggedFeatures,
      'getTagTypeLabel': getTagTypeLabel,
      'removeActiveTag': removeActiveTag,
      'removeActiveTagging': removeActiveTagging,
      'setActiveTagging': setActiveTagging,
      'setActiveTags': setActiveTags,
      'setAddNewActiveTag': setAddNewActiveTag,
      'setIsMineralsTag': setIsMineralsTag
    };

    /**
     * Private Functions
     */

    function activate() {
      tagTypeLabels = {
        'geologic_unit': 'Geologic Unit',
        'relationship': 'Relationship',
        'documentation': 'Documentation',
        'geological_structure': 'Geological Structure',
        'marker_layer': 'Marker Layer',
        'other': 'Other',
        'concept': 'Concept',
        'rosetta': 'Rosetta',
        'experimental_apparatus': 'Experimental Apparatus'
      };
    }

    /**
     * Public Functions
     */

    function addToActiveTags(spotId) {
      _.each(activeTags, function (activeTag) {
        if (!_.contains(activeTag.spots, spotId)) {
          if (!activeTag.spots) activeTag.spots = [];
          activeTag.spots.push(spotId);
          ProjectFactory.saveTag(activeTag);
        }
      });
    }

    function clearActiveTags() {
      activeTags = [];
      $log.log('Cleared active tag:', activeTags);
    }

    function createMineralsTagModal(scope) {
      return $ionicModal.fromTemplateUrl('app/tag/minerals-modal.html', {
        'scope': scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        return modal;
      });
    }

    function filterTagsByType(selectedType, allTags) {
      if (selectedType === 'all') return allTags;
      else {
        return _.filter(allTags, function (tag) {
          return tag.type === selectedType;
        });
      }
    }

    function getGeologicUnits() {
      var tags = ProjectFactory.getTags();
      return _.filter(tags, function (tag) {
        return tag.type === 'geologic_unit';
      });
    }

    function getActiveTags() {
      return activeTags;
    }

    function getActiveTagging() {
      return isActiveTagging;
    }

    function getAddNewActiveTag() {
      return addNewActiveTag;
    }

    function getIsMineralsTag() {
      return isMineralTag;
    }

    function getNumTaggedFeatures(tag) {
      var count = 0;
      if (tag && tag.features) {
        _.each(tag.features, function (featuresList) {
          count += featuresList.length;
        });
      }
      return count;
    }

    function getTagTypeLabel(inType) {
      return tagTypeLabels[inType];
    }

    function removeActiveTag(activeTagId) {
      activeTags = _.reject(activeTags, function (activeTag) {
        return activeTag.id === activeTagId;
      });
      if (_.isEmpty(activeTags)) isActiveTagging = false;
    }

    function removeActiveTagging() {
      activeTags = [];
      isActiveTagging = false;
    }

    function setActiveTags(inTag) {
      var found = _.find(activeTags, function (activeTag) {
        return activeTag.id === inTag.id;
      });
      if (!found) activeTags.push(inTag);
      else {
        activeTags = _.reject(activeTags, function (activeTag) {
          return activeTag.id === inTag.id;
        });
      }
      $log.log('Active Tags:', activeTags);
    }

    function setActiveTagging(inTagging) {
      isActiveTagging = inTagging;
    }

    function setAddNewActiveTag(inBool) {
      addNewActiveTag = inBool;
    }

    function setIsMineralsTag(inBool) {
      isMineralTag = inBool;
    }
  }
}());
