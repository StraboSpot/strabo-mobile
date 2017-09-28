(function () {
  'use strict';

  angular
    .module('app')
    .factory('FormFactory', FormFactory);

  FormFactory.$inject = ['$document', '$ionicPopup', '$log', '$rootScope', 'DataModelsFactory'];

  function FormFactory($document, $ionicPopup, $log, $rootScope, DataModelsFactory) {

    var form = {};   // form = {'choices': {}, 'survey': {}};

    return {
      'clearForm': clearForm,
      'clearFormElements': clearFormElements,
      'getForm': getForm,
      'getMax': getMax,
      'getMin': getMin,
      'isRelevant': isRelevant,
      'setForm': setForm,
      'toggleAcknowledgeChecked': toggleAcknowledgeChecked,
      'validate': validate,
      'validateForm': validateForm
    };

    /**
     * Public Functions
     */

    function clearForm() {
      form = {};
    }

    function clearFormElements() {
      var formCtrl = angular.element(document.getElementById('straboFormCtrlId')).scope();
      _.each(form.survey, function (field) {
        if (field.name) {
          var ele = document.getElementsByName(field.name)[0];
          var formEle = formCtrl.straboForm[ele.name];
          if (formEle && formEle.$valid === false) {
            ele.value = "";
            // formEle.$valid = true;  // These cause an error "Cannot create property 'min' on boolean 'false'"
            // formEle.$error = false; // when typing in a number
          }
        }
      });
    }

    function getForm() {
      return form;
    }

    // Get the max value allowed for a number field
    function getMax(constraint) {
      try {
        // Look for <= (= is optional) in constraint, followed by a space and then any number of digits (- preceding the digits is optional)
        var regexMax = /<=?\s(-?\d*)/i;
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
        // Look for >= (= is optional) in constraint, followed by a space and any number of digits (- preceding the digits is optional)
        var regexMin = />=?\s(-?\d*)/i;
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

    function setForm(formName, type) {
      if (type) {
        form.survey = DataModelsFactory.getDataModel(formName)[type].survey;
        form.choices = DataModelsFactory.getDataModel(formName)[type].choices;
      }
      else {
        form.survey = DataModelsFactory.getDataModel(formName).survey;
        form.choices = DataModelsFactory.getDataModel(formName).choices;
      }
      $rootScope.$broadcast('formUpdated', form);
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

    function validate(data) {
      $log.log('Validating form with data:', data);
      var errorMessages = '';
      var formCtrl = angular.element(document.getElementById('straboFormCtrlId')).scope();
      // If a field is visible and required but empty give the user an error message and return to the form
      _.each(form.survey, function (field) {
        if (field.name) {
          var ele = $document[0].getElementById(field.name);
          var formEle = formCtrl.straboForm[ele.id];
          if (getComputedStyle(ele).display !== 'none' && formEle && formEle.$valid === false) {
            if (field.required === 'true') errorMessages += '<b>' + field.label + '</b>: Required!<br>';
            else {
              var constraint = field.constraint_message ? field.constraint_message : 'Error in field.';
              errorMessages += '<b>' + field.label + '</b>: ' + constraint + '<br>';
            }
          }
          else if (getComputedStyle(ele).display === 'none') delete data[field.name];
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

    // Validate Spot Tab
    function validateForm(stateName, spot, data) {
      if (stateName === 'app.spotTab.spot') {
        if (!spot.properties.name) {
          $ionicPopup.alert({
            'title': 'Validation Error!',
            'template': '<b>Spot Name</b> is required.'
          });
          return false;
        }
        if (spot.geometry) {
          if (spot.geometry.type === 'Point') {
            var geoError;
            if (!spot.geometry.coordinates[0] && !spot.geometry.coordinates[1]) {
              geoError = '<b>Latitude</b> and <b>longitude</b> are required.';
            }
            else if (!spot.geometry.coordinates[0]) geoError = '<b>Longitude</b> is required.';
            else if (!spot.geometry.coordinates[1]) geoError = '<b>Latitude</b> is required.';
            if (geoError) {
              $ionicPopup.alert({
                'title': 'Validation Error!',
                'template': geoError
              });
              return false;
            }
          }
        }
        if (!_.isEmpty(form.survey)) return validate(data);
        return true;
      }
      return true;
    }
  }
}());
