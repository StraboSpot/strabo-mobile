(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$log', '$q', 'LocalStorageFactory'];

  function ProjectFactory($log, $q, LocalStorageFactory) {
    var projectName;

    activate();

    return {
      'all': all,
      'getProjectNameVar': getProjectNameVar,
      'getSpotNumber': getSpotNumber,
      'getSpotPrefix': getSpotPrefix,
      'incrementSpotNumber': incrementSpotNumber,
      'save': save,
      'setProjectName': setProjectName
    };

    /**
     * Private Functions
     */

    function activate() {
      getProjectName();
    }

    function getProjectName() {
      LocalStorageFactory.projectDb.getItem('project_name').then(function (inProjectName) {
        projectName = inProjectName;
      });
    }

    /**
     * Public Functions
     */

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

    function getProjectNameVar() {
      return projectName;
    }

    function getSpotPrefix() {
      return LocalStorageFactory.projectDb.getItem('spot_prefix');
    }

    function getSpotNumber() {
      return LocalStorageFactory.projectDb.getItem('starting_number_for_spot');
    }

    function incrementSpotNumber() {
      getSpotNumber().then(function (number) {
        if (number) {
          number += 1;
          return LocalStorageFactory.projectDb.setItem('starting_number_for_spot', number);
        }
      });
    }

    function save(data) {
      $log.log('Save: ', data);
      LocalStorageFactory.projectDb.clear().then(
        function () {
          _.forEach(data, function (value, key, list) {
            LocalStorageFactory.projectDb.setItem(key, value);
          });
        }
      );
    }

    function setProjectName(inProjectName) {
      projectName = inProjectName;
    }
  }
}());

