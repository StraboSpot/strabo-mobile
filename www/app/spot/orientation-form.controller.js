(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationFormController', OrientationFormController);

  OrientationFormController.$inject = ['$ionicPopup', '$log', '$scope', '$state', 'FormFactory', 'ProjectFactory',
    'SpotFactory'];

  function OrientationFormController($ionicPopup, $log, $scope, $state, FormFactory, ProjectFactory, SpotFactory) {
    var vm = this;
    var key = 'unit_label_abbreviation';

    vm.choices = {};
    vm.currentSpot = SpotFactory.getCurrentSpot();
    vm.data = {};
    vm.dataOriginal = {};
    vm.deleteOrientation = deleteOrientation;
    vm.isPristine = isPristine;
    vm.newOrientation = newOrientation;
    vm.returnToSpot = returnToSpot;
    vm.orientationType = '';
    vm.orientations = [];
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
          vm.title = 'Add Line';
          vm.orientationType = 'linear_orientation';
          break;
        case 'app.linear-orientation':
          form = FormFactory.getLinearOrientationForm();
          vm.title = 'Add Line';
          vm.orientationType = 'linear_orientation';
          break;
        case 'app.new-planar-orientation':
          form = FormFactory.getPlanarOrientationForm();
          vm.title = 'Add Plane';
          vm.orientationType = 'planar_orientation';
          break;
        case 'app.planar-orientation':
          form = FormFactory.getPlanarOrientationForm();
          vm.title = 'Add Plane';
          vm.orientationType = 'planar_orientation';
          break;
        case 'app.new-tabular-zone-orientation':
          form = FormFactory.getTabularOrientationForm();
          vm.title = 'Add Tabular Zone';
          vm.orientationType = 'tabular_zone_orientation';
          break;
        case 'app.tabular-zone-orientation':
          form = FormFactory.getTabularOrientationForm();
          vm.title = 'Add Tabular Zone';
          vm.orientationType = 'tabular_zone_orientation';
          break;
      }

      vm.survey = form.survey;
      vm.choices = form.choices;
      vm.orientations = SpotFactory.getOrientations();
      //vm.data = loadOrientation();
      vm.dataOriginal = vm.data;

      // Watch whether form has been modified or not
      $scope.$watch('vm.isPristine()', function (pristine) {
        vm.pristine = pristine;
      });
    }

    function isPristine() {
      vm.data = _.pick(vm.data, _.identity);
      return _.isEqual(vm.dataOriginal, vm.data);
    }

    // Get the current orientation and remove this from the current list of all orientations
    function loadOrientation() {
      var orientation = [];
      vm.orientations = _.reject(vm.orientations, function (obj) {
        if (obj[key] === $state.params[key]) orientation = obj;
        return obj[key] === $state.params[key];
      });
      return orientation;
    }

    /**
     * Public Functions
     */

    function deleteOrientation() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Orientation Measurement',
        'template': 'Are you sure you want to delete this orientation measurement?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.destroyRockUnit(key, vm.data[key]);
          $state.go('spotTab.orientation2');
        }
      });
    }

    function newOrientation() {
      $log.log('new');
    }

    function returnToSpot() {
      $state.go('spotTab.orientation2');
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit() {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        vm.data.orientation_type = vm.orientationType;
        vm.orientations.push(vm.data);
        vm.currentSpot.properties.orientation = vm.orientations;
        SpotFactory.setCurrentSpot(vm.currentSpot);
        $state.go('spotTab.orientation2');
      }
    }
  }
}());
