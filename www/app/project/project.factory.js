(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$log', '$q', 'DataModelsFactory', 'LocalStorageFactory'];

  function ProjectFactory($log, $q, DataModelsFactory, LocalStorageFactory) {
    var data = {};
    var rockDescriptionSurvey = {};
    var rockDescriptionChoices = {};
    var survey = {};
    var toolsSurvey = {};

    return {
      'destroyRockUnit': destroyRockUnit,
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

      LocalStorageFactory.projectDb.iterate(function (value, key) {
        config[key] = value;
      }, function () {
        deferred.resolve(config);
      });
      return deferred.promise;
    }

    function setSurvey(inSurvey) {
      survey = inSurvey;
      $log.log('Finished loading project description survey: ', survey);
    }

    function setToolsSurvey(inSurvey) {
      toolsSurvey = inSurvey;
      $log.log('Finished loading project tools survey: ', toolsSurvey);
    }

    function setRockDescriptionSurvey(inSurvey) {
      rockDescriptionSurvey = inSurvey;
      $log.log('Finished loading rock description survey: ', rockDescriptionSurvey);
    }

    function setRockDescriptionChoices(inChoices) {
      rockDescriptionChoices = inChoices;
      $log.log('Finished loading rock description choices: ', rockDescriptionChoices);
    }

    /**
     * Public Functions
     */

    function destroyRockUnit(key, value) {
      data.rock_units = _.reject(data.rock_units, function (obj) {
        return obj[key] === value;
      });

      LocalStorageFactory.projectDb.removeItem('rock_units', function () {
        LocalStorageFactory.projectDb.setItem('rock_units', data.rock_units);
        $log.log('Saved rock units: ', data.rock_units);
      });
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
      return rockDescriptionSurvey;
    }

    function getRockUnitsChoices() {
      return rockDescriptionChoices;
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
        LocalStorageFactory.projectDb.setItem('starting_number_for_spot', start_number);
      }
    }

    function loadProject() {
      if (_.isEmpty(data)) {
        $log.log('Loading project properties ....');
        var dataPromise = all().then(function (savedData) {
          data = savedData;
          $log.log('Finished loading project properties: ', data);
        });
        $log.log('Loading project surveys ....');
        DataModelsFactory.readCSV(DataModelsFactory.dataModels.project, setSurvey);
        DataModelsFactory.readCSV(DataModelsFactory.dataModels.tools, setToolsSurvey);
        DataModelsFactory.readCSV(DataModelsFactory.dataModels.rock_description_survey, setRockDescriptionSurvey);
        DataModelsFactory.readCSV(DataModelsFactory.dataModels.rock_description_choices, setRockDescriptionChoices);
        return dataPromise;
      }
    }

    // Save all project properties in local storage
    function save(newData) {
      LocalStorageFactory.projectDb.clear().then(function () {
        data = newData;
        _.forEach(data, function (value, key, list) {
          LocalStorageFactory.projectDb.setItem(key, value);
        });
        $log.log('Saved project properties: ', data);
      });
    }

    function saveRockUnits(rock_units) {
      LocalStorageFactory.projectDb.removeItem('rock_units', function () {
        data.rock_units = rock_units;
        LocalStorageFactory.projectDb.setItem('rock_units', rock_units);
        $log.log('Saved rock units: ', rock_units);
      });
    }
  }
}());
