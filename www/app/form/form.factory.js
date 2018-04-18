(function () {
  'use strict';

  angular
    .module('app')
    .factory('FormFactory', FormFactory);

  FormFactory.$inject = ['$document', '$ionicPopup', '$log', '$rootScope', 'DataModelsFactory', 'StratSectionFactory'];

  function FormFactory($document, $ionicPopup, $log, $rootScope, DataModelsFactory, StratSectionFactory) {

    var form = {};   // form = {'choices': {}, 'survey': {}};
    var formName = [];

    return {
      'clearForm': clearForm,
      'clearFormElements': clearFormElements,
      'getForm': getForm,
      'getFormName': getFormName,
      'getMax': getMax,
      'getMin': getMin,
      'isRelevant': isRelevant,
      'setForm': setForm,
      'toggleAcknowledgeChecked': toggleAcknowledgeChecked,
      'validate': validate,
      'validateForm': validateForm
    };

    /**
     * Private Functions
     */

    function validateSedData(spot, errorMessages) {
      var lithologies = spot.properties.sed.lithologies;
      var spotWithThisStratSection = StratSectionFactory.getSpotWithThisStratSection(spot.properties.strat_section_id);
      if (spotWithThisStratSection.properties && spotWithThisStratSection.properties.sed &&
        spotWithThisStratSection.properties.sed.strat_section) {
        var units = spotWithThisStratSection.properties.sed.strat_section.column_y_axis_units;
        if (units !== lithologies.thickness_units) {
          errorMessages.push('- The <b>Thickness Units</b> must be <b>' + units + '</b> since <b>' + units +
            '</b> have been assigned for the properties of this strat section.')
        }
      }
      if (lithologies.is_this_a_bed_or_package === 'bed' || lithologies.is_this_a_bed_or_package === 'interbedded' ||
        lithologies.is_this_a_bed_or_package === 'package_succe') {
        if (!lithologies.primary_lithology) {
          errorMessages.push('- The <b>Primary Lithology</b> must be specified if the there is any type of bedding.');
        }
        else if (lithologies.primary_lithology === 'siliciclastic' && (!lithologies.mud_silt_principal_grain_size &&
            !lithologies.sand_principal_grain_size && !lithologies.congl_breccia_principal_grain_size)) {
          errorMessages.push('- The <b>Principal Grain Size</b> must be specified if the Primary Lithology is ' +
            'siliciclastic.');
        }
        else if ((lithologies.primary_lithology === 'limestone' || lithologies.primary_lithology === 'dolomite') &&
          !lithologies.principal_dunham_class) {
          errorMessages.push('- The <b>Principal Dunham Classification</b> must be specified if the Primary Lithology' +
            ' is limestone or dolomite.');
        }
      }
      return errorMessages;
    }

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
          if (ele) {
            var formEle = formCtrl.straboForm[ele.name];
            if (formEle && formEle.$valid === false) {
              ele.value = "";
              // formEle.$valid = true;  // These cause an error "Cannot create property 'min' on boolean 'false'"
              // formEle.$error = false; // when typing in a number
            }
          }
        }
      });
    }

    function getForm() {
      return form;
    }

    function getFormName() {
      return formName
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

    function setForm(inFormName, type) {
      $log.log('Setting form to', inFormName, type);
      formName = type ? inFormName + '.' + type : inFormName;
      if (type) {
        form.survey = DataModelsFactory.getDataModel(inFormName)[type].survey;
        form.choices = DataModelsFactory.getDataModel(inFormName)[type].choices;
      }
      else {
        form.survey = DataModelsFactory.getDataModel(inFormName).survey;
        form.choices = DataModelsFactory.getDataModel(inFormName).choices;
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
      if (_.isEmpty(data)) return true;
      $log.log('Validating form with data:', data);
      var errorMessages = [];
      var formCtrl = angular.element(document.getElementById('straboFormCtrlId')).scope();
      // If a field is visible and required but empty give the user an error message and return to the form
      _.each(form.survey, function (field) {
        if (field.name) {
          var ele = $document[0].getElementById(field.name);
          var formEle = formCtrl.straboForm[ele.id];
          if (getComputedStyle(ele).display !== 'none' && formEle && formEle.$valid === false) {
            if (field.required === 'true') errorMessages.push('<b>' + field.label + '</b>: Required!');
            else {
              var constraint = field.constraint_message ? field.constraint_message : 'Error in field.';
              errorMessages.push('<b>' + field.label + '</b>: ' + constraint);
            }
          }
          else if (getComputedStyle(ele).display === 'none') delete data[field.name];
        }
      });

      if (_.isEmpty(errorMessages)) return true;
      else {
        $ionicPopup.alert({
          'title': 'Validation Error!',
          'template': 'Fix the following errors before continuing:<br>' + errorMessages.join('<br>')
        });
        return false;
      }
    }

    // Validate Spot Tab
    function validateForm(stateName, spot, data) {
      var errorMessages = [];
      if (_.isEmpty(form.survey)) {
        if (stateName === 'app.spotTab.spot') {
          if (!spot.properties.name) errorMessages.push('<b>Spot Name</b> is required.');
          if (spot.geometry && spot.geometry.type === 'Point' && (!spot.geometry.coordinates[0] ||
              !spot.geometry.coordinates[1])) {
            errorMessages.push('Both <b>Latitude</b> and <b>longitude</b> are required.');
          }
        }
      }
      else if (validate(data)) {
        if (stateName === 'app.spotTab.spot') {
          if (!spot.properties.name) errorMessages.push('<b>Spot Name</b> is required.');
          if (spot.geometry && spot.geometry.type === 'Point' && (!spot.geometry.coordinates[0] ||
              !spot.geometry.coordinates[1])) {
            errorMessages.push('Both <b>Latitude</b> and <b>longitude</b> are required.');
          }
        }
        else if (stateName === 'app.spotTab.sed-lithologies' && spot.properties.sed &&
          spot.properties.sed.lithologies) {
          errorMessages = validateSedData(spot, errorMessages);
        }
      }
      else return false;
      if (_.isEmpty(errorMessages)) return true;
      else {
        $ionicPopup.alert({
          'title': 'Data Validation Error',
          'template': errorMessages.join('<br>')
        });
        return false;
      }
    }
  }
}());
