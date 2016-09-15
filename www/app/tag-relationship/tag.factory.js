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
      'getGeologicUnits': getGeologicUnits,
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

    function getGeologicUnits() {
      var tags = ProjectFactory.getTags();
      return _.filter(tags, function (tag) {
        return tag.type === 'geologic_unit';
      })
    }

    function getTagTypeLabel(inType) {
      return tagTypeLabels[inType];
    }
  }
}());
