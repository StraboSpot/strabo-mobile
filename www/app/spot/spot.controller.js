(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicActionSheet', '$ionicPopup', '$location', '$log', '$state',
    'DataModelsFactory', 'FormFactory', 'ImageBasemapFactory', 'PreferencesFactory', 'ProjectFactory', 'SpotFactory',
    'SpotFormsFactory'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicActionSheet, $ionicPopup, $location, $log, $state, DataModelsFactory,
                          FormFactory, ImageBasemapFactory, PreferencesFactory, ProjectFactory, SpotFactory,
                          SpotFormsFactory) {
    var vm = this;

    vm.copySpot = false;
    vm.choices = undefined;
    vm.data = {};
    vm.deleteSpot = deleteSpot;
    vm.fields = {};
    vm.getMax = getMax;
    vm.getMin = getMin;
    vm.isOptionChecked = isOptionChecked;
    vm.loadTab = loadTab;
    vm.openSpot = openSpot;
    vm.setSelMultClass = setSelMultClass;
    vm.showActionsheet = showActionsheet;
    vm.showField = showField;
    vm.showRockUnit = true;
    vm.showTab = showTab;
    vm.showTrace = false;
    vm.spot = {};
    vm.stateName = $state.current.name;
    vm.submit = submit;
    vm.survey = undefined;
    vm.toggleAcknowledgeChecked = toggleAcknowledgeChecked;
    vm.toggleChecked = toggleChecked;
    vm.validateForm = validateForm;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotController');
      loadForms();
    }

    // Create a new spot with the details from this spot
    function copySpot() {
      var newSpot = _.omit(vm.spot, 'properties');
      newSpot.properties = _.omit(vm.data,
        ['name', 'id', 'date', 'time', 'modified_timestamp']);
      var id = SpotFactory.setNewSpot(newSpot);
      vm.copySpot = true;
      submit('/spotTab/' + id + '/spot');
    }

    // Get the form fields
    function getFields(value, key) {
      $log.log('Loading ' + key + ' ....');
      var csvFile = DataModelsFactory.dataModels[key];
      DataModelsFactory.readCSV(csvFile, function (fields) {
        $log.log('Finished loading ' + key + ' : ', fields);
        vm.fields[key] = fields;
      });
    }

    function loadForms() {
      // Start loading fields for all forms except traces form in first tab
      vm.fields._3dstructures_survey = {};
      vm.fields._3dstructures_choices = {};
      vm.fields.sample_survey = {};
      vm.fields.sample_choices = {};
      _.forEach(vm.fields, getFields);

      // Loaded traces form in factory before controller since traces are on the first tab
      // Load traces fields
      vm.fields.traces_survey = SpotFormsFactory.getTracesSurvey();
      vm.fields.traces_choices = SpotFormsFactory.getTracesChoices();
    }

    // Set the form survey (and choices, if applicable)
    function setForm(tab) {
      switch (tab) {
        case 'spotTab._3dstructures':
          vm.survey = vm.fields._3dstructures_survey;
          vm.choices = vm.fields._3dstructures_choices;
          break;
        case 'spotTab.sample':
          vm.survey = vm.fields.sample_survey;
          vm.choices = vm.fields.sample_choices;
          break;
        case 'spotTab.spot':
          vm.survey = vm.fields.traces_survey;
          vm.choices = vm.fields.traces_choices;
          break;
      }
    }

    // Set the current spot
    function setSpot(id) {
      vm.spot = SpotFactory.getCurrentSpot();
      if (!vm.spot) {
        SpotFactory.setCurrentSpotById(id);
        vm.spot = SpotFactory.getCurrentSpot();
      }

      // Convert date string to Date type
      vm.spot.properties.date = new Date(vm.spot.properties.date);
      vm.spot.properties.time = new Date(vm.spot.properties.time);
      vm.spotTitle = vm.spot.properties.name;

      vm.spots = SpotFactory.getSpots();
      if (!_.isEmpty(vm.spots)) {
        vm.spots.forEach(function (obj, i) {
          // Check for image basemaps
          _.forEach(obj.images, function (image) {
            if (image.annotated) {
              image.annotated = true;
              ImageBasemapFactory.addImageBasemap(image);
            }
            else {
              image.annotated = false;
              ImageBasemapFactory.removeImageBasemap(image);
            }
          });
        });
      }
      vm.data = vm.spot.properties;
      $log.log('Spot loaded: ', vm.spot);
    }

    /**
     * Public Functions
     */

    // Delete the spot
    function deleteSpot() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spot',
        'template': 'Are you sure you want to delete this spot?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          SpotFactory.destroy(vm.data.id);
          $location.path('/app/spots');
        }
      });
    }

    // Get the max value allowed for a number field
    function getMax(constraint) {
      try {
        // Look for <= in constraint, followed by a space and then a number
        var regexMax = /<=\s(\d*)/i;
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
        // Look for >= in constraint, followed by a space and any number of digits
        var regexMin = />=\s(\d*)/i;
        // Return just the number
        return regexMin.exec(constraint)[1];
      }
      catch (e) {
        return undefined;
      }
    }

    function isOptionChecked(field, choice) {
      if (vm.spot) {
        if (vm.data[field]) {
          return vm.data[field].indexOf(choice) !== -1;
        }
      }
      else {
        return false;
      }
    }

    function loadTab(state) {
      vm.stateName = state.current.name;
      vm.survey = undefined;
      vm.choices = undefined;
      vm.copySpot = false;
      setSpot(state.params.spotId);
      setForm(vm.stateName);

      vm.showTrace = false;
      vm.showRockUnit = true;
      if (vm.spot.geometry && vm.spot.geometry.type === 'LineString') {
        vm.showTrace = true;
        vm.showRockUnit = false;
      }
    }

    function openSpot(id) {
      SpotFactory.clearCurrentSpot();
      $location.path('/spotTab/' + id + '/spot');
    }

    // Set the class for the select_multiple fields here because it is not working
    // to set the class in the html the same way as for the other fields
    function setSelMultClass(field) {
      if (field.required === 'true') {
        if (vm.data[field.name]) {
          if (vm.data[field.name].length > 0) {
            return 'no-errors';
          }
        }
        else {
          return 'has-errors';
        }
      }
      return 'no-errors';
    }

    function showActionsheet() {
      $ionicActionSheet.show({
        'titleText': 'Spot Actions',
        'buttons': [{
          'text': '<i class="icon ion-ios-copy"></i>Copy this Spot to a New Spot'
        }, {
          'text': '<i class="icon ion-help-circled"></i>What other Spot actions do we need here?'
        }],
        'cancelText': 'Cancel',
        'cancel': function () {
          $log.log('CANCELLED');
        },
        'buttonClicked': function (index) {
          $log.log('BUTTON CLICKED', index);
          switch (index) {
            case 0:
              copySpot();
              break;
            case 1:
              break;
          }
          return true;
        }
      });
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (show && field.default) {
        if (!vm.data[field.name]) vm.data[field.name] = field.default;
      }
      if (!show) {
        if (vm.data[field.name]) delete vm.data[field.name];
      }
      return show;
    }

    function showTab(tab) {
      var preferences = PreferencesFactory.getPreferencesData();
      return preferences[tab];
    }

    // Add or modify Spot
    function submit(toPath) {
      // Validate the form first
      if (vm.validateForm()) {
        $log.log('spot to save: ', vm.spot);

        // define the geojson feature type
        vm.spot.type = 'Feature';

        _.forEach(vm.spot.images, function (image) {
          if (image.annotated) {
            ImageBasemapFactory.addImageBasemap(image);
          }
          else {
            ImageBasemapFactory.removeImageBasemap(image);
          }
        });

        var found = _.find(vm.spots, function (spot) {
          return spot.properties.id === vm.data.id;
        });

        vm.spot.properties = vm.data;
        // Save the spot
        SpotFactory.save(vm.spot).then(function (data) {
          vm.spots = data;
          if (vm.copySpot) SpotFactory.clearCurrentSpot();
          if (!found) ProjectFactory.incrementSpotNumber();
          $location.path(toPath);
        });
      }
      vm.copySpot = false;
    }

    function toggleAcknowledgeChecked(field) {
      if (vm.data[field]) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Close Group?',
          'template': 'By closing this group you will be clearing any data in this group. Continue?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
          }
          else {
            $document[0].getElementById(field + 'Toggle').checked = true;
          }
        });
      }
      else {
        vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
      }
    }

    function toggleChecked(field, choice) {
      var i = -1;
      if (vm.data[field]) {
        i = vm.data[field].indexOf(choice);
      }
      else {
        vm.data[field] = [];
      }

      // If choice not already selected
      if (i === -1) {
        vm.data[field].push(choice);
      }
      // Choice has been unselected so remove it and delete if empty
      else {
        vm.data[field].splice(i, 1);
        if (vm.data[field].length === 0) {
          delete vm.data[field];
        }
      }
    }

    // Validate Spot Tab
    function validateForm() {
      switch (vm.stateName) {
        case 'spotTab.spot':
          if (!vm.data.name) {
            $ionicPopup.alert({
              'title': 'Validation Error!',
              'template': '<b>Spot Name</b> is required.'
            });
            return false;
          }
          if (vm.spot.geometry) {
            if (vm.spot.geometry.type === 'Point') {
              var geoError;
              if (!vm.spot.geometry.coordinates[0] && !vm.spot.geometry.coordinates[1]) {
                geoError = '<b>Latitude</b> and <b>longitude</b> are required.';
              }
              else if (!vm.spot.geometry.coordinates[0]) {
                geoError = '<b>Longitude</b> is required.';
              }
              else if (!vm.spot.geometry.coordinates[1]) {
                geoError = '<b>Latitude</b> is required.';
              }
              if (geoError) {
                $ionicPopup.alert({
                  'title': 'Validation Error!',
                  'template': geoError
                });
                return false;
              }
            }
          }
          break;
        case 'spotTab.sample':
          // Don't validate the sample tab if no sample fields are filled in
          var validateSample = false;
          _.each(vm.survey, function (field) {
            if (vm.data[field.name]) {
              validateSample = true;
            }
          });
          if (!validateSample) return true;
      }
      if (!vm.survey) return true;
      return vm.survey && FormFactory.validate(vm.survey, vm.data);
    }
  }
}());
