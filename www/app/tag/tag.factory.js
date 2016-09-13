(function () {
  'use strict';

  angular
    .module('app')
    .factory('TagFactory', TagFactory);

  TagFactory.$inject = ['$log', '$q'];

  function TagFactory($log, $q) {
    var tagTypeLabels = {};

    activate();

    return {
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

    function getTagTypeLabel(inType) {
      return tagTypeLabels[inType];
    }
  }
}());
