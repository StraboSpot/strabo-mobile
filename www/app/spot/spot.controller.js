(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicActionSheet', '$ionicPopup', '$location', '$log', '$scope', '$state',
    'DataModelsFactory', 'FormFactory', 'ImageBasemapFactory', 'PreferencesFactory', 'ProjectFactory', 'SpotFactory',
    'SpotFormsFactory'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicActionSheet, $ionicPopup, $location, $log, $scope, $state, DataModelsFactory,
                          FormFactory, ImageBasemapFactory, PreferencesFactory, ProjectFactory, SpotFactory,
                          SpotFormsFactory) {
    var vm = this;

    vm.choices = null;
    vm.data = {};
    vm.fields = {};
    vm.getMax = getMax;
    vm.getMin = getMin;
    vm.goToSpots = goToSpots;
    vm.isAcknowledgeChecked = isAcknowledgeChecked;
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
    vm.submit = submit;
    vm.survey = null;
    vm.switchTabs = switchTabs;
    vm.toggleAcknowledgeChecked = toggleAcknowledgeChecked;
    vm.toggleChecked = toggleChecked;
    vm.validateFields = validateFields;
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
      newSpot.properties = _.omit(vm.spot.properties,
        ['name', 'id', 'date', 'time', 'modified_timestamp']);
      SpotFactory.setNewSpot(newSpot);
      loadSpot(undefined);
    }

    // Delete the spot
    function deleteSpot() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spot',
        'template': 'Are you sure you want to delete this spot?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          SpotFactory.destroy(vm.spot.properties.id);
          $location.path('/app/spots');
        }
      });
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

    // Load the form survey (and choices, if applicable)
    function loadForm(tab) {
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

    // Get the current spot
    function loadSpot(id) {
      if (!_.isEmpty(SpotFactory.getNewSpot())) {
        // Load spot stored in the SpotFactory factory
        vm.spot = SpotFactory.getNewSpot();
        SpotFactory.setCurrentSpot(vm.spot);
        vm.spot = SpotFactory.getCurrentSpot();
        // now clear the new spot from the factory because we have the info in our current scope
        SpotFactory.clearNewSpot();

        // Set default name
        var prefix = ProjectFactory.getSpotPrefix();
        if (!prefix) prefix = new Date().getTime().toString();
        var number = ProjectFactory.getSpotNumber();
        if (!number) number = '';
        vm.spot.properties.name = prefix + number;
        setProperties();
      }
      else {
        if (!_.isEmpty(SpotFactory.getCurrentSpot())) {
          vm.spot = SpotFactory.getCurrentSpot();
          $log.log('attempting to set properties2');
          setProperties();
        }
        else {
          SpotFactory.setCurrentSpotById(id);
          vm.spot = SpotFactory.getCurrentSpot();
          $log.log('attempting to set properties3');
          setProperties();
        }
      }
    }

    // Set or cleanup some of the properties of the vm
    function setProperties() {
      // Convert date string to Date type
      vm.spot.properties.date = new Date(vm.spot.properties.date);
      vm.spot.properties.time = new Date(vm.spot.properties.time);
      vm.spotTitle = vm.spot.properties.name;

      // Set default values for the spot
      if (vm.survey) {
        vm.survey = _.reject(vm.survey, function (field) {
          return ((field.type === 'start' && field.name === 'start') || (field.type === 'end' && field.name === 'end'));
        });

        _.each(vm.survey, function (field) {
          if (!vm.spot.properties[field.name] && field.default) {
            if (field.type === 'text' || field.type === 'note') {
              vm.spot.properties[field.name] = field.default;
            }
            else if (field.type === 'integer' && !isNaN(parseInt(field.default))) {
              vm.spot.properties[field.name] = parseInt(field.default);
            }
            else if (field.type.split(' ')[0] === 'select_one' || field.type.split(' ')[0] === 'select_multiple') {
              var curChoices = _.filter(vm.choices,
                function (choice) {
                  return choice['list name'] === field.type.split(' ')[1];
                }
              );
              // Check that default is in the list of choices for field
              if (_.findWhere(curChoices, {'name': field.default})) {
                if (field.type.split(' ')[0] === 'select_one') {
                  vm.spot.properties[field.name] = field.default;
                }
                else {
                  vm.spot.properties[field.name] = [];
                  vm.spot.properties[field.name].push(field.default);
                }
              }
            }
          }
        });
      }

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
        vm.data = vm.spot.properties;
      }
      $log.log('Spot loaded: ', vm.spot);
    }

    /**
     * Public Functions
     */

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

    function goToSpots() {
      $state.go('app.spots');
    }

    function isAcknowledgeChecked(field) {
      if (vm.spot) {
        if (vm.spot.properties[field]) {
          return true;
        }
      }
      else {
        return false;
      }
    }

    function isOptionChecked(field, choice) {
      if (vm.spot) {
        if (vm.spot.properties[field]) {
          return vm.spot.properties[field].indexOf(choice) !== -1;
        }
      }
      else {
        return false;
      }
    }

    function loadTab(state) {
      loadSpot(state.params.spotId);
      loadForm(state.current.name);

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
        if (vm.spot.properties[field.name]) {
          if (vm.spot.properties[field.name].length > 0) {
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
          'text': '<i class="icon ion-trash-b"></i>Delete this Spot'
        }, {
          'text': '<i class="icon ion-ios-copy"></i>Copy this Spot to a New Spot'
        }],
        'cancelText': 'Cancel',
        'cancel': function () {
          $log.log('CANCELLED');
        },
        'buttonClicked': function (index) {
          $log.log('BUTTON CLICKED', index);
          switch (index) {
            case 0:
              deleteSpot();
              break;
            case 1:
              copySpot();
              break;
          }
          return true;
        }
      });
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function showTab(tab) {
      var preferences = PreferencesFactory.getPreferencesData();
      return preferences[tab];
    }

    // Add or modify Spot
    function submit() {
      // Validate the form first
      if (!vm.validateForm()) {
        return 0;
      }

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
        return spot.properties.id === vm.spot.properties.id;
      });

      // Save the spot
      SpotFactory.save(vm.spot).then(function (data) {
        vm.spots = data;
        SpotFactory.clearCurrentSpot();
        if (!found) ProjectFactory.incrementSpotNumber();
        $location.path('/app/spots');
        // $ionicHistory.goBack();
      });
    }

    // When switching tabs validate the form first (if the tab is based on a form),
    // save the properties for the current spot temporarily, then go to the new tab
    function switchTabs(toTab) {
      // Has the rock sample form been touched?
      if ($scope.$$childTail.SampleTabForm && !$scope.$$childTail.SampleTabForm.$pristine) {
        // yes
        if (!vm.validateForm()) {
          return 0;
        }
      }
      else {
        if (!vm.validateForm()) {
          return 0;
        }
      }

      $location.path('/spotTab/' + vm.spot.properties.id + '/' + toTab);
    }

    function toggleAcknowledgeChecked(field) {
      if (vm.spot.properties[field]) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Close Group?',
          'template': 'By closing this group you will be clearing any data in this group. Continue?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            vm.spot.properties = FormFactory.toggleAcknowledgeChecked(vm.spot.properties, field);
          }
          else {
            $document[0].getElementById(field + 'Toggle').checked = true;
          }
        });
      }
      else {
        vm.spot.properties = FormFactory.toggleAcknowledgeChecked(vm.spot.properties, field);
      }
    }

    function toggleChecked(field, choice) {
      var i = -1;
      if (vm.spot.properties[field]) {
        i = vm.spot.properties[field].indexOf(choice);
      }
      else {
        vm.spot.properties[field] = [];
      }

      // If choice not already selected
      if (i === -1) {
        vm.spot.properties[field].push(choice);
      }
      // Choice has been unselected so remove it and delete if empty
      else {
        vm.spot.properties[field].splice(i, 1);
        if (vm.spot.properties[field].length === 0) {
          delete vm.spot.properties[field];
        }
      }
    }

    // Validate Trace/Line Feature Form
    function validateFields(form) {
      $log.log('Validating form with spot:', vm.spot);
      var errorMessages = '';

      // If a field is visible and required but empty give the user an error message and return to the form
      _.each(form, function (field) {
        var ele = document.getElementById(field.name);
        if (getComputedStyle(ele).display !== 'none' && angular.isUndefined(vm.spot.properties[field.name])) {
          if (field.required === 'true') {
            errorMessages += '<b>' + field.label + '</b> Required!<br>';
          }
          else if (field.name in vm.spot.properties) {
            errorMessages += '<b>' + field.label + '</b> ' + field.constraint_message + '<br>';
          }
        }
        else if (getComputedStyle(ele).display === 'none') {
          delete vm.spot.properties[field.name];
        }
      });

      if (errorMessages) {
        $ionicPopup.alert({
          'title': 'Validation Error!',
          'template': 'Fix the following errors before continuing:<br>' + errorMessages
        });
        return false;
      }
      else {
        return true;
      }
    }

    // Validate Spot Tab
    function validateForm() {
      switch ($state.current.url.split('/').pop()) {
        case 'spot':
          if (!vm.spot.properties.name) {
            $ionicPopup.alert({
              'title': 'Validation Error!',
              'template': '<b>Spot Name</b> is required.'
            });
            return false;
          }
          if (!vm.validateFields(vm.survey)) {
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
      }
      return true;
    }
  }
}());
