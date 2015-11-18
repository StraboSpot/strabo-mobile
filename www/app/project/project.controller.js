(function () {
  'use strict';

  angular
    .module('app')
    .controller('ProjectController', ProjectController);

  ProjectController.$inject = ['$scope', 'FormFactory', 'ProjectFactory'];

  function ProjectController($scope, FormFactory, ProjectFactory) {
    var vm = this;

    vm.data = {};
    vm.dataOriginal = {};
    vm.isPristine = isPristine;
    vm.isValid = isValid;
    vm.pristine = true;
    vm.showField = showField;
    vm.survey = [];
    vm.submit = submit;
    vm.valid = true;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = ProjectFactory.getSurvey();
      vm.data = ProjectFactory.getProjectData();
      vm.data = fixDates(vm.data);
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

    // Convert date string to Date type
    function fixDates(data) {
      if (data.start_date) data.start_date = new Date(data.start_date);
      if (data.end_date) data.end_date = new Date(data.end_date);
      return data;
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
        ProjectFactory.save(vm.data);
        vm.dataOriginal = vm.data;
      }
    }
  }
}());
