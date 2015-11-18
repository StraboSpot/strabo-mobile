(function () {
  'use strict';

  angular
    .module('app')
    .controller('PreferencesController', PreferencesController);

  PreferencesController.$inject = ['$scope', 'FormFactory', 'PreferencesFactory'];

  function PreferencesController($scope, FormFactory, PreferencesFactory) {
    var vm = this;

    vm.data = {};
    vm.dataOriginal = {};
    vm.isPristine = isPristine;
    vm.isValid = isValid;
    vm.pristine = true;
    vm.showField = showField;
    vm.survey = [];
    vm.toggleChecked = toggleChecked;
    vm.submit = submit;
    vm.valid = true;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = PreferencesFactory.getSurvey();
      vm.data = PreferencesFactory.getPreferencesData();
      vm.dataOriginal = vm.data;

      // Watch whether form has been modified or not
      $scope.$watch('vm.isPristine()', function (pristine) {
        vm.pristine = pristine;
      });

      // Watch whether form is valid
      $scope.$watch('vm.isValid()', function (valid) {
        vm.valid = valid;
      });
    }

    function isPristine() {
      vm.data = _.pick(vm.data, _.identity);
      return _.isEqual(vm.dataOriginal, vm.data);
    }

    function isValid() {
      return !$scope.straboForm.$invalid;
    }

    /**
     * Public Functions
     */

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(relevant) {
      return FormFactory.isRelevant(relevant, vm.data);
    }

    function submit() {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        PreferencesFactory.save(vm.data);
        vm.dataOriginal = vm.data;
      }
    }

    function toggleChecked(field) {
      if (vm.data[field]) {
        delete vm.data[field];
      }
      else {
        vm.data[field] = true;
      }
    }
  }
}());
