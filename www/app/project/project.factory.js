(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function ProjectFactory($log, $q, LocalStorageFactory) {
    var project = {};

    activate();

    return {
      'all': all,
      'getProject': getProject,
      'getProjectName': getProjectName,
      'getSpotNumber': getSpotNumber,
      'getSpotPrefix': getSpotPrefix,
      'incrementSpotNumber': incrementSpotNumber,
      'save': save
    };

    /**
     * Private Functions
     */

    function activate() {
      $log.log('Loading project properties ....');
      all().then(function (inProject) {
        project = inProject;
        $log.log('Finished loading project properties: ', project);
      });
    }

    /**
     * Public Functions
     */

    // Load all project properties from local storage
    function all() {
      var deferred = $q.defer(); // init promise
      var config = {};

      LocalStorageFactory.projectDb.iterate(function (value, key) {
        config[key] = value;
      }, function () {
        deferred.resolve(config);
      });
      return deferred.promise;
    }

    function getProject() {
      return project;
    }

    function getProjectName() {
      return project.project_name;
    }

    function getSpotPrefix() {
      return project.spot_prefix;
    }

    function getSpotNumber() {
      return project.starting_number_for_spot;
    }

    // Increment starting spot number by 1
    function incrementSpotNumber() {
      var start_number = getSpotNumber();
      if (start_number) {
        start_number += 1;
        project.starting_number_for_spot = start_number;
        LocalStorageFactory.projectDb.setItem('starting_number_for_spot', start_number);
      }
    }

    // Save all project properties in local storage
    function save(data) {
      $log.log('Save: ', data);
      LocalStorageFactory.projectDb.clear().then(
        function () {
          project = data;
          _.forEach(data, function (value, key, list) {
            LocalStorageFactory.projectDb.setItem(key, value);
          });
          $log.log('Saved project properties: ', project);
        }
      );
    }
  }
}());

