(function () {
  'use strict';

  angular
    .module('app')
    .factory('FormFactory', FormFactory);

  FormFactory.$inject = ['$document', '$ionicPopup', '$log', '$rootScope', 'DataModelsFactory', 'SpotFactory',
    'StratSectionFactory'];

  function FormFactory($document, $ionicPopup, $log, $rootScope, DataModelsFactory, SpotFactory, StratSectionFactory) {

    var form = {};   // form = {'choices': {}, 'survey': {}};
    var formName = [];

    return {
      'clearForm': clearForm,
      'clearFormElements': clearFormElements,
      'getForm': getForm,
      'getFormName': getFormName,
      'getMax': getMax,
      'getMin': getMin,
      'getPattern': getPattern,
      'handleTraceFeatureToggled': handleTraceFeatureToggled,
      'isRelevant': isRelevant,
      'setForm': setForm,
      //'handleStratModeToggled': handleStratModeToggled,
      'validate': validate,
      'validateForm': validateForm,
      'validateSedData': validateSedData
    };

    /**
     * Private Functions
     */

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
      } catch (e) {
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
      } catch (e) {
        return undefined;
      }
    }

    // Get the pattern to be applied for specific fields
    function getPattern(fieldName) {
      switch (fieldName) {
        case 'eruption_start_datetime_utc':
        case 'eruption_end_datetime_utc':
          return "\\d{4}-[0-1]\\d{1}-[0-3]\\d{1}T[0-2]\\d{1}:[0-5]\\d{1}:[0-5]\\d{1}Z"
      }
      return undefined;
    }

    // Handle Trace Feature being toggled on off on the Spot Home page
    function handleTraceFeatureToggled(field, data) {
      if (data) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Close Group?',
          'template': 'By closing this group you will be clearing all Trace Feature data for this Spot. Continue?'
        });
        confirmPopup.then(function (res) {
          if (res) delete data[field];
          else data[field] = true;
        });
      }
    }

    // Handle Strat Mode being toggled on or off on the Project Preferences page
    /*    function handleStratModeToggled(field, data) {
          if (data[field] && !_.isEmpty(SpotFactory.getSpotsWithOtherSedCharacter())) {
            $log.log('strat mode toggled on');
            var confirmPopup1 = $ionicPopup.confirm({
              'title': 'Entering Strat Mode Warning!',
              'template': 'Are you sure you want to enter Strat Mode? Sed Characteristics of "other" in ALL Spots will be deleted.'
            });
            confirmPopup1.then(function (res) {
              if (res) SpotFactory.deleteOtherSedCharacteristicsForAllSpots();
              else delete data[field];
            });
          }
          else if (!data[field] && (!_.isEmpty(SpotFactory.getSpotsWithIntervalData()) ||
            !_.isEmpty(SpotFactory.getSpotsWithUnmeasuredSedCharacter()))) {
            $log.log('strat mode toggled off');
            var confirmPopup2 = $ionicPopup.confirm({
              'title': 'Leaving Strat Mode Warning!',
              'template': 'Are you sure you want to leave Strat Mode? Data for Interval Thicknesses and ' +
                'Interval Types of "unexposed/covered" or "not measured" in ALL Spots will be deleted.'
            });
            confirmPopup2.then(function (res) {
              if (res) SpotFactory.deleteIntervalDataForAllSpots();
              else data[field] = true;
            });
          }
          else if (!data[field]) SpotFactory.deleteIntervalDataForAllSpots();
        }*/

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
      } catch (e) {
        return false;
      }
    }

    function setForm(inFormName, type) {
      $log.log('Setting form to', inFormName, type);
      formName = type ? inFormName + '.' + type : inFormName;
      try {
        if (type) {
          form.survey = DataModelsFactory.getDataModel(inFormName)[type].survey;
          form.choices = DataModelsFactory.getDataModel(inFormName)[type].choices;
        }
        else {
          form.survey = DataModelsFactory.getDataModel(inFormName).survey;
          form.choices = DataModelsFactory.getDataModel(inFormName).choices;
        }
      } catch (e) {
        form.survey = {};
        form.choices = {};
      }
      $rootScope.$broadcast('formUpdated', form);
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
          else if (getComputedStyle(ele).display === 'none' && !_.isEmpty(data[field.name])) {
            $log.warn('Deleting form data:', field.name, ':', data[field.name]);
            delete data[field.name];
          }
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

    // Check special conditions for sed data where n is the number of the current lithology
    function validateSedData(spot, n, stateName) {
      var errorMessages = [];
      var isMappedInterval = StratSectionFactory.isMappedInterval(spot);
      var sed = spot.properties.sed;

      // Validation checks for Interval page
      if (stateName === 'app.spotTab.sed-interval' && isMappedInterval) {
        if (sed.interval) {
          var units = StratSectionFactory.getDefaultUnits(spot);
          if (units !== sed.interval.thickness_units) {
            errorMessages.push('- <b>Thickness Units</b> must be <b>' + units + '</b> since <b>' + units +
              '</b> have been assigned for the properties of this strat section.')
          }
        }
        else {
          errorMessages.push('- <b>Interval</b> data must be specified for a/an ' +
            DataModelsFactory.getLabelFromNewDictionary(sed.character, sed.character) + ' interval.');
        }
      }

      // Validation checks for Lithologies page
      if (stateName === 'app.spotTab.sed-lithologies' && isMappedInterval && (sed.character === 'bed' ||
        sed.character === 'bed_mixed_lit' || sed.character === 'interbedded' || sed.character === 'package_succe')) {
        if (sed.lithologies && sed.lithologies[n]) {
          if (!sed.lithologies[n].primary_lithology) {
            errorMessages.push('- <b>Primary Lithology</b> must be specified for Lithology ' + (n + 1) + ' if there ' +
              'is any type of bedding.');
          }
          if (sed.lithologies[n].primary_lithology === 'siliciclastic'
            && (!sed.lithologies[n].mud_silt_grain_size && !sed.lithologies[n].sand_grain_size
              && !sed.lithologies[n].congl_grain_size && !sed.lithologies[n].breccia_grain_size)) {
            errorMessages.push(
              '- <b>Grain Size</b> must be specified for Lithology ' + (n + 1) + ' if the Primary Lithology is ' +
              'siliciclastic.');
          }
          if ((sed.lithologies[n].primary_lithology === 'limestone'
            || sed.lithologies[n].primary_lithology === 'dolostone') && !sed.lithologies[n].dunham_classification) {
            errorMessages.push(
              '- <b>Dunham Classification</b> must be specified for Lithology ' + (n + 1) + ' if the Primary ' +
              'Lithology is limestone or dolostone.');
          }
        }
        else {
          errorMessages.push('- <b>Lithologies</b> must be specified for a/an ' +
            DataModelsFactory.getLabelFromNewDictionary(sed.character, sed.character) + ' interval.');
        }
      }

      // Validation checks for Bedding page
      if (stateName === 'app.spotTab.sed-bedding') {
        var units = StratSectionFactory.getDefaultUnits(spot);
        if (sed.bedding && ((sed.bedding.package_thickness_units && units !== sed.bedding.package_thickness_units) ||
          (sed.bedding.beds && sed.bedding.beds[n] && sed.bedding.beds[n].interbed_thickness_units &&
            units !== sed.bedding.beds[n].interbed_thickness_units))) {
          errorMessages.push('- <b>Thickness Units</b> must be <b>' + units + '</b> since <b>' + units +
            '</b> have been assigned for the properties of this strat section.')
        }
        if (isMappedInterval && (sed.character === 'interbedded' || sed.character === 'bed_mixed_lit')) {
          if (sed.bedding && sed.bedding.beds) {
            if (!sed.bedding.interbed_proportion) {
              errorMessages.push('- <b>' +
                DataModelsFactory.getLabelFromNewDictionary('interbed_proportion', 'interbed_proportion') +
                '</b> must be specified.');
            }
            if (!sed.bedding.interbed_proportion_change) {
              errorMessages.push('- <b>' +
                DataModelsFactory.getLabelFromNewDictionary('interbed_proportion_change',
                  'interbed_proportion_change') +
                '</b> must be specified.');
            }
            else {
              if ((sed.bedding.interbed_proportion_change === 'increase' ||
                sed.bedding.interbed_proportion_change === 'decrease') && (!sed.bedding.beds[n] ||
                (sed.bedding.beds[n] && !(sed.bedding.beds[n].max_thickness && sed.bedding.beds[n].min_thickness)))) {
                errorMessages.push('- Both <b>' +
                  DataModelsFactory.getLabelFromNewDictionary('max_thickness', 'max_thickness') +
                  '</b> and <b>' +
                  DataModelsFactory.getLabelFromNewDictionary('min_thickness', 'min_thickness') +
                  '</b> must be specified for Lithology ' + (n + 1) + '.');
              }
              else if (sed.bedding.interbed_proportion_change === 'no_change' && (!sed.bedding.beds[n] ||
                (sed.bedding.beds[n] && !sed.bedding.beds[n].avg_thickness))) {
                errorMessages.push(
                  '- <b>' + DataModelsFactory.getLabelFromNewDictionary('avg_thickness', 'avg_thickness') +
                  '</b> must be specified for Lithology ' + (n + 1) + '.');
              }
            }
          }
          else {
            errorMessages.push('- <b>Bedding</b> measurements must be specified for a/an ' +
              DataModelsFactory.getLabelFromNewDictionary(sed.character, sed.character) + '  interval.');
          }
        }
      }

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
