(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$ionicPopup', '$log', '$q', 'LocalStorageFactory'];

  function ProjectFactory($ionicPopup, $log, $q, LocalStorageFactory) {
    var data = {};
    var projectKey = 'project_name';
    var projects = [];

    return {
      'addNewProject': addNewProject,
      'destroyOtherFeature': destroyOtherFeature,
      'destroyRockUnit': destroyRockUnit,
      'getProjects': getProjects,
      'getPreferences': getPreferences,
      'getProjectData': getProjectData,
      'getProjectName': getProjectName,
      'getOtherFeatures': getOtherFeatures,
      'getRockUnits': getRockUnits,
      'getSpotNumber': getSpotNumber,
      'getSpotPrefix': getSpotPrefix,
      'incrementSpotNumber': incrementSpotNumber,
      'loadProject': loadProject,                     // Run from app config
      'save': save,
      'saveOtherFeatures': saveOtherFeatures,
      'savePreferences': savePreferences,
      'saveRockUnits': saveRockUnits
    };

    /**
     * Private Functions
     */

    // Load all project properties from local storage
    function all() {
      var deferred = $q.defer(); // init promise
      var config = {};

      LocalStorageFactory.getDb().projectDb.iterate(function (value, key) {
        config[key] = value;
      }, function () {
        deferred.resolve(config);
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function addNewProject(project) {
      // Check if project name is already being used
      var validKey = true;
      _.each(projects, function (obj) {
        if (obj[projectKey] === project[projectKey]) validKey = false;
      });
      if (validKey) {
        projects.push(project);
        $log.log('Added new project: ', project);
        return true;
      }
      $ionicPopup.alert({
        'title': 'Duplicate Project Name!',
        'template': 'The project name ' + project[projectKey] + ' is already being used for another project. Use a different name.'
      });
      return false;
    }

    function destroyOtherFeature(i) {
      data.other_features.splice(i, 1);
      LocalStorageFactory.getDb().projectDb.removeItem('other_features', function () {
        LocalStorageFactory.getDb().projectDb.setItem('other_features', data.other_features);
        $log.log('Saved other features: ', data.other_features);
      });
    }

    function destroyRockUnit(key, value) {
      data.rock_units = _.reject(data.rock_units, function (obj) {
        return obj[key] === value;
      });

      LocalStorageFactory.getDb().projectDb.removeItem('rock_units', function () {
        LocalStorageFactory.getDb().projectDb.setItem('rock_units', data.rock_units);
        $log.log('Saved rock units: ', data.rock_units);
      });
    }

    function getPreferences() {
      return data.preferences || {};
    }

    function getProjects() {
      return projects;
    }

    function getProjectData() {
      return data;
    }

    function getProjectName() {
      return data.project_name;
    }

    function getSpotPrefix() {
      return data.spot_prefix;
    }

    function getOtherFeatures() {
      return data.other_features || [];
    }

    function getRockUnits() {
      return data.rock_units || [];
    }

    function getSpotNumber() {
      return data.starting_number_for_spot;
    }

    // Increment starting spot number by 1
    function incrementSpotNumber() {
      var start_number = getSpotNumber();
      if (start_number) {
        start_number += 1;
        data.starting_number_for_spot = start_number;
        LocalStorageFactory.getDb().projectDb.setItem('starting_number_for_spot', start_number);
      }
    }

    function loadProject() {
      var deferred = $q.defer(); // init promise
      if (_.isEmpty(data)) {
        $log.log('Loading project properties ....');
        all().then(function (savedData) {
          data = savedData;
          $log.log('Finished loading project properties: ', data);
          deferred.resolve();
        });
      }
      else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    // Save all project properties in local storage
    function save(newData) {
      LocalStorageFactory.getDb().projectDb.clear().then(function () {
        data = newData;
        _.forEach(data, function (value, key, list) {
          LocalStorageFactory.getDb().projectDb.setItem(key, value);
        });
        $log.log('Saved project properties: ', data);
      });
    }

    function saveOtherFeatures(other_features) {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().projectDb.removeItem('other_features', function () {
        data.other_features = other_features;
        LocalStorageFactory.getDb().projectDb.setItem('other_features', other_features).then(function () {
          $log.log('Saved other features: ', other_features);
          deferred.resolve();
        });
      });
      return deferred.promise;
    }

    function savePreferences(preferences) {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().projectDb.removeItem('preferences', function () {
        data.preferences = preferences;
        LocalStorageFactory.getDb().projectDb.setItem('preferences', preferences).then(function () {
          $log.log('Saved preferences: ', preferences);
          deferred.resolve();
        });
      });
      return deferred.promise;
    }

    function saveRockUnits(rock_units) {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().projectDb.removeItem('rock_units', function () {
        data.rock_units = rock_units;
        LocalStorageFactory.getDb().projectDb.setItem('rock_units', rock_units).then(function () {
          $log.log('Saved rock units: ', rock_units);
          deferred.resolve();
        });
      });
      return deferred.promise;
    }
  }
}());
