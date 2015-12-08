(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotFormsFactory', SpotFormsFactory);

  SpotFormsFactory.$inject = ['$log', '$q', 'DataModelsFactory'];

  function SpotFormsFactory($log, $q, DataModelsFactory) {
    var forms = {
      'sample_survey': {},
      'sample_choices': {},
      '_3dstructures_survey': {},
      '_3dstructures_choices': {},
      'traces_survey': {},
      'traces_choices': {}
    };

    return {
      'getTracesChoices': getTracesChoices,
      'getTracesSurvey': getTracesSurvey,
      'loadTracesForm': loadTracesForm
    };

    /**
     * Private Functions
     */

    /**
     * Public Functions
     */

    function getTracesChoices() {
      return forms.traces_choices;
    }

    function getTracesSurvey() {
      return forms.traces_survey;
    }

    function loadTracesForm() {
      var deferred = $q.defer(); // init promise
      $log.log('Loading traces_survey ....');
      var csvFile = DataModelsFactory.dataModels.traces_survey;
      DataModelsFactory.readCSV(csvFile, function (surveyFields) {
        $log.log('Finished loading traces_survey: ', surveyFields);
        forms.traces_survey = surveyFields;
        $log.log('Loading traces_choices ....');
        csvFile = DataModelsFactory.dataModels.traces_choices;
        DataModelsFactory.readCSV(csvFile, function (choicesFields) {
          $log.log('Finished loading traces_choices: ', choicesFields);
          forms.traces_choices = choicesFields;
          deferred.resolve();
        });
      });
      return deferred.promise;
    }
  }
}());
