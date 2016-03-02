(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicHistory', '$ionicPopover', '$ionicPopup', '$location', '$log', '$scope',
    '$state', 'FormFactory', 'PreferencesFactory', 'SpotFactory'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicHistory, $ionicPopover, $ionicPopup, $location, $log, $scope, $state,
                          FormFactory, PreferencesFactory, SpotFactory) {
    var vm = this;
    var returnToMap = false;

    vm.choices = undefined;
    vm.copyThisSpot = copyThisSpot;
    vm.data = {};
    vm.deleteSpot = deleteSpot;
    vm.getMax = getMax;
    vm.getMin = getMin;
    vm.goBack = goBack;
    vm.isOptionChecked = isOptionChecked;
    vm.loadTab = loadTab;
    vm.setSelMultClass = setSelMultClass;
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
      createPopover();
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/spot/spot-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      // Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        vm.popover.remove();
      });
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

      switch (vm.stateName) {
        case 'app.spotTab.spot':
          if (!vm.spot.properties.trace) vm.spot.properties.trace = {};
          vm.data = vm.spot.properties.trace;
          break;
        default:
          vm.data = vm.spot.properties;
          break;
      }

      $log.log('Spot loaded: ', vm.spot);
    }

    /**
     * Public Functions
     */

    // Create a new spot with the details from this spot
    function copyThisSpot() {
      vm.popover.hide();
      var newSpot = _.omit(vm.spot, 'properties');
      newSpot.properties = _.omit(vm.spot.properties,
        ['name', 'id', 'date', 'time', 'modified_timestamp']);
      SpotFactory.setNewSpot(newSpot).then(function (id) {
        submit('/app/spotTab/' + id + '/spot');
      });
    }

    // Delete the spot
    function deleteSpot() {
      if (SpotFactory.isSafeDelete(vm.spot)) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Spot',
          'template': 'Are you sure you want to delete this spot?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            SpotFactory.destroy(vm.spot.properties.id).then(function () {
              $location.path('/app/spots');
            });
          }
        });
      }
      else {
        $ionicPopup.alert({
          'title': 'Spot Deletion Prohibited!',
          'template': 'This Spot has at least one image being used as an image basemap. Remove any image basemaps' +
          ' from this Spot before deleting.'
        });
      }
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
      if (returnToMap && vm.spot.properties.image_basemap) {
        submit('app/image-basemaps/' + vm.spot.properties.image_basemap);
      }
      else if (returnToMap && !vm.spot.properties.image_basemap) submit('app/map');
      else submit('app/spots');
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
      SpotFactory.moveSpot = false;

      if ($ionicHistory.backView()) {
        if ($ionicHistory.backView().stateName === 'app.map' ||
          $ionicHistory.backView().stateName === 'app.image-basemap') {
          returnToMap = true;
        }
      }
      vm.stateName = state.current.name;
      setSpot(state.params.spotId);

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

    // Save the Spot
    function submit(toPath) {
      if (_.isEmpty(vm.spot.properties.trace)) delete vm.spot.properties.trace;

      // Validate the form first
      if (vm.validateForm()) {
        $log.log('Spot to save: ', vm.spot);
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
          if (res) vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
          else $document[0].getElementById(field + 'Toggle').checked = true;
        });
      }
      else vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
    }

    function toggleChecked(field, choice) {
      var i = -1;
      if (vm.data[field]) i = vm.data[field].indexOf(choice);
      else vm.data[field] = [];

      // If choice not already selected
      if (i === -1) vm.data[field].push(choice);
      // Choice has been unselected so remove it and delete if empty
      else {
        vm.data[field].splice(i, 1);
        if (vm.data[field].length === 0) delete vm.data[field];
      }
    }

    // Validate Spot Tab
    function validateForm() {
      switch (vm.stateName) {
        case 'app.spotTab.spot':
          if (!vm.spot.properties.name) {
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
              else if (!vm.spot.geometry.coordinates[0]) geoError = '<b>Longitude</b> is required.';
              else if (!vm.spot.geometry.coordinates[1]) geoError = '<b>Latitude</b> is required.';
              if (geoError) {
                $ionicPopup.alert({
                  'title': 'Validation Error!',
                  'template': geoError
                });
                return false;
              }
            }
          }
          return vm.survey && FormFactory.validate(vm.survey, vm.data);
        case 'app.spotTab._3dstructures':
          if (vm.survey && FormFactory.validate(vm.survey, vm.data)) {
            vm.spot.properties._3d_structures = vm.data;
            return true;
          }
          return false;

      }
      return true;
    }
  }
}());
