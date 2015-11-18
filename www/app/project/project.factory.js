(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$log', '$q', 'DataModelsFactory', 'LocalStorageFactory'];

  function ProjectFactory($log, $q, DataModelsFactory, LocalStorageFactory) {
    var csvFile = 'app/data-models/ProjectsPage.csv';
    var data = {};
    var dataPromise;
    var survey = {};
    var surveyPromise;

    activate();

    return {
      'dataPromise': dataPromise,
      'getProjectData': getProjectData,
      'getProjectName': getProjectName,
      'getSpotNumber': getSpotNumber,
      'getSpotPrefix': getSpotPrefix,
      'getSurvey': getSurvey,
      'incrementSpotNumber': incrementSpotNumber,
      'save': save,
      'surveyPromise': surveyPromise
    };

    /**
     * Private Functions
     */

    function activate() {
      $log.log('Loading project properties ....');
      dataPromise = all().then(function (savedData) {
        data = savedData;
        $log.log('Finished loading project properties: ', data);
      });
      $log.log('Loading project survey ....');
      surveyPromise = DataModelsFactory.readCSV(csvFile, setSurvey);
    }

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
      $log.log('Finished loading project survey: ', survey);
    }

    /**
     * Public Functions
     */

    function getProjectData() {
      return data;
    }

    function getProjectName() {
      return data.project_name;
    }

    function getSpotPrefix() {
      return data.spot_prefix;
    }

    function getSpotNumber() {
      return data.starting_number_for_spot;
    }

    function getSurvey() {
      return survey;
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
  }
}());

