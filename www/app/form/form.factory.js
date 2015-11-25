(function () {
  'use strict';

  angular
    .module('app')
    .factory('FormFactory', FormFactory);

  FormFactory.$inject = ['$document', '$ionicPopup', '$log'];

  function FormFactory($document, $ionicPopup, $log) {
    return {
      'isRelevant': isRelevant,
      'validate': validate
    };

    /**
     * Public Functions
     */

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

    function validate(survey, data) {
      $log.log('Validating form with data:', data);
      var errorMessages = '';

      // If a field is visible and required but empty give the user an error message and return to the form
      _.each(survey, function (field) {
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
