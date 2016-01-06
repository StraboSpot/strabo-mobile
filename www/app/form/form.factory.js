(function () {
  'use strict';

  angular
    .module('app')
    .factory('FormFactory', FormFactory);

  FormFactory.$inject = ['$document', '$ionicPopup', '$log', '$q', 'DataModelsFactory'];

  function FormFactory($document, $ionicPopup, $log, $q, DataModelsFactory) {
    var forms = {
      '_3dstructures_survey': {},
      '_3dstructures_choices': {},
      'linear_orientation_survey': {},
      'linear_orientation_choices': {},
      'planar_orientation_survey': {},
      'planar_orientation_choices': {},
      'sample_survey': {},
      'sample_choices': {},
      'tabular_orientation_survey': {},
      'tabular_orientation_choices': {},
      'traces_survey': {},
      'traces_choices': {}
    };

    return {
      'getLinearOrientationForm': getLinearOrientationForm,
      'getPlanarOrientationForm': getPlanarOrientationForm,
      'getTabularOrientationForm': getTabularOrientationForm,
      'getForm': getForm,
      'isRelevant': isRelevant,
      'loadForms': loadForms,
      'toggleAcknowledgeChecked': toggleAcknowledgeChecked,
      'validate': validate
    };

    /**
     * Public Functions
     */

    function getLinearOrientationForm() {
      return {
        'survey': forms.linear_orientation_survey,
        'choices': forms.linear_orientation_choices
      };
    }

    function getPlanarOrientationForm() {
      return {
        'survey': forms.planar_orientation_survey,
        'choices': forms.planar_orientation_choices
      };
    }

    function getTabularOrientationForm() {
      return {
        'survey': forms.tabular_orientation_survey,
        'choices': forms.tabular_orientation_choices
      };
    }

    function getForm() {
      return forms;
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    // The 2nd param, properties, is used in the eval method
    function isRelevant(relevant, properties) {
      if (!relevant) return true;

      relevant = relevant.replace(/selected\(\$/g, '_.contains(');
      relevant = relevant.replace(/\$/g, '');
      relevant = relevant.replace(/{/g, 'properties.');
      relevant = relevant.replace(/}/g, '');
      relevant = relevant.replace(/''/g, 'undefined');
      relevant = relevant.replace(/ = /g, ' == ');
      relevant = relevant.replace(/ or /g, ' || ');
      relevant = relevant.replace(/ and /g, ' && ');

      try {
        return eval(relevant);
      }
      catch (e) {
        return false;
      }
    }

    function loadForms() {
      var deferred = $q.defer(); // init promise
      var promises = [];
      var doInitialize = _.some(forms, function (form) {
        return _.isEmpty(form);
      });
      if (doInitialize) {
        $log.log('Loading forms for Spots (survey + choices) ...');
        _.each(forms, function (value, key) {
          var deferred2 = $q.defer(); // init promise
          $log.log('Loading ' + key + ' ....');
          var csvFile = DataModelsFactory.dataModels[key];
          DataModelsFactory.readCSV(csvFile, function (fields) {
            $log.log('Finished loading ' + key + ' : ', fields);
            forms[key] = fields;
            deferred2.resolve();
          });
          promises.push(deferred2.promise);
        });
        $q.all(promises).then(function () {
          deferred.resolve();
        });
      }
      else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function toggleAcknowledgeChecked(data, field) {
      if (data[field]) {
        delete data[field];
      }
      else {
        data[field] = true;
      }
      return data;
    }

    function validate(survey, data) {
      $log.log('Validating form with data:', data);
      var errorMessages = '';

      // If a field is visible and required but empty give the user an error message and return to the form
      _.each(survey, function (field) {
        if (field.name) {
          var ele = $document[0].getElementById(field.name);
          if (getComputedStyle(ele).display !== 'none' && angular.isUndefined(data[field.name])) {
            if (field.required === 'true') {
              errorMessages += '<b>' + field.label + '</b> Required!<br>';
            }
            else if (field.name in data) {
              errorMessages += '<b>' + field.label + '</b> ' + field.constraint_message + '<br>';
            }
          }
          else if (getComputedStyle(ele).display === 'none') {
            delete data[field.name];
          }
        }
      });

      if (errorMessages) {
        $ionicPopup.alert({
          'title': 'Validation Error!',
          'template': 'Fix the following errors before continuing:<br>' + errorMessages
        });
        $log.log('Not valid!');
        return false;
      }
      $log.log('Valid!');
      return true;
    }
  }
}());
