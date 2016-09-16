(function () {
  'use strict';

  angular
    .module('app')
    .factory('TagFactory', TagFactory);

  TagFactory.$inject = ['$log', '$q', 'ProjectFactory'];

  function TagFactory($log, $q, ProjectFactory) {
    var tagTypeLabels = {};

    activate();

    return {
      'filterTagsByType': filterTagsByType,
      'getGeologicUnits': getGeologicUnits,
      'getNumTaggedFeatures': getNumTaggedFeatures,
      'getTagTypeLabel': getTagTypeLabel
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
        'concept': 'Concept'
      }
    }

    /**
     * Public Functions
     */

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
      })
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
  }
}());
