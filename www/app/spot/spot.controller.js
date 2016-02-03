(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$location', '$log',
    '$state', 'FormFactory', 'ImageBasemapFactory', 'PreferencesFactory', 'SpotFactory'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicActionSheet, $ionicHistory, $ionicPopup, $location, $log, $state,
                          FormFactory, ImageBasemapFactory, PreferencesFactory, SpotFactory) {
    var vm = this;
    var returnToMap = false;

    vm.choices = undefined;
    vm.data = {};
    vm.deleteSpot = deleteSpot;
    vm.getMax = getMax;
    vm.getMin = getMin;
    vm.goBack = goBack;
    vm.isOptionChecked = isOptionChecked;
    vm.loadTab = loadTab;
    vm.setSelMultClass = setSelMultClass;
    vm.showActionsheet = showActionsheet;
    vm.showField = showField;
    vm.showRadius = true;
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
    }

    // Create a new spot with the details from this spot
    function copyThisSpot() {
      var newSpot = _.omit(vm.spot, 'properties');
      newSpot.properties = _.omit(vm.data,
        ['name', 'id', 'date', 'time', 'modified_timestamp']);
      SpotFactory.setNewSpot(newSpot).then(function (id) {
        submit('/app/spotTab/' + id + '/spot');
      });
    }

    // Set the form survey (and choices, if applicable)
    function setForm(tab) {
      switch (tab) {
        case 'app.spotTab._3dstructures':
          vm.survey = FormFactory.getForm()._3dstructures_survey;
          vm.choices = FormFactory.getForm()._3dstructures_choices;
          break;
        case 'app.spotTab.sample':
          vm.survey = FormFactory.getForm().sample_survey;
          vm.choices = FormFactory.getForm().sample_choices;
          break;
        case 'app.spotTab.spot':
          vm.survey = FormFactory.getForm().traces_survey;
          vm.choices = FormFactory.getForm().traces_choices;
          break;
        default:
          vm.survey = undefined;
          vm.choices = undefined;
          break;
      }
    }

    // Set the current spot
    function setSpot(id) {
      SpotFactory.setCurrentSpotById(id);
      vm.spot = SpotFactory.getCurrentSpot();

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

    function goBack() {
      SpotFactory.clearCurrentSpot();
      if (returnToMap && vm.data.image_basemap) {
        submit('app/image-basemaps/' + vm.data.image_basemap);
      }
      else if (returnToMap && !vm.data.image_basemap) {
        submit('app/map');
      }
      else {
        submit('app/spots');
      }
      returnToMap = false;
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
      if ($ionicHistory.backView()) {
        if ($ionicHistory.backView().stateName === 'app.map' ||
          $ionicHistory.backView().stateName === 'app.image-basemap') {
          returnToMap = true;
        }
      }
      vm.stateName = state.current.name;
      vm.survey = undefined;
      vm.choices = undefined;
      setSpot(state.params.spotId);
      setForm(vm.stateName);

      vm.showTrace = false;
      vm.showRockUnit = true;
      if (vm.spot.geometry && vm.spot.geometry.type === 'LineString') {
        vm.showTrace = true;
        vm.showRockUnit = false;
      }
      if (vm.spot.geometry && vm.spot.geometry.type === 'Polygon') {
        vm.showRadius = false;
      }
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
              copyThisSpot();
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

        // Save the spot
        SpotFactory.save(vm.spot).then(function () {
          $location.path(toPath);
        });
      }
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
        case 'app.spotTab.spot':
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
        case 'app.spotTab.sample':
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
