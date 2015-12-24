(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationController', OrientationController);

  OrientationController.$inject = ['$ionicPopup', '$location', '$log', '$state', 'FormFactory', 'ProjectFactory',
    'SpotFactory'];

  function OrientationController($ionicPopup, $location, $log, $state, FormFactory, ProjectFactory, SpotFactory) {
    var vm = this;

    vm.choices = {};
    vm.currentSpot = SpotFactory.getCurrentSpot();
    vm.data = {};
    vm.newOrientation = newOrientation;
    vm.returnToSpot = returnToSpot;
    vm.showField = showField;
    vm.survey = {};
    vm.submit = submit;
    vm.title = '';

    activate();

    /**
     * Private Functions
     */

    function activate() {
      var form = {};
      switch ($state.current.name) {
        case 'app.new-linear-orientation':
          form = FormFactory.getLinearOrientationForm();
          vm.title = 'New Linear Orienation';
          vm.data.orientation_type = 'linear_orientation';
          break;
        case 'app.new-planar-orientation':
          form = FormFactory.getPlanarOrientationForm();
          vm.title = 'New Planar Orientation';
          vm.data.orientation_type = 'planar_orientation';
          break;
        case 'app.new-tabular-zone-orientation':
          form = FormFactory.getTabularOrientationForm();
          vm.title = 'New Tabular Zone Orientation';
          vm.data.orientation_type = 'tabular_zone_orientation';
          break;
        case 'app.orientation':
          var i = SpotFactory.getCurrentOrientationIndex();
          var aI = SpotFactory.getCurrentAssociatedOrientationIndex();
          vm.data = vm.currentSpot.properties.orientation_data[i];
          if (angular.isDefined(aI)) vm.data = vm.data.associated_orientation[aI];
          switch (vm.data.orientation_type) {
            case 'linear_orientation':
              form = FormFactory.getLinearOrientationForm();
              vm.title = 'Linear Orientation';
              break;
            case 'planar_orientation':
              form = FormFactory.getPlanarOrientationForm();
              vm.title = 'Planar Orientation';
              break;
            case 'tabular_zone_orientation':
              form = FormFactory.getTabularOrientationForm();
              vm.title = 'Tabular Zone Orientation';
              break;
          }
          break;
      }
      vm.survey = form.survey;
      vm.choices = form.choices;
    }

    /**
     * Public Functions
     */

    function newOrientation() {
      $log.log('new');
    }

    function returnToSpot() {
      $location.path('/app/spotTab/' + vm.currentSpot.properties.id + '/orientation-data');
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit() {
      // Don't validate if no fields are filled in
      var validate = false;
      _.each(vm.survey, function (field) {
        if (vm.data[field.name]) {
          validate = true;
        }
      });
      if (!validate) {
        $location.path('/app/spotTab/' + vm.currentSpot.properties.id + '/orientation-data');
      }
      else {
        var valid = FormFactory.validate(vm.survey, vm.data);
        if (valid) {
          // If there is an index for a current orientation remove that orientation and
          // add the modifed data back in. If not, just push the new orientation data.
          var i = SpotFactory.getCurrentOrientationIndex();
          if (angular.isDefined(i)) {
            if ($state.current.name === 'app.new-linear-orientation' ||
              $state.current.name === 'app.new-planar-orientation' ||
              $state.current.name === 'app.new-tabular-zone-orientation') {
              if (!vm.currentSpot.properties.orientation_data[i].associated_orientation) {
                vm.currentSpot.properties.orientation_data[i].associated_orientation = [];
              }
              vm.currentSpot.properties.orientation_data[i].associated_orientation.push(vm.data);
            }
            else {
              var aI = SpotFactory.getCurrentAssociatedOrientationIndex();
              if (angular.isDefined(aI)) {
                vm.currentSpot.properties.orientation_data[i].associated_orientation.splice(aI, 1, vm.data);
              }
              else {
                vm.currentSpot.properties.orientation_data.splice(i, 1, vm.data);
              }
            }
          }
          else {
            if (!vm.currentSpot.properties.orientation_data) vm.currentSpot.properties.orientation_data = [];
            vm.currentSpot.properties.orientation_data.push(vm.data);
          }
          SpotFactory.setCurrentSpot(vm.currentSpot);
          $location.path('/app/spotTab/' + vm.currentSpot.properties.id + '/orientation-data');
        }
      }
    }
  }
}());
