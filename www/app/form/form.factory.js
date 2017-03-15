(function () {
  'use strict';

  angular
    .module('app')
    .factory('FormFactory', FormFactory);

  FormFactory.$inject = ['$document', '$ionicPopup', '$log'];

  function FormFactory($document, $ionicPopup, $log) {
    return {
      'getMax': getMax,
      'getMin': getMin,
      'isRelevant': isRelevant,
      'toggleAcknowledgeChecked': toggleAcknowledgeChecked,
      'validate': validate
    };

    /**
     * Public Functions
     */

    // Get the max value allowed for a number field
    function getMax(constraint) {
      try {
        // Look for <= (= is optional) in constraint, followed by a space and then a number
        var regexMax = /<=?\s(\d*)/i;
        // Return just the number
        return regexMax.exec(constraint)[1];
      }
      catch (e) {
        return undefined;
      }
    }

    // Get the min value allowed for a number field
    function getMin(constraint) {
      try {
        // Look for >= (= is optional) in constraint, followed by a space and any number of digits
        var regexMin = />=?\s(\d*)/i;
        // Return just the number
        return regexMin.exec(constraint)[1];
      }
      catch (e) {
        return undefined;
      }
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
              errorMessages += '<b>' + field.label + '</b>: Required!<br>';
            }
            else if (field.name in data) {
              var constraint = field.constraint_message ?  field.constraint_message : 'Error in field.';
              errorMessages += '<b>' + field.label + '</b>: ' + constraint + '<br>';
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
