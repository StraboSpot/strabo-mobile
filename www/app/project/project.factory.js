(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$ionicPopup', '$log', '$q', 'DataModelsFactory', 'LocalStorageFactory'];

  function ProjectFactory($ionicPopup, $log, $q, DataModelsFactory, LocalStorageFactory) {
    var data;
    var projectKey = 'project_name';
    var rockUnitSurvey = {};
    var rockUnitChoices = {};
    var survey = {};
    var toolsSurvey = {};
    var projects = [];

    return {
      'addNewProject': addNewProject,
      'destroyRockUnit': destroyRockUnit,
      'getProjects': getProjects,
      'getProjectData': getProjectData,
      'getProjectName': getProjectName,
      'getRockUnits': getRockUnits,
      'getRockUnitsChoices': getRockUnitsChoices,
      'getRockUnitsSurvey': getRockUnitsSurvey,
      'getSpotNumber': getSpotNumber,
      'getSpotPrefix': getSpotPrefix,
      'getSurvey': getSurvey,
      'getToolsSurvey': getToolsSurvey,
      'incrementSpotNumber': incrementSpotNumber,
      'loadProject': loadProject,                     // Run from app config
      'save': save,
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

    function setSurvey(inSurvey) {
      survey = inSurvey;
      $log.log('Finished loading project survey: ', survey);
    }

    function setToolsSurvey(inSurvey) {
      toolsSurvey = inSurvey;
      $log.log('Finished loading project tools survey: ', toolsSurvey);
    }

    function setRockUnitSurvey(inSurvey) {
      rockUnitSurvey = inSurvey;
      $log.log('Finished loading rock unit survey: ', rockUnitSurvey);
    }

    function setRockUnitChoices(inChoices) {
      rockUnitChoices = inChoices;
      $log.log('Finished loading rock unit choices: ', rockUnitChoices);
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

    function destroyRockUnit(key, value) {
      data.rock_units = _.reject(data.rock_units, function (obj) {
        return obj[key] === value;
      });

      LocalStorageFactory.getDb().projectDb.removeItem('rock_units', function () {
        LocalStorageFactory.getDb().projectDb.setItem('rock_units', data.rock_units);
        $log.log('Saved rock units: ', data.rock_units);
      });
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

    function getRockUnits() {
      return data.rock_units || [];
    }

    function getSpotNumber() {
      return data.starting_number_for_spot;
    }

    function getSurvey() {
      return survey;
    }

    function getRockUnitsSurvey() {
      return rockUnitSurvey;
    }

    function getRockUnitsChoices() {
      return rockUnitChoices;
    }

    function getToolsSurvey() {
      return toolsSurvey;
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
      if (!data) {
        $log.log('Loading project properties ....');
        all().then(function (savedData) {
          data = savedData;
          $log.log('Finished loading project properties: ', data);
          deferred.resolve();
        });
        $log.log('Loading project surveys ....');
        DataModelsFactory.readCSV(DataModelsFactory.dataModels.project, setSurvey);
        DataModelsFactory.readCSV(DataModelsFactory.dataModels.tools, setToolsSurvey);
        DataModelsFactory.readCSV(DataModelsFactory.dataModels.rock_unit_survey, setRockUnitSurvey);
        DataModelsFactory.readCSV(DataModelsFactory.dataModels.rock_unit_choices, setRockUnitChoices);
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
