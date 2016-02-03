(function () {
  'use strict';

  angular
    .module('app')
    .controller('RockUnitController', RockUnitController);

  RockUnitController.$inject = ['$ionicPopup', '$location', '$log', '$state', 'FormFactory', 'ProjectFactory',
    'SpotFactory'];

  function RockUnitController($ionicPopup, $location, $log, $state, FormFactory, ProjectFactory, SpotFactory) {
    var vm = this;
    var key = 'unit_label_abbreviation';

    vm.choices = {};
    vm.currentSpot = SpotFactory.getCurrentSpot();
    vm.data = {};
    vm.deleteRockUnit = deleteRockUnit;
    vm.newRockUnit = newRockUnit;
    vm.rockUnits = [];
    vm.showField = showField;
    vm.survey = {};
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = ProjectFactory.getRockUnitsSurvey();
      vm.choices = ProjectFactory.getRockUnitsChoices();
      vm.rockUnits = ProjectFactory.getRockUnits();

      if ($state.current.name !== 'app.new-rock-unit') vm.data = loadRockUnit();
    }

    // Get the rock unit description for current rock unit and remove this
    // from the current list of all rock units
    function loadRockUnit() {
      var rockUnit;
      vm.rockUnits = _.reject(vm.rockUnits, function (obj) {
        if (obj[key] === $state.params[key]) rockUnit = obj;
        return obj[key] === $state.params[key];
      });
      return rockUnit;
    }

    /**
     * Public Functions
     */

    function deleteRockUnit() {
      var used = SpotFactory.isRockUnitUsed(key, vm.data[key]);
      if (!used) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Rock Unit',
          'template': 'Are you sure you want to delete this rock unit?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            ProjectFactory.destroyRockUnit(key, vm.data[key]);
            $state.go('app.rock-units');
          }
        });
      }
      else {
        $ionicPopup.alert({
          'title': 'Unable to Delete',
          'template': 'This rock unit is being used in Spot ' + used.properties.name +
          '. Remove the rock unit from this Spot first.'
        });
      }
    }

    function newRockUnit() {
      $log.log('new');
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit(toPath) {
      // Don't validate if no fields are filled in
      var validate = false;
      _.each(vm.survey, function (field) {
        if (vm.data[field.name]) {
          validate = true;
        }
      });
      if (!validate) {
        $location.path(toPath);
      }
      else {
        var validLabel = true;
        _.each(vm.rockUnits, function (obj) {
          if (obj[key] === vm.data[key]) validLabel = false;
        });
        if (validLabel) {
          var valid = FormFactory.validate(vm.survey, vm.data);
          if (valid) {
            vm.rockUnits.push(vm.data);
            ProjectFactory.saveRockUnits(vm.rockUnits).then(function () {
              SpotFactory.updateSpotsWithRockUnit(key, vm.data);
              if (vm.currentSpot) {
                vm.currentSpot.properties.rock_unit = vm.data;
                SpotFactory.save(vm.currentSpot).then(function () {
                  $location.path(toPath);
                });
              }
              else {
                $location.path(toPath);
              }
            });
          }
        }
        else {
          $ionicPopup.alert({
            'title': 'Duplicate Label Error!',
            'template': 'The label ' + vm.data[key] + ' is already being used for another rock unit. Use a different label.'
          });
        }
      }
    }
  }
}());
